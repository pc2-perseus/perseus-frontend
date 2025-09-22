// React imports
import React, { ChangeEvent } from "react";

// MUI imports
import {
    Alert,
    Autocomplete,
    Backdrop,
    Box,
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Select,
    SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Theme,
    Typography,
    useTheme,
} from "@mui/material";

// Icon imports
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

// Custom imports
import getProjectEdit from "../../api/getProjectEdit.ts";
import postProjectEdit from "../../api/postProjectEdit.ts";
import formatNumber from "../../utils/formatNumber.ts";
import ResourceValue from "../../interfaces/ResourceValue.ts";
import Resource from "../../interfaces/Resource.ts";
import LoadingBar from "../LoadingBar.tsx";

export interface ProjectEditField {
    id: string;
    name: string;
    value: string;
    options?: string[];
}

export interface ProjectEditSelectable {
    id: string;
    name: string;
    value: { label: string; value: string };
    options: { label: string; value: string }[];
}

export interface ProjectEditAddable {
    id: string;
    name: string;
    values: { label: string; value: string }[];
    options: { label: string; value: string }[];
}

export default function ProjectEdit({
    projectId,
}: {
    projectId?: string;
}): React.ReactElement {
    const [fields, setFields] = React.useState<ProjectEditField[] | null>(null);
    const [selectables, setSelectables] = React.useState<
        ProjectEditSelectable[] | null
    >(null);
    const [addables, setAddables] = React.useState<ProjectEditAddable[] | null>(
        null
    );
    const [requestedResources, setRequestedResources] = React.useState<
        ResourceValue[]
    >([]);
    const [editedRequestedResources, setEditedRequestedResources] =
        React.useState<ResourceValue[]>([]);
    const [requestedResourcesOptions, setRequestedResourcesOptions] =
        React.useState<Resource[]>([]);
    const [grantedResources, setGrantedResources] = React.useState<
        ResourceValue[]
    >([]);
    const [editedGrantedResources, setEditedGrantedResources] = React.useState<
        ResourceValue[]
    >([]);
    const [grantedResourcesOptions, setGrantedResourcesOptions] =
        React.useState<Resource[]>([]);
    const [dialogRequestedResourcesOpen, setDialogRequestedResourcesOpen] =
        React.useState<boolean>(false);
    const [dialogGrantedResourcesOpen, setDialogGrantedResourcesOpen] =
        React.useState<boolean>(false);
    const [newRequestedResource, setNewRequestedResource] =
        React.useState<ResourceValue>({
            _id: null,
            files: {},
            file_tags: {},
            resource_id: "",
            start: "",
            end: "",
            value: 0,
            compute_project_id: null,
            partitions: [],
            overwrites: [],
            priority: 0,
            blocked: false,
        });
    const [newGrantedResource, setNewGrantedResource] =
        React.useState<ResourceValue>({
            _id: null,
            files: {},
            file_tags: {},
            resource_id: "",
            start: "",
            end: "",
            value: 0,
            compute_project_id: null,
            partitions: [],
            overwrites: [],
            priority: 0,
            blocked: false,
        });

    const [changedFields, updateChangedFields] = React.useState<
        { id: string; newValue: string | string[] }[]
    >([]);
    const [submitComment, setSubmitComment] = React.useState<string>("");

    const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
    const [loaderOpen, setLoaderOpen] = React.useState<boolean>(false);
    const [responseAlert, setResponseAlert] = React.useState<null | boolean>(
        null
    );

    const theme: Theme = useTheme();

    function changeValue(
        value: string | string[] | null,
        id: string,
        editedRequestR: ResourceValue[] | undefined = undefined,
        editedGrantedR: ResourceValue[] | undefined = undefined
    ) {
        let flag: boolean = false;
        let resourceFlag: boolean = false;
        let del: number = -1;
        const val: string | string[] = value === null ? "" : value;
        changedFields.forEach(
            (
                item: { id: string; newValue: string | string[] },
                index: number
            ) => {
                if (item.id === id) {
                    flag = true;
                    fields?.forEach((field) => {
                        if (field.id === id && field.value === val) {
                            del = index;
                        }
                    });
                    selectables?.forEach((field) => {
                        if (field.id === id && field.value.value === val) {
                            del = index;
                        }
                    });
                    addables?.forEach((field) => {
                        if (
                            field.id === id &&
                            field.values.map((f) => f.value) === val
                        ) {
                            del = index;
                        }
                    });
                    requestedResourcesOptions.forEach((option: Resource) => {
                        if (option.id === id && val === item.newValue) {
                            resourceFlag = true;
                            del = index;
                        } else if (option.id === id && val !== item.newValue) {
                            flag = false;
                        }
                    });
                    if (del === -1 && flag) {
                        changedFields[index].newValue = val;
                    }
                }
            }
        );
        if ((flag || resourceFlag) && del !== -1) {
            changedFields.splice(del, 1);
        } else if (!flag) {
            changedFields.push({ id: id, newValue: val });
        }

        const changedFieldNames: (string | undefined)[] = changedFields.map(
            (item: { id: string; newValue: string | string[] }) => {
                let name: string = "";
                let value: string | string[] = item.newValue;
                let oldValue: string = "";
                fields?.forEach((field) => {
                    if (field.id === item.id) {
                        name = field.name;
                        oldValue = field.value;
                    }
                });
                selectables?.forEach((field) => {
                    if (field.id === item.id) {
                        field.options.forEach((opt) => {
                            if (opt.value === value) {
                                value = opt.label;
                            }
                        });
                        name = field.name;
                        oldValue = field.value.label;
                    }
                });
                addables?.forEach((field) => {
                    if (field.id === item.id) {
                        const nv: string[] = [];
                        field.options.forEach((opt) => {
                            if (value.includes(opt.value)) {
                                nv.push(opt.label);
                            }
                        });
                        value = nv.join(", ");
                        name = field.name;
                        oldValue = field.values.map((v) => v.label).join(", ");
                    }
                });
                let resourceChanges: string | null = null;
                let flag3: boolean = false;
                requestedResourcesOptions.forEach((option: Resource) => {
                    let flag1: boolean = false;
                    let flag2: boolean = false;
                    if (
                        item.newValue === "requested" &&
                        option.id === item.id
                    ) {
                        const eR: ResourceValue[] =
                            editedRequestR !== undefined
                                ? editedRequestR
                                : editedRequestedResources;
                        eR.forEach((editValue: ResourceValue) => {
                            if (editValue.resource_id === item.id) {
                                flag1 = true;
                                requestedResources.forEach(
                                    (originValue: ResourceValue) => {
                                        if (
                                            originValue.resource_id ===
                                            editValue.resource_id
                                        ) {
                                            flag2 = true;
                                            const resChanges: string[] = [];
                                            if (
                                                originValue.value !==
                                                editValue.value
                                            ) {
                                                resChanges.push("value");
                                            }
                                            if (
                                                originValue.start !==
                                                editValue.start
                                            ) {
                                                resChanges.push("start");
                                            }
                                            if (
                                                originValue.end !==
                                                editValue.end
                                            ) {
                                                resChanges.push("end");
                                            }
                                            if (resChanges.length > 0) {
                                                resourceChanges =
                                                    option.name +
                                                    " requested (changed";
                                                if (
                                                    resChanges.includes("start")
                                                ) {
                                                    resourceChanges +=
                                                        " start from '" +
                                                        originValue.start +
                                                        "' to '" +
                                                        editValue.start +
                                                        "'";
                                                }
                                                if (
                                                    resChanges.includes("end")
                                                ) {
                                                    resourceChanges +=
                                                        (resChanges.includes(
                                                            "start"
                                                        )
                                                            ? ","
                                                            : "") +
                                                        " end from '" +
                                                        originValue.end +
                                                        "' to '" +
                                                        editValue.end +
                                                        "'";
                                                }
                                                if (
                                                    resChanges.includes("value")
                                                ) {
                                                    resourceChanges +=
                                                        (resChanges.length > 1
                                                            ? ","
                                                            : "") +
                                                        " value from '" +
                                                        originValue.value +
                                                        "' to '" +
                                                        editValue.value +
                                                        "'";
                                                }
                                                resourceChanges += ")";
                                            } else {
                                                flag3 = true;
                                            }
                                        }
                                    }
                                );
                                if (!flag2) {
                                    resourceChanges =
                                        option.name +
                                        " requested (added with runtime " +
                                        editValue.start +
                                        " - " +
                                        editValue.end +
                                        " and value " +
                                        editValue.value +
                                        ")";
                                }
                            }
                        });
                        if (!flag1) {
                            requestedResources.forEach(
                                (originValue: ResourceValue) => {
                                    if (originValue.resource_id === item.id) {
                                        resourceChanges =
                                            option.name +
                                            " requested (removed)";
                                    }
                                }
                            );
                        }
                    } else if (
                        item.newValue === "granted" &&
                        option.id === item.id
                    ) {
                        const eR: ResourceValue[] =
                            editedGrantedR !== undefined
                                ? editedGrantedR
                                : editedGrantedResources;
                        eR.forEach((editValue: ResourceValue) => {
                            if (editValue.resource_id === item.id) {
                                flag1 = true;
                                grantedResources.forEach(
                                    (originValue: ResourceValue) => {
                                        if (
                                            originValue.resource_id ===
                                            editValue.resource_id
                                        ) {
                                            flag2 = true;
                                            const resChanges: string[] = [];
                                            if (
                                                originValue.value !==
                                                editValue.value
                                            ) {
                                                resChanges.push("value");
                                            }
                                            if (
                                                originValue.start !==
                                                editValue.start
                                            ) {
                                                resChanges.push("start");
                                            }
                                            if (
                                                originValue.end !==
                                                editValue.end
                                            ) {
                                                resChanges.push("end");
                                            }
                                            if (resChanges.length > 0) {
                                                resourceChanges =
                                                    option.name +
                                                    " granted (changed";
                                                if (
                                                    resChanges.includes("start")
                                                ) {
                                                    resourceChanges +=
                                                        " start from '" +
                                                        originValue.start +
                                                        "' to '" +
                                                        editValue.start +
                                                        "'";
                                                }
                                                if (
                                                    resChanges.includes("end")
                                                ) {
                                                    resourceChanges +=
                                                        (resChanges.includes(
                                                            "start"
                                                        )
                                                            ? ","
                                                            : "") +
                                                        " end from '" +
                                                        originValue.end +
                                                        "' to '" +
                                                        editValue.end +
                                                        "'";
                                                }
                                                if (
                                                    resChanges.includes("value")
                                                ) {
                                                    resourceChanges +=
                                                        (resChanges.length > 1
                                                            ? ","
                                                            : "") +
                                                        " value from '" +
                                                        originValue.value +
                                                        "' to '" +
                                                        editValue.value +
                                                        "'";
                                                }
                                                resourceChanges += ")";
                                            } else {
                                                flag3 = true;
                                            }
                                        }
                                    }
                                );
                                if (!flag2) {
                                    resourceChanges =
                                        option.name +
                                        " granted (added with runtime " +
                                        editValue.start +
                                        " - " +
                                        editValue.end +
                                        " and value " +
                                        editValue.value +
                                        ")";
                                }
                            }
                        });
                        if (!flag1) {
                            grantedResources.forEach(
                                (originValue: ResourceValue) => {
                                    if (originValue.resource_id === item.id) {
                                        resourceChanges =
                                            option.name + " granted (removed)";
                                    }
                                }
                            );
                        }
                    }
                });

                if (flag3) {
                    return undefined;
                }

                if (resourceChanges !== null) {
                    return resourceChanges;
                }
                return name + " (from '" + oldValue + "' to '" + value + "')";
            }
        );
        if (changedFieldNames.length === 0) {
            setSubmitComment("");
        } else if (changedFieldNames.length === 1) {
            setSubmitComment(
                "Changed following attribute:\n" + changedFieldNames.join("\n")
            );
        } else {
            setSubmitComment(
                "Changed following attributes:\n" + changedFieldNames.join("\n")
            );
        }

        updateChangedFields(JSON.parse(JSON.stringify(changedFields)));
    }

    function getResourceName(id: string, options: Resource[]): string {
        let name: string = "";
        options.forEach((resource: Resource) => {
            if (resource.id === id) {
                name = resource.name;
            }
        });
        return name;
    }

    function getResourceCluster(id: string, options: Resource[]): string {
        let cluster: string = "";
        options.forEach((resource: Resource) => {
            if (resource.id === id) {
                cluster = resource.cluster_id;
            }
        });
        return cluster;
    }

    function reset() {
        window.location.reload();
    }

    function submit() {
        setDialogOpen(false);
        setLoaderOpen(true);
        const changes: {
            [key: string]: string | number | object;
        } = {};
        changedFields.forEach((cf) => {
            changes[cf.id] = cf.newValue;
        });
        changes["requested_resources"] = editedRequestedResources;
        changes["granted_resources"] = editedGrantedResources;
        changes["comment"] = submitComment;
        postProjectEdit(projectId === undefined ? "" : projectId, changes).then(
            (result: boolean) => {
                setResponseAlert(result);
                setLoaderOpen(false);
            }
        );
    }

    React.useEffect(() => {
        if (projectId !== undefined) {
            getProjectEdit(projectId).then(
                (result: {
                    editable: ProjectEditField[];
                    selectable: ProjectEditSelectable[];
                    addable: ProjectEditAddable[];
                    requested_resources: {
                        values: ResourceValue[];
                        options: Resource[];
                    };
                    granted_resources: {
                        values: ResourceValue[];
                        options: Resource[];
                    };
                }) => {
                    setFields(JSON.parse(JSON.stringify(result.editable)));
                    setSelectables(
                        JSON.parse(JSON.stringify(result.selectable))
                    );
                    setAddables(JSON.parse(JSON.stringify(result.addable)));
                    setRequestedResources(
                        JSON.parse(
                            JSON.stringify(result.requested_resources.values)
                        )
                    );
                    setEditedRequestedResources(
                        JSON.parse(
                            JSON.stringify(result.requested_resources.values)
                        )
                    );
                    setRequestedResourcesOptions(
                        JSON.parse(
                            JSON.stringify(result.requested_resources.options)
                        )
                    );
                    setGrantedResources(
                        JSON.parse(
                            JSON.stringify(result.granted_resources.values)
                        )
                    );
                    setEditedGrantedResources(
                        JSON.parse(
                            JSON.stringify(result.granted_resources.values)
                        )
                    );
                    setGrantedResourcesOptions(
                        JSON.parse(
                            JSON.stringify(result.granted_resources.options)
                        )
                    );
                }
            );
        }
    }, [projectId]);

    if (fields === null || selectables === null || addables === null) {
        return <LoadingBar />;
    }

    return (
        <>
            <Box>
                <Typography variant="h2" sx={{ fontSize: "2.5em", mb: 3 }}>
                    General
                </Typography>
                {fields.map((field) => {
                    return (
                        <Grid container sx={{ my: 1 }} key={field.id}>
                            <Grid size={{ xs: 12, md: 5, lg: 3, xl: 2 }}>
                                <Typography sx={{ pt: "8.5px" }}>
                                    {field.name}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 7, lg: 9, xl: 10 }}>
                                {field.options === undefined ? (
                                    <TextField
                                        size="small"
                                        multiline={field.value.length > 60}
                                        label=""
                                        defaultValue={field.value}
                                        fullWidth
                                        onChange={(
                                            event: ChangeEvent<HTMLInputElement>
                                        ) => {
                                            changeValue(
                                                event.currentTarget.value,
                                                field.id
                                            );
                                        }}
                                    />
                                ) : (
                                    <Autocomplete
                                        renderInput={(params) => (
                                            <TextField {...params} label="" />
                                        )}
                                        size="small"
                                        options={field.options}
                                        defaultValue={
                                            field.value === ""
                                                ? undefined
                                                : field.value
                                        }
                                        onChange={(_, value: string | null) => {
                                            changeValue(
                                                value === null ? "" : value,
                                                field.id
                                            );
                                        }}
                                        freeSolo
                                        fullWidth
                                    />
                                )}
                            </Grid>
                        </Grid>
                    );
                })}
                {selectables.map((selectable) => {
                    return (
                        <Grid container sx={{ my: 1 }} key={selectable.id}>
                            <Grid size={{ xs: 12, md: 5, lg: 3, xl: 2 }}>
                                <Typography sx={{ pt: "8.5px" }}>
                                    {selectable.name}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 7, lg: 9, xl: 10 }}>
                                <Autocomplete
                                    renderInput={(params) => (
                                        <TextField {...params} />
                                    )}
                                    size="small"
                                    options={selectable.options}
                                    getOptionLabel={(option) => option.label}
                                    isOptionEqualToValue={(o, v) =>
                                        o.value === v.value
                                    }
                                    defaultValue={
                                        selectable.value.value === ""
                                            ? undefined
                                            : selectable.value
                                    }
                                    fullWidth
                                    onChange={(_, value) => {
                                        if (value !== null) {
                                            changeValue(
                                                value.value,
                                                selectable.id
                                            );
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    );
                })}
                {addables.map((addable) => {
                    return (
                        <Grid container sx={{ my: 1 }} key={addable.id}>
                            <Grid size={{ xs: 12, md: 5, lg: 3, xl: 2 }}>
                                <Typography sx={{ pt: "8.5px" }}>
                                    {addable.name}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 7, lg: 9, xl: 10 }}>
                                <Autocomplete
                                    renderInput={(params) => (
                                        <TextField {...params} label="" />
                                    )}
                                    size="small"
                                    options={addable.options}
                                    getOptionLabel={(option) => option.label}
                                    isOptionEqualToValue={(o, v) =>
                                        o.value === v.value
                                    }
                                    defaultValue={addable.values}
                                    fullWidth
                                    multiple
                                    onChange={(_, values) => {
                                        if (values !== null) {
                                            changeValue(
                                                values.map((v) => v.value),
                                                addable.id
                                            );
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    );
                })}
                <Divider sx={{ my: 3 }} />
                <Typography variant="h2" sx={{ fontSize: "2.5em", mb: 3 }}>
                    Requested Resources
                </Typography>
                <Card variant="outlined" sx={{ width: "100%" }}>
                    <TableContainer>
                        <Table sx={{ width: "100%" }} size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Resource</TableCell>
                                    <TableCell>Cluster</TableCell>
                                    <TableCell>Start</TableCell>
                                    <TableCell>End</TableCell>
                                    <TableCell>Requested</TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => {
                                                let start = "";
                                                let end = "";
                                                if (
                                                    editedRequestedResources.length >
                                                    0
                                                ) {
                                                    start =
                                                        editedRequestedResources[0]
                                                            .start;
                                                    end =
                                                        editedRequestedResources[0]
                                                            .end;
                                                } else {
                                                    fields?.forEach((field) => {
                                                        if (
                                                            field.id === "start"
                                                        ) {
                                                            start = field.value;
                                                        } else if (
                                                            field.id === "end"
                                                        ) {
                                                            end = field.value;
                                                        }
                                                    });
                                                }
                                                setNewRequestedResource({
                                                    _id: null,
                                                    files: {},
                                                    file_tags: {},
                                                    resource_id: "",
                                                    start: start,
                                                    end: end,
                                                    value: 0,
                                                    compute_project_id: null,
                                                    partitions: [],
                                                    overwrites: [],
                                                    priority: 0,
                                                    blocked: false,
                                                });

                                                setDialogRequestedResourcesOpen(
                                                    true
                                                );
                                            }}
                                        >
                                            <AddIcon
                                                sx={{
                                                    color: theme.palette.primary
                                                        .main,
                                                }}
                                            />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {editedRequestedResources.map(
                                    (entry, index: number) => {
                                        const borderStyle =
                                            index + 1 ===
                                            editedRequestedResources.length
                                                ? {
                                                      borderBottomWidth: "0px",
                                                  }
                                                : {};

                                        return (
                                            <TableRow key={index}>
                                                <TableCell sx={borderStyle}>
                                                    {getResourceName(
                                                        entry.resource_id,
                                                        requestedResourcesOptions
                                                    )}
                                                </TableCell>
                                                <TableCell sx={borderStyle}>
                                                    {getResourceCluster(
                                                        entry.resource_id,
                                                        requestedResourcesOptions
                                                    )}
                                                </TableCell>
                                                <TableCell sx={borderStyle}>
                                                    {new Date(
                                                        entry.start
                                                    ).toUTCString()}
                                                </TableCell>
                                                <TableCell sx={borderStyle}>
                                                    {new Date(
                                                        entry.end
                                                    ).toUTCString()}
                                                </TableCell>
                                                <TableCell sx={borderStyle}>
                                                    {formatNumber(entry.value)}
                                                </TableCell>
                                                <TableCell sx={borderStyle}>
                                                    <IconButton
                                                        onClick={() => {
                                                            const filtered: ResourceValue[] =
                                                                editedRequestedResources.filter(
                                                                    (item) =>
                                                                        item.resource_id !==
                                                                        entry.resource_id
                                                                );
                                                            setEditedRequestedResources(
                                                                JSON.parse(
                                                                    JSON.stringify(
                                                                        filtered
                                                                    )
                                                                )
                                                            );
                                                            changeValue(
                                                                "requested",
                                                                entry.resource_id,
                                                                filtered,
                                                                undefined
                                                            );
                                                        }}
                                                    >
                                                        <DeleteIcon
                                                            sx={{
                                                                color: theme
                                                                    .palette
                                                                    .error.main,
                                                            }}
                                                        />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Dialog
                        open={dialogRequestedResourcesOpen}
                        onClose={() => {
                            setDialogRequestedResourcesOpen(false);
                        }}
                        maxWidth="md"
                        fullWidth
                    >
                        <DialogTitle>Add a requested resource</DialogTitle>
                        <DialogContent>
                            <FormControl fullWidth sx={{ mt: 2 }}>
                                <InputLabel>Resource</InputLabel>
                                <Select
                                    label="Resource"
                                    value={newRequestedResource.resource_id}
                                    onChange={(event: SelectChangeEvent) => {
                                        newRequestedResource.resource_id =
                                            event.target.value;
                                        setNewRequestedResource(
                                            JSON.parse(
                                                JSON.stringify(
                                                    newRequestedResource
                                                )
                                            )
                                        );
                                    }}
                                >
                                    {requestedResourcesOptions.map(
                                        (resource: Resource) => {
                                            let flag: boolean = false;
                                            editedRequestedResources.forEach(
                                                (rr: ResourceValue) => {
                                                    if (
                                                        rr.resource_id ===
                                                        resource.id
                                                    ) {
                                                        flag = true;
                                                    }
                                                }
                                            );
                                            if (flag) {
                                                return (
                                                    <React.Fragment
                                                        key={resource.id}
                                                    ></React.Fragment>
                                                );
                                            } else {
                                                return (
                                                    <MenuItem
                                                        value={resource.id}
                                                        key={resource.id}
                                                    >
                                                        {resource.name}
                                                    </MenuItem>
                                                );
                                            }
                                        }
                                    )}
                                </Select>
                            </FormControl>
                            <TextField
                                label="Start"
                                variant="outlined"
                                value={newRequestedResource.start}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    newRequestedResource.start =
                                        event.currentTarget.value;
                                    setNewRequestedResource(
                                        JSON.parse(
                                            JSON.stringify(newRequestedResource)
                                        )
                                    );
                                }}
                                fullWidth
                                sx={{ mt: 2 }}
                            />
                            <TextField
                                label="End"
                                variant="outlined"
                                value={newRequestedResource.end}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    newRequestedResource.end =
                                        event.currentTarget.value;
                                    setNewRequestedResource(
                                        JSON.parse(
                                            JSON.stringify(newRequestedResource)
                                        )
                                    );
                                }}
                                fullWidth
                                sx={{ mt: 2 }}
                            />
                            <TextField
                                label="Value"
                                variant="outlined"
                                value={newRequestedResource.value}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    newRequestedResource.value = Number(
                                        event.currentTarget.value
                                    );
                                    setNewRequestedResource(
                                        JSON.parse(
                                            JSON.stringify(newRequestedResource)
                                        )
                                    );
                                }}
                                fullWidth
                                sx={{ mt: 2 }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setDialogRequestedResourcesOpen(false);
                                    editedRequestedResources.push(
                                        newRequestedResource
                                    );
                                    setEditedRequestedResources(
                                        JSON.parse(
                                            JSON.stringify(
                                                editedRequestedResources
                                            )
                                        )
                                    );

                                    changeValue(
                                        "requested",
                                        newRequestedResource.resource_id,
                                        editedRequestedResources
                                    );
                                }}
                            >
                                Add resource
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Card>

                <Divider sx={{ my: 3 }} />
                <Typography variant="h2" sx={{ fontSize: "2.5em", mb: 3 }}>
                    Granted Resources
                </Typography>
                <Card variant="outlined" sx={{ width: "100%" }}>
                    <TableContainer>
                        <Table sx={{ width: "100%" }} size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Resource</TableCell>
                                    <TableCell>Cluster</TableCell>
                                    <TableCell>Start</TableCell>
                                    <TableCell>End</TableCell>
                                    <TableCell>Granted</TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => {
                                                let start = "";
                                                let end = "";
                                                if (
                                                    editedGrantedResources.length >
                                                    0
                                                ) {
                                                    start =
                                                        editedGrantedResources[0]
                                                            .start;
                                                    end =
                                                        editedGrantedResources[0]
                                                            .end;
                                                } else {
                                                    fields?.forEach((field) => {
                                                        if (
                                                            field.id === "start"
                                                        ) {
                                                            start = field.value;
                                                        } else if (
                                                            field.id === "end"
                                                        ) {
                                                            end = field.value;
                                                        }
                                                    });
                                                }
                                                setNewGrantedResource({
                                                    _id: null,
                                                    files: {},
                                                    file_tags: {},
                                                    resource_id: "",
                                                    start: start,
                                                    end: end,
                                                    value: 0,
                                                    compute_project_id: null,
                                                    partitions: [],
                                                    overwrites: [],
                                                    priority: 0,
                                                    blocked: false,
                                                });

                                                setDialogGrantedResourcesOpen(
                                                    true
                                                );
                                            }}
                                        >
                                            <AddIcon
                                                sx={{
                                                    color: theme.palette.primary
                                                        .main,
                                                }}
                                            />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {editedGrantedResources.map(
                                    (entry, index: number) => {
                                        const borderStyle =
                                            index + 1 ===
                                            editedGrantedResources.length
                                                ? {
                                                      borderBottomWidth: "0px",
                                                  }
                                                : {};

                                        return (
                                            <TableRow key={index}>
                                                <TableCell sx={borderStyle}>
                                                    {getResourceName(
                                                        entry.resource_id,
                                                        grantedResourcesOptions
                                                    )}
                                                </TableCell>
                                                <TableCell sx={borderStyle}>
                                                    {getResourceCluster(
                                                        entry.resource_id,
                                                        grantedResourcesOptions
                                                    )}
                                                </TableCell>
                                                <TableCell sx={borderStyle}>
                                                    {new Date(
                                                        entry.start
                                                    ).toUTCString()}
                                                </TableCell>
                                                <TableCell sx={borderStyle}>
                                                    {new Date(
                                                        entry.end
                                                    ).toUTCString()}
                                                </TableCell>
                                                <TableCell sx={borderStyle}>
                                                    {formatNumber(entry.value)}
                                                </TableCell>
                                                <TableCell sx={borderStyle}>
                                                    <IconButton
                                                        onClick={() => {
                                                            const filtered: ResourceValue[] =
                                                                editedGrantedResources.filter(
                                                                    (item) =>
                                                                        item.resource_id !==
                                                                        entry.resource_id
                                                                );
                                                            setEditedGrantedResources(
                                                                JSON.parse(
                                                                    JSON.stringify(
                                                                        filtered
                                                                    )
                                                                )
                                                            );
                                                            changeValue(
                                                                "granted",
                                                                entry.resource_id,
                                                                undefined,
                                                                filtered
                                                            );
                                                        }}
                                                    >
                                                        <DeleteIcon
                                                            sx={{
                                                                color: theme
                                                                    .palette
                                                                    .error.main,
                                                            }}
                                                        />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Dialog
                        open={dialogGrantedResourcesOpen}
                        onClose={() => {
                            setDialogGrantedResourcesOpen(false);
                        }}
                        maxWidth="md"
                        fullWidth
                    >
                        <DialogTitle>Add a granted resource</DialogTitle>
                        <DialogContent>
                            <FormControl fullWidth sx={{ mt: 2 }}>
                                <InputLabel>Resource</InputLabel>
                                <Select
                                    label="Resource"
                                    value={newGrantedResource.resource_id}
                                    onChange={(event: SelectChangeEvent) => {
                                        newGrantedResource.resource_id =
                                            event.target.value;
                                        setNewGrantedResource(
                                            JSON.parse(
                                                JSON.stringify(
                                                    newGrantedResource
                                                )
                                            )
                                        );
                                    }}
                                >
                                    {grantedResourcesOptions.map(
                                        (resource: Resource) => {
                                            return (
                                                <MenuItem
                                                    value={resource.id}
                                                    key={resource.id}
                                                >
                                                    {resource.name}
                                                </MenuItem>
                                            );
                                        }
                                    )}
                                </Select>
                            </FormControl>
                            <TextField
                                label="Start"
                                variant="outlined"
                                value={newGrantedResource.start}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    newGrantedResource.start =
                                        event.currentTarget.value;
                                    setNewGrantedResource(
                                        JSON.parse(
                                            JSON.stringify(newGrantedResource)
                                        )
                                    );
                                }}
                                fullWidth
                                sx={{ mt: 2 }}
                            />
                            <TextField
                                label="End"
                                variant="outlined"
                                value={newGrantedResource.end}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    newGrantedResource.end =
                                        event.currentTarget.value;
                                    setNewGrantedResource(
                                        JSON.parse(
                                            JSON.stringify(newGrantedResource)
                                        )
                                    );
                                }}
                                fullWidth
                                sx={{ mt: 2 }}
                            />
                            <TextField
                                label="Value"
                                variant="outlined"
                                value={newGrantedResource.value}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    newGrantedResource.value = Number(
                                        event.currentTarget.value
                                    );
                                    setNewGrantedResource(
                                        JSON.parse(
                                            JSON.stringify(newGrantedResource)
                                        )
                                    );
                                }}
                                fullWidth
                                sx={{ mt: 2 }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setDialogGrantedResourcesOpen(false);
                                    editedGrantedResources.push(
                                        newGrantedResource
                                    );
                                    setEditedGrantedResources(
                                        JSON.parse(
                                            JSON.stringify(
                                                editedGrantedResources
                                            )
                                        )
                                    );
                                    changeValue(
                                        "granted",
                                        newGrantedResource.resource_id,
                                        undefined,
                                        editedGrantedResources
                                    );
                                }}
                            >
                                Add resource
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Card>

                <Box sx={{ float: "right", mt: 3 }}>
                    <Button
                        variant="contained"
                        color="warning"
                        sx={{
                            mr: 2,
                            display:
                                changedFields.length === 0
                                    ? "none"
                                    : "inline-flex",
                        }}
                        onClick={reset}
                    >
                        Reset changes
                    </Button>
                    <Button
                        variant="contained"
                        disabled={changedFields.length === 0}
                        onClick={() => {
                            setDialogOpen(true);
                        }}
                    >
                        {changedFields.length === 0
                            ? "No changes yet"
                            : "Save Changes"}
                    </Button>
                </Box>
            </Box>
            <Dialog
                open={dialogOpen}
                maxWidth="md"
                fullWidth
                onClose={() => {
                    setDialogOpen(false);
                }}
            >
                <DialogTitle>Confirm your changes</DialogTitle>
                <DialogContent>
                    You are about to change the following items:
                    <List>
                        {changedFields.map(
                            (item: {
                                id: string;
                                newValue: string | string[];
                            }) => {
                                let name: string = "";
                                let value: string | string[] = item.newValue;
                                let oldValue: string = "";
                                let options: string[] = [];
                                fields.forEach((field) => {
                                    if (field.id == item.id) {
                                        name = field.name;
                                        oldValue = field.value;
                                        if (field.options !== undefined) {
                                            options = field.options;
                                        }
                                    }
                                });
                                selectables.forEach((field) => {
                                    if (field.id == item.id) {
                                        field.options.forEach((opt) => {
                                            if (opt.value === value) {
                                                value = opt.label;
                                            }
                                        });
                                        name = field.name;
                                        oldValue = field.value.label;
                                        field.options.forEach((opt) => {
                                            options.push(opt.value);
                                        });
                                    }
                                });
                                addables.forEach((field) => {
                                    if (field.id == item.id) {
                                        const nv: string[] = [];
                                        field.options.forEach((opt) => {
                                            if (value.includes(opt.value)) {
                                                nv.push(opt.label);
                                            }
                                        });
                                        value = nv.join(", ");
                                        name = field.name;
                                        oldValue = field.values
                                            .map((v) => v.label)
                                            .join(", ");
                                        field.options.forEach((opt) => {
                                            options.push(opt.value);
                                        });
                                    }
                                });
                                if (name.length === 0) {
                                    return;
                                }
                                return (
                                    <ListItem key={item.id}>
                                        <ListItemText
                                            primary={
                                                name +
                                                " (from '" +
                                                oldValue +
                                                "' to  '" +
                                                value +
                                                "')"
                                            }
                                            secondary={
                                                options.length > 0 &&
                                                typeof item.newValue ===
                                                    "string" &&
                                                !options.includes(
                                                    item.newValue
                                                ) ? (
                                                    <Typography color="error">
                                                        WARNING: The new value
                                                        is no default option!
                                                    </Typography>
                                                ) : (
                                                    <></>
                                                )
                                            }
                                        />
                                    </ListItem>
                                );
                            }
                        )}
                        {changedFields.map(
                            (item: {
                                id: string;
                                newValue: string | string[];
                            }) => {
                                let resourceChanges: string | null = null;
                                let flag3: boolean = false;
                                requestedResourcesOptions.forEach(
                                    (option: Resource) => {
                                        let flag1: boolean = false;
                                        let flag2: boolean = false;
                                        if (
                                            item.newValue === "requested" &&
                                            option.id === item.id
                                        ) {
                                            editedRequestedResources.forEach(
                                                (editValue: ResourceValue) => {
                                                    if (
                                                        editValue.resource_id ===
                                                        item.id
                                                    ) {
                                                        flag1 = true;
                                                        requestedResources.forEach(
                                                            (
                                                                originValue: ResourceValue
                                                            ) => {
                                                                if (
                                                                    originValue.resource_id ===
                                                                    editValue.resource_id
                                                                ) {
                                                                    flag2 =
                                                                        true;
                                                                    const resChanges: string[] =
                                                                        [];
                                                                    if (
                                                                        originValue.value !==
                                                                        editValue.value
                                                                    ) {
                                                                        resChanges.push(
                                                                            "value"
                                                                        );
                                                                    }
                                                                    if (
                                                                        originValue.start !==
                                                                        editValue.start
                                                                    ) {
                                                                        resChanges.push(
                                                                            "start"
                                                                        );
                                                                    }
                                                                    if (
                                                                        originValue.end !==
                                                                        editValue.end
                                                                    ) {
                                                                        resChanges.push(
                                                                            "end"
                                                                        );
                                                                    }
                                                                    if (
                                                                        resChanges.length >
                                                                        0
                                                                    ) {
                                                                        resourceChanges =
                                                                            option.name +
                                                                            " requested (changed";
                                                                        if (
                                                                            resChanges.includes(
                                                                                "start"
                                                                            )
                                                                        ) {
                                                                            resourceChanges +=
                                                                                " start from '" +
                                                                                originValue.start +
                                                                                "' to '" +
                                                                                editValue.start +
                                                                                "'";
                                                                        }
                                                                        if (
                                                                            resChanges.includes(
                                                                                "end"
                                                                            )
                                                                        ) {
                                                                            resourceChanges +=
                                                                                (resChanges.includes(
                                                                                    "start"
                                                                                )
                                                                                    ? ","
                                                                                    : "") +
                                                                                " end from '" +
                                                                                originValue.end +
                                                                                "' to '" +
                                                                                editValue.end +
                                                                                "'";
                                                                        }
                                                                        if (
                                                                            resChanges.includes(
                                                                                "value"
                                                                            )
                                                                        ) {
                                                                            resourceChanges +=
                                                                                (resChanges.length >
                                                                                1
                                                                                    ? ","
                                                                                    : "") +
                                                                                " value from '" +
                                                                                originValue.value +
                                                                                "' to '" +
                                                                                editValue.value +
                                                                                "'";
                                                                        }
                                                                        resourceChanges +=
                                                                            ")";
                                                                    } else {
                                                                        flag3 =
                                                                            true;
                                                                    }
                                                                }
                                                            }
                                                        );
                                                        if (!flag2) {
                                                            resourceChanges =
                                                                option.name +
                                                                " requested (added with runtime " +
                                                                editValue.start +
                                                                " - " +
                                                                editValue.end +
                                                                " and value " +
                                                                editValue.value +
                                                                ")";
                                                        }
                                                    }
                                                }
                                            );
                                            if (!flag1) {
                                                requestedResources.forEach(
                                                    (
                                                        originValue: ResourceValue
                                                    ) => {
                                                        if (
                                                            originValue.resource_id ===
                                                            item.id
                                                        ) {
                                                            resourceChanges =
                                                                option.name +
                                                                " requested (removed)";
                                                        }
                                                    }
                                                );
                                            }
                                        } else if (
                                            item.newValue === "granted" &&
                                            option.id === item.id
                                        ) {
                                            editedGrantedResources.forEach(
                                                (editValue: ResourceValue) => {
                                                    if (
                                                        editValue.resource_id ===
                                                        item.id
                                                    ) {
                                                        flag1 = true;
                                                        grantedResources.forEach(
                                                            (
                                                                originValue: ResourceValue
                                                            ) => {
                                                                if (
                                                                    originValue.resource_id ===
                                                                    editValue.resource_id
                                                                ) {
                                                                    flag2 =
                                                                        true;
                                                                    const resChanges: string[] =
                                                                        [];
                                                                    if (
                                                                        originValue.value !==
                                                                        editValue.value
                                                                    ) {
                                                                        resChanges.push(
                                                                            "value"
                                                                        );
                                                                    }
                                                                    if (
                                                                        originValue.start !==
                                                                        editValue.start
                                                                    ) {
                                                                        resChanges.push(
                                                                            "start"
                                                                        );
                                                                    }
                                                                    if (
                                                                        originValue.end !==
                                                                        editValue.end
                                                                    ) {
                                                                        resChanges.push(
                                                                            "end"
                                                                        );
                                                                    }
                                                                    if (
                                                                        resChanges.length >
                                                                        0
                                                                    ) {
                                                                        resourceChanges =
                                                                            option.name +
                                                                            " granted (changed";
                                                                        if (
                                                                            resChanges.includes(
                                                                                "start"
                                                                            )
                                                                        ) {
                                                                            resourceChanges +=
                                                                                " start from '" +
                                                                                originValue.start +
                                                                                "' to '" +
                                                                                editValue.start +
                                                                                "'";
                                                                        }
                                                                        if (
                                                                            resChanges.includes(
                                                                                "end"
                                                                            )
                                                                        ) {
                                                                            resourceChanges +=
                                                                                (resChanges.includes(
                                                                                    "start"
                                                                                )
                                                                                    ? ","
                                                                                    : "") +
                                                                                " end from '" +
                                                                                originValue.end +
                                                                                "' to '" +
                                                                                editValue.end +
                                                                                "'";
                                                                        }
                                                                        if (
                                                                            resChanges.includes(
                                                                                "value"
                                                                            )
                                                                        ) {
                                                                            resourceChanges +=
                                                                                (resChanges.length >
                                                                                1
                                                                                    ? ","
                                                                                    : "") +
                                                                                " value from '" +
                                                                                originValue.value +
                                                                                "' to '" +
                                                                                editValue.value +
                                                                                "'";
                                                                        }
                                                                        resourceChanges +=
                                                                            ")";
                                                                    } else {
                                                                        flag3 =
                                                                            true;
                                                                    }
                                                                }
                                                            }
                                                        );
                                                        if (!flag2) {
                                                            resourceChanges =
                                                                option.name +
                                                                " granted (added with runtime " +
                                                                editValue.start +
                                                                " - " +
                                                                editValue.end +
                                                                " and value " +
                                                                editValue.value +
                                                                ")";
                                                        }
                                                    }
                                                }
                                            );
                                            if (!flag1) {
                                                grantedResources.forEach(
                                                    (
                                                        originValue: ResourceValue
                                                    ) => {
                                                        if (
                                                            originValue.resource_id ===
                                                            item.id
                                                        ) {
                                                            resourceChanges =
                                                                option.name +
                                                                " granted (removed)";
                                                        }
                                                    }
                                                );
                                            }
                                        }
                                    }
                                );

                                if (flag3) {
                                    return;
                                }

                                if (resourceChanges !== null) {
                                    return (
                                        <ListItem key={item.id}>
                                            <ListItemText
                                                primary={resourceChanges}
                                            />
                                        </ListItem>
                                    );
                                }
                                return;
                            }
                        )}
                    </List>
                    Please be aware that submitting these changes will cause
                    them to directly change in the database. This can cause side
                    effects depending on what data you are editing.
                    <Box sx={{ mt: 5 }}>
                        <TextField
                            label="Comment"
                            value={submitComment}
                            onChange={(
                                event: ChangeEvent<HTMLInputElement>
                            ) => {
                                setSubmitComment(event.currentTarget.value);
                            }}
                            fullWidth
                            multiline
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                            setDialogOpen(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={submit}
                    >
                        Save changes
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={responseAlert !== null}
                onClose={() => {
                    if (responseAlert === false) {
                        setResponseAlert(null);
                    } else {
                        window.location.href = `${import.meta.env.BASE_URL}ProjectSearch/${projectId}`;
                    }
                }}
            >
                <Alert
                    sx={{ display: responseAlert === null ? "none" : "flex" }}
                    severity={responseAlert ? "success" : "error"}
                    variant="filled"
                >
                    {responseAlert
                        ? "Your changes have been submitted successfully."
                        : "An error occurred. Please try again later."}
                    <br />
                    Please click anywhere to proceed.
                </Alert>
            </Dialog>
            <Backdrop open={loaderOpen}>
                <LoadingBar />
            </Backdrop>
        </>
    );
}
