// React imports
import React, { ChangeEvent } from "react";

// MUI imports
import {
    Alert,
    Autocomplete,
    Backdrop,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    List,
    ListItem,
    ListItemText,
    TextField,
    Typography,
} from "@mui/material";

// Custom imports
import {
    ProjectEditAddable,
    ProjectEditField,
    ProjectEditSelectable,
} from "./ProjectEdit.tsx";
import getPersonEdit from "../../api/getPersonEdit.ts";
import postPersonEdit from "../../api/postPersonEdit.ts";
import LoadingBar from "../LoadingBar.tsx";

export default function PersonEdit({
    personId,
}: {
    personId?: string;
}): React.ReactElement {
    const [fields, setFields] = React.useState<ProjectEditField[] | null>(null);
    const [selectables, setSelectables] = React.useState<
        ProjectEditSelectable[] | null
    >(null);
    const [addables, setAddables] = React.useState<ProjectEditAddable[] | null>(
        null
    );

    const [changedFields, updateChangedFields] = React.useState<
        { id: string; newValue: string | string[] }[]
    >([]);
    const [submitComment, setSubmitComment] = React.useState<string>("");

    const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
    const [loaderOpen, setLoaderOpen] = React.useState<boolean>(false);
    const [responseAlert, setResponseAlert] = React.useState<null | boolean>(
        null
    );

    function changeValue(value: string | string[] | null, id: string) {
        let flag: boolean = false;
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
                    if (del === -1 && flag) {
                        changedFields[index].newValue = val;
                    }
                }
            }
        );
        if (flag && del !== -1) {
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
        postPersonEdit(personId === undefined ? "" : personId, changes).then(
            (result: boolean) => {
                setResponseAlert(result);
                setLoaderOpen(false);
            }
        );
    }

    React.useEffect(() => {
        if (personId !== undefined) {
            getPersonEdit(personId).then(
                (result: {
                    editable: ProjectEditField[];
                    selectable: ProjectEditSelectable[];
                    addable: ProjectEditAddable[];
                }) => {
                    setFields(JSON.parse(JSON.stringify(result.editable)));
                    setSelectables(
                        JSON.parse(JSON.stringify(result.selectable))
                    );
                    setAddables(JSON.parse(JSON.stringify(result.addable)));
                }
            );
        }
    }, [personId]);

    if (fields === null || selectables === null || addables === null) {
        return <LoadingBar />;
    }

    return (
        <>
            <Box>
                {fields.map((field) => {
                    return (
                        <Grid container sx={{ my: 1 }} key={field.id}>
                            <Grid size={{ xs: 12, md: 5, lg: 3, xl: 1 }}>
                                <Typography sx={{ pt: "8.5px" }}>
                                    {field.name}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 7, lg: 9, xl: 10 }}>
                                {field.options === undefined ? (
                                    <TextField
                                        size="small"
                                        multiline={
                                            (field.value ?? "").length > 60
                                        }
                                        label=""
                                        defaultValue={field.value ?? ""}
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
                                        onInputChange={(
                                            _,
                                            value: string | null
                                        ) => {
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
                        window.location.href = `${import.meta.env.BASE_URL}PersonSearch/${personId}`;
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
