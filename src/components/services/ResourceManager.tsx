// React imports
import React from "react";

// MUI imports
import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    List,
    ListItemButton,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view";

// Icon imports
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

// Custom imports
import Cluster from "../../interfaces/Cluster.ts";
import Resource from "../../interfaces/Resource.ts";
import Limit from "../../interfaces/Limit.ts";
import getResourceManagerData from "../../api/getResourceManagerData.ts";
import postCluster from "../../api/postCluster.ts";
import postResource from "../../api/postResource.ts";
import postLimit from "../../api/postLimit.ts";
import LoadingBar from "../LoadingBar.tsx";
import SearchBar from "../SearchBar.tsx";
import DecimalTextField from "../DecimalTextField.tsx";
import {
    scaledDecimalInputToNumber,
    scaledValueToDecimalString,
} from "../../utils/decimalUnits.ts";

function resourceBoundsErrors(resource: Resource | null): {
    minMaxError: string | null;
    defaultValueError: string | null;
} {
    if (resource === null) {
        return { minMaxError: null, defaultValueError: null };
    }

    const { minimum, maximum, default_value } = resource;

    const minMaxError =
        minimum !== null && maximum !== null && minimum > maximum
            ? "Minimum cannot be greater than maximum"
            : null;

    const defaultValueError =
        default_value !== null && minimum !== null && default_value < minimum
            ? "Default value cannot be less than minimum"
            : default_value !== null &&
                maximum !== null &&
                default_value > maximum
              ? "Default value cannot be greater than maximum"
              : null;

    return { minMaxError, defaultValueError };
}

function flattenResourceTree(
    allResources: Resource[],
    resources: Resource[],
    depth: number
): { resource: Resource; depth: number }[] {
    return resources.flatMap((resource) => [
        { resource, depth },
        ...flattenResourceTree(
            allResources,
            allResources.filter((r) => r.parent_oid === resource._id),
            depth + 1
        ),
    ]);
}

export default function ResourceManager(): React.ReactElement {
    const [loading, setLoading] = React.useState<boolean>(true);
    const [clusters, setClusters] = React.useState<Cluster[]>([]);
    const [resources, setResources] = React.useState<Resource[]>([]);
    const [limits, setLimits] = React.useState<Limit[]>([]);

    const [clusterEdit, setClusterEdit] = React.useState<Cluster | null>(null);
    const [resourceEdit, setResourceEdit] = React.useState<Resource | null>(
        null
    );
    const [limitEdit, setLimitEdit] = React.useState<Limit | null>(null);

    const [searchFilter, setSearchFilter] = React.useState<string>("");

    function editCluster() {
        if (clusterEdit !== null) {
            setLoading(true);
            postCluster(clusterEdit).then((result) => {
                if (result) {
                    getResourceManagerData().then((response) => {
                        setClusters(response.clusters);
                        setResources(response.resources);
                        setLimits(response.limits);
                        setClusterEdit(null);
                        setLoading(false);
                    });
                } else {
                    setLoading(false);
                }
            });
        }
    }

    function editResource() {
        if (resourceEdit !== null) {
            setLoading(true);
            postResource(resourceEdit).then((result) => {
                if (result) {
                    getResourceManagerData().then((response) => {
                        setClusters(response.clusters);
                        setResources(response.resources);
                        setLimits(response.limits);
                        setResourceEdit(null);
                        setLoading(false);
                    });
                } else {
                    setLoading(false);
                }
            });
        }
    }

    function editLimit() {
        if (limitEdit !== null) {
            setLoading(true);
            postLimit(limitEdit).then((result) => {
                if (result) {
                    getResourceManagerData().then((response) => {
                        setClusters(response.clusters);
                        setResources(response.resources);
                        setLimits(response.limits);
                        setLimitEdit(null);
                        setLoading(false);
                    });
                } else {
                    setLoading(false);
                }
            });
        }
    }

    React.useEffect(() => {
        getResourceManagerData().then((response) => {
            setClusters(response.clusters);
            setResources(response.resources);
            setLimits(response.limits);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <LoadingBar />;
    }

    const filteredClusters = clusters.filter((cluster) => {
        return cluster.name.toLowerCase().includes(searchFilter);
    });

    const filteredLimits = limits.filter((limit) => {
        return limit.name.toLowerCase().includes(searchFilter);
    });

    const { minMaxError, defaultValueError } =
        resourceBoundsErrors(resourceEdit);

    return (
        <Box>
            <SearchBar
                onSearch={(value: string) =>
                    setSearchFilter(value.toLowerCase())
                }
                actionTitle="Add cluster"
                actionIcon={<AddIcon />}
                onAction={() =>
                    setClusterEdit({
                        id: "",
                        name: "",
                    })
                }
            />
            <Stack spacing={1} sx={{ mt: 2 }}>
                {filteredClusters.map((cluster, index: number) => {
                    return (
                        <Paper elevation={16} sx={{ p: 2 }} key={index}>
                            <Typography
                                variant="h5"
                                component="span"
                                gutterBottom
                            >
                                {cluster.name}
                            </Typography>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => {
                                    setClusterEdit(
                                        JSON.parse(JSON.stringify(cluster))
                                    );
                                }}
                                sx={{ float: "right" }}
                            >
                                <EditIcon />
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => {
                                    setResourceEdit({
                                        id: "",
                                        cluster_id: cluster.id,
                                        name: "",
                                        display_unit: null,
                                        display_unit_factor: 1,
                                        resource_type: "cumulative",
                                        parent_oid: null,
                                        default_partitions: [],
                                        trackable_resources: [],
                                        minimum: null,
                                        maximum: null,
                                        default_value: null,
                                    });
                                }}
                                sx={{ float: "right", mx: 1 }}
                            >
                                <AddIcon />
                            </Button>
                            <List sx={{ mt: 2, py: 0 }}>
                                {(() => {
                                    const clusterResources = resources.filter(
                                        (r) => r.cluster_id === cluster.id
                                    );
                                    const rootResources =
                                        clusterResources.filter(
                                            (r) =>
                                                r.parent_oid === null ||
                                                !clusterResources.some(
                                                    (p) =>
                                                        p._id === r.parent_oid
                                                )
                                        );
                                    return flattenResourceTree(
                                        clusterResources,
                                        rootResources,
                                        0
                                    ).map(({ resource, depth }, index2) => (
                                        <ListItemButton
                                            key={index2}
                                            sx={{ pl: 2 + depth * 2 }}
                                            onClick={() =>
                                                setResourceEdit(
                                                    JSON.parse(
                                                        JSON.stringify(
                                                            resource
                                                        )
                                                    )
                                                )
                                            }
                                        >
                                            <ListItemText
                                                primary={resource.name}
                                            />
                                        </ListItemButton>
                                    ));
                                })()}
                            </List>
                        </Paper>
                    );
                })}
                {filteredLimits.length == 0 ? (
                    ""
                ) : (
                    <Paper elevation={16} sx={{ p: 2 }}>
                        <Typography variant="h5" component="span" gutterBottom>
                            Limits
                        </Typography>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                                setLimitEdit({
                                    id: "",
                                    name: "",
                                    display_unit: null,
                                    display_unit_factor: 1,
                                });
                            }}
                            sx={{ float: "right" }}
                        >
                            <AddIcon />
                        </Button>
                        <SimpleTreeView disableSelection sx={{ mt: 2 }}>
                            {filteredLimits.map((limit, index: number) => {
                                return (
                                    <TreeItem
                                        itemId={index.toString()}
                                        key={index}
                                        onClick={() => {
                                            setLimitEdit(
                                                JSON.parse(
                                                    JSON.stringify(limit)
                                                )
                                            );
                                        }}
                                        label={limit.name}
                                    />
                                );
                            })}
                        </SimpleTreeView>
                    </Paper>
                )}
            </Stack>
            <Dialog
                open={clusterEdit !== null}
                onClose={() => {
                    setClusterEdit(null);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {clusterEdit === null || clusterEdit.id.length === 0
                        ? "Add"
                        : "Edit"}{" "}
                    cluster
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <TextField
                            variant="outlined"
                            label="ID"
                            value={clusterEdit?.id}
                            disabled={clusterEdit?._id !== undefined}
                            onChange={(e) => {
                                if (clusterEdit !== null) {
                                    clusterEdit.id = e.currentTarget.value;
                                    setClusterEdit(
                                        JSON.parse(JSON.stringify(clusterEdit))
                                    );
                                }
                            }}
                        />
                        <TextField
                            variant="outlined"
                            label="Name"
                            value={clusterEdit?.name}
                            onChange={(e) => {
                                if (clusterEdit !== null) {
                                    clusterEdit.name = e.currentTarget.value;
                                    setClusterEdit(
                                        JSON.parse(JSON.stringify(clusterEdit))
                                    );
                                }
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setClusterEdit(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={editCluster}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={resourceEdit !== null}
                onClose={() => {
                    setResourceEdit(null);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {resourceEdit === null || resourceEdit.id.length === 0
                        ? "Add"
                        : "Edit"}{" "}
                    resource
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <TextField
                            variant="outlined"
                            label="ID"
                            value={resourceEdit?.id}
                            disabled={resourceEdit?._id !== undefined}
                            onChange={(e) => {
                                if (resourceEdit !== null) {
                                    resourceEdit.id = e.currentTarget.value;
                                    setResourceEdit(
                                        JSON.parse(JSON.stringify(resourceEdit))
                                    );
                                }
                            }}
                        />
                        <TextField
                            variant="outlined"
                            label="Cluster ID"
                            value={resourceEdit?.cluster_id}
                            disabled
                        />
                        <FormControl fullWidth>
                            <InputLabel>Type</InputLabel>
                            <Select
                                variant="outlined"
                                label="Type"
                                value={resourceEdit?.resource_type}
                                onChange={(e) => {
                                    if (resourceEdit !== null) {
                                        resourceEdit.resource_type = e.target
                                            .value as "cumulative" | "snapshot";
                                        setResourceEdit(
                                            JSON.parse(
                                                JSON.stringify(resourceEdit)
                                            )
                                        );
                                    }
                                }}
                            >
                                <MenuItem value="cumulative">
                                    cumulative
                                </MenuItem>
                                <MenuItem value="snapshot">snapshot</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            variant="outlined"
                            label="Name"
                            value={resourceEdit?.name}
                            onChange={(e) => {
                                if (resourceEdit !== null) {
                                    resourceEdit.name = e.currentTarget.value;
                                    setResourceEdit(
                                        JSON.parse(JSON.stringify(resourceEdit))
                                    );
                                }
                            }}
                        />
                        <TextField
                            variant="outlined"
                            label="Displayed unit"
                            value={resourceEdit?.display_unit}
                            onChange={(e) => {
                                if (resourceEdit !== null) {
                                    resourceEdit.display_unit =
                                        e.currentTarget.value;
                                    setResourceEdit(
                                        JSON.parse(JSON.stringify(resourceEdit))
                                    );
                                }
                            }}
                        />
                        <TextField
                            variant="outlined"
                            label="Displayed unit factor"
                            type="number"
                            inputProps={{ step: "0.01" }}
                            value={resourceEdit?.display_unit_factor}
                            onChange={(e) => {
                                if (resourceEdit !== null) {
                                    resourceEdit.display_unit_factor = Number(
                                        e.currentTarget.value
                                    );
                                    setResourceEdit(
                                        JSON.parse(JSON.stringify(resourceEdit))
                                    );
                                }
                            }}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Parent</InputLabel>
                            <Select
                                variant="outlined"
                                label="Parent"
                                value={resourceEdit?.parent_oid ?? ""}
                                onChange={(e) => {
                                    if (resourceEdit !== null) {
                                        resourceEdit.parent_oid =
                                            e.target.value === ""
                                                ? null
                                                : (e.target.value as string);
                                        setResourceEdit(
                                            JSON.parse(
                                                JSON.stringify(resourceEdit)
                                            )
                                        );
                                    }
                                }}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {resources
                                    .filter(
                                        (r) =>
                                            r.cluster_id ===
                                                resourceEdit?.cluster_id &&
                                            r._id !== resourceEdit?._id
                                    )
                                    .map((r) => (
                                        <MenuItem key={r._id} value={r._id}>
                                            {r.name}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                        <Autocomplete
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Default partitions"
                                    helperText="Press enter to add a new partition"
                                />
                            )}
                            options={[]}
                            freeSolo
                            value={resourceEdit?.default_partitions ?? []}
                            fullWidth
                            multiple
                            onChange={(_, values) => {
                                if (resourceEdit !== null) {
                                    resourceEdit.default_partitions =
                                        values as string[];
                                    setResourceEdit(
                                        JSON.parse(JSON.stringify(resourceEdit))
                                    );
                                }
                            }}
                        />
                        <Autocomplete
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Trackable resources"
                                    helperText="Press enter to add a new trackable resource"
                                />
                            )}
                            options={[]}
                            freeSolo
                            value={resourceEdit?.trackable_resources ?? []}
                            fullWidth
                            multiple
                            onChange={(_, values) => {
                                if (resourceEdit !== null) {
                                    resourceEdit.trackable_resources =
                                        values as string[];
                                    setResourceEdit(
                                        JSON.parse(JSON.stringify(resourceEdit))
                                    );
                                }
                            }}
                        />
                        <DecimalTextField
                            variant="outlined"
                            label={
                                "Minimum" +
                                (resourceEdit?.display_unit
                                    ? " (" + resourceEdit.display_unit + ")"
                                    : "")
                            }
                            value={
                                resourceEdit?.minimum === null ||
                                resourceEdit?.minimum === undefined
                                    ? ""
                                    : scaledValueToDecimalString(
                                          resourceEdit.minimum,
                                          resourceEdit.display_unit_factor
                                      )
                            }
                            onValueChange={(value) => {
                                if (resourceEdit !== null) {
                                    resourceEdit.minimum =
                                        value === ""
                                            ? null
                                            : scaledDecimalInputToNumber(
                                                  value,
                                                  resourceEdit.display_unit_factor
                                              );
                                    setResourceEdit(
                                        JSON.parse(JSON.stringify(resourceEdit))
                                    );
                                }
                            }}
                            error={minMaxError !== null}
                            helperText={minMaxError ?? undefined}
                            fullWidth
                        />
                        <DecimalTextField
                            variant="outlined"
                            label={
                                "Maximum" +
                                (resourceEdit?.display_unit
                                    ? " (" + resourceEdit.display_unit + ")"
                                    : "")
                            }
                            value={
                                resourceEdit?.maximum === null ||
                                resourceEdit?.maximum === undefined
                                    ? ""
                                    : scaledValueToDecimalString(
                                          resourceEdit.maximum,
                                          resourceEdit.display_unit_factor
                                      )
                            }
                            onValueChange={(value) => {
                                if (resourceEdit !== null) {
                                    resourceEdit.maximum =
                                        value === ""
                                            ? null
                                            : scaledDecimalInputToNumber(
                                                  value,
                                                  resourceEdit.display_unit_factor
                                              );
                                    setResourceEdit(
                                        JSON.parse(JSON.stringify(resourceEdit))
                                    );
                                }
                            }}
                            error={minMaxError !== null}
                            helperText={minMaxError ?? undefined}
                            fullWidth
                        />
                        <DecimalTextField
                            variant="outlined"
                            label={
                                "Default value" +
                                (resourceEdit?.display_unit
                                    ? " (" + resourceEdit.display_unit + ")"
                                    : "")
                            }
                            value={
                                resourceEdit?.default_value === null ||
                                resourceEdit?.default_value === undefined
                                    ? ""
                                    : scaledValueToDecimalString(
                                          resourceEdit.default_value,
                                          resourceEdit.display_unit_factor
                                      )
                            }
                            onValueChange={(value) => {
                                if (resourceEdit !== null) {
                                    resourceEdit.default_value =
                                        value === ""
                                            ? null
                                            : scaledDecimalInputToNumber(
                                                  value,
                                                  resourceEdit.display_unit_factor
                                              );
                                    setResourceEdit(
                                        JSON.parse(JSON.stringify(resourceEdit))
                                    );
                                }
                            }}
                            error={defaultValueError !== null}
                            helperText={defaultValueError ?? undefined}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setResourceEdit(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={editResource}
                        disabled={
                            minMaxError !== null || defaultValueError !== null
                        }
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={limitEdit !== null}
                onClose={() => {
                    setLimitEdit(null);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {limitEdit === null || limitEdit.id.length === 0
                        ? "Add"
                        : "Edit"}{" "}
                    limit
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <TextField
                            variant="outlined"
                            label="ID"
                            value={limitEdit?.id}
                            disabled={limitEdit?._id !== undefined}
                            onChange={(e) => {
                                if (limitEdit !== null) {
                                    limitEdit.id = e.currentTarget.value;
                                    setLimitEdit(
                                        JSON.parse(JSON.stringify(limitEdit))
                                    );
                                }
                            }}
                        />
                        <TextField
                            variant="outlined"
                            label="Name"
                            value={limitEdit?.name}
                            onChange={(e) => {
                                if (limitEdit !== null) {
                                    limitEdit.name = e.currentTarget.value;
                                    setLimitEdit(
                                        JSON.parse(JSON.stringify(limitEdit))
                                    );
                                }
                            }}
                        />
                        <TextField
                            variant="outlined"
                            label="Displayed unit"
                            value={limitEdit?.display_unit}
                            onChange={(e) => {
                                if (limitEdit !== null) {
                                    limitEdit.display_unit =
                                        e.currentTarget.value;
                                    setLimitEdit(
                                        JSON.parse(JSON.stringify(limitEdit))
                                    );
                                }
                            }}
                        />
                        <TextField
                            variant="outlined"
                            label="Displayed unit factor"
                            type="number"
                            slotProps={{ htmlInput: { step: "0.01" } }}
                            value={limitEdit?.display_unit_factor}
                            onChange={(e) => {
                                if (limitEdit !== null) {
                                    limitEdit.display_unit_factor = Number(
                                        e.currentTarget.value
                                    );
                                    setLimitEdit(
                                        JSON.parse(JSON.stringify(limitEdit))
                                    );
                                }
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setLimitEdit(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={editLimit}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
