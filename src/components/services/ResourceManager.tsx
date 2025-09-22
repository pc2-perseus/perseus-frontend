// React imports
import React from "react";

// MUI imports
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
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
                                    });
                                }}
                                sx={{ float: "right", mx: 1 }}
                            >
                                <AddIcon />
                            </Button>
                            <SimpleTreeView disableSelection sx={{ mt: 2 }}>
                                {resources
                                    .filter((r) => r.cluster_id === cluster.id)
                                    .map((resource, index2: number) => {
                                        return (
                                            <TreeItem
                                                itemId={
                                                    index.toString() +
                                                    "-resources-" +
                                                    index2.toString()
                                                }
                                                key={index2}
                                                onClick={() => {
                                                    setResourceEdit(
                                                        JSON.parse(
                                                            JSON.stringify(
                                                                resource
                                                            )
                                                        )
                                                    );
                                                }}
                                                label={resource.name}
                                            />
                                        );
                                    })}
                            </SimpleTreeView>
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
                    <Button variant="contained" onClick={editResource}>
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
