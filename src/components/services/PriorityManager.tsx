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
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

// Icon imports
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

// Custom imports
import SearchBar from "../SearchBar.tsx";
import ResourcePriority from "../../interfaces/ResourcePriority.ts";
import LoadingBar from "../LoadingBar.tsx";
import getPriorities from "../../api/resource-priorities/getPriorities.ts";
import EditIcon from "@mui/icons-material/Edit";
import addPriority from "../../api/resource-priorities/addPriority.ts";
import updatePriority from "../../api/resource-priorities/updatePriority.ts";
import deletePriority from "../../api/resource-priorities/deletePriority.ts";
import ColorPicker from "../ColorPicker.tsx";

export default function PriorityManager(): React.ReactElement {
    const [loading, setLoading] = React.useState<boolean>(true);
    const [search, setSearch] = React.useState<string>("");
    const [newPriority, setNewPriority] =
        React.useState<ResourcePriority | null>(null);
    const [editPriority, setEditPriority] =
        React.useState<ResourcePriority | null>(null);
    const [removePriority, setRemovePriority] =
        React.useState<ResourcePriority | null>(null);
    const [negativeHelper, setNegativeHelper] = React.useState<boolean>(false);

    const [resourcePriorities, setResourcePriorities] = React.useState<
        ResourcePriority[]
    >([]);

    const filteredResourcePriorities = resourcePriorities
        .filter((priority: ResourcePriority) =>
            priority.priority_id.toLowerCase().includes(search)
        )
        .sort((a, b) => b.value - a.value);

    function add() {
        if (newPriority !== null) {
            addPriority(newPriority).then((result: boolean) => {
                if (result) {
                    setNewPriority(null);
                    setLoading(true);
                    getPriorities().then((priorities: ResourcePriority[]) => {
                        setResourcePriorities(priorities);
                        setLoading(false);
                    });
                }
            });
        }
    }

    function update() {
        if (editPriority !== null) {
            updatePriority(editPriority).then((result: boolean) => {
                if (result) {
                    setEditPriority(null);
                    setLoading(true);
                    getPriorities().then((priorities: ResourcePriority[]) => {
                        setResourcePriorities(priorities);
                        setLoading(false);
                    });
                }
            });
        }
    }

    function remove() {
        if (removePriority !== null) {
            deletePriority(removePriority).then((result: boolean) => {
                if (result) {
                    setRemovePriority(null);
                    setLoading(true);
                    getPriorities().then((priorities: ResourcePriority[]) => {
                        setResourcePriorities(priorities);
                        setLoading(false);
                    });
                }
            });
        }
    }

    React.useEffect(() => {
        getPriorities().then((priorities: ResourcePriority[]) => {
            setResourcePriorities(priorities);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <LoadingBar />;
    }

    return (
        <Box>
            <SearchBar
                onSearch={(value: string) => setSearch(value.toLowerCase())}
                actionTitle="Add priority"
                actionIcon={<AddIcon />}
                onAction={() =>
                    setNewPriority({
                        _id: null,
                        files: {},
                        file_tags: {},
                        priority_id: "",
                        value: 0,
                        indicator_color: null,
                    })
                }
            />
            <Stack spacing={1} sx={{ mt: 2 }}>
                {filteredResourcePriorities.map(
                    (priority: ResourcePriority, index: number) => {
                        return (
                            <Paper elevation={16} sx={{ p: 2 }} key={index}>
                                {priority.indicator_color !== null && (
                                    <Box
                                        sx={{
                                            display: "inline-block",
                                            width: 16,
                                            height: 16,
                                            borderRadius: "50%",
                                            backgroundColor:
                                                priority.indicator_color,
                                            mr: 1,
                                            mb: 1,
                                            verticalAlign: "middle",
                                        }}
                                    />
                                )}
                                <Typography
                                    variant="h5"
                                    component="span"
                                    gutterBottom
                                >
                                    {priority.priority_id} ({priority.value})
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                        setRemovePriority(
                                            JSON.parse(JSON.stringify(priority))
                                        );
                                    }}
                                    sx={{ float: "right", mx: 1 }}
                                >
                                    <DeleteIcon />
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => {
                                        setEditPriority(
                                            JSON.parse(JSON.stringify(priority))
                                        );
                                    }}
                                    sx={{ float: "right" }}
                                >
                                    <EditIcon />
                                </Button>
                            </Paper>
                        );
                    }
                )}
            </Stack>
            <Dialog
                open={newPriority !== null}
                onClose={() => {
                    setNewPriority(null);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Add priority</DialogTitle>
                <DialogContent>
                    <TextField
                        variant="outlined"
                        label="ID"
                        value={
                            newPriority === null ? "" : newPriority.priority_id
                        }
                        onChange={(e) => {
                            if (newPriority !== null) {
                                newPriority.priority_id = e.currentTarget.value;
                                setNewPriority(
                                    JSON.parse(JSON.stringify(newPriority))
                                );
                            }
                        }}
                        fullWidth
                        sx={{ my: 2 }}
                        autoComplete="off"
                    />
                    <TextField
                        variant="outlined"
                        helperText="Please use only integers"
                        value={
                            negativeHelper
                                ? "-"
                                : newPriority === null
                                  ? "0"
                                  : newPriority?.value.toString()
                        }
                        onChange={(e) => {
                            setNegativeHelper(
                                e.currentTarget.value.trim() === "-"
                            );
                            if (newPriority !== null) {
                                newPriority.value =
                                    e.currentTarget.value.trim() === "-"
                                        ? 0
                                        : Number(e.currentTarget.value);
                                setNewPriority(
                                    JSON.parse(JSON.stringify(newPriority))
                                );
                            }
                        }}
                        label="Value"
                        autoComplete="off"
                        fullWidth
                    />
                    <Typography sx={{ mt: 2 }}>Indicator color</Typography>
                    <ColorPicker
                        value={newPriority?.indicator_color ?? null}
                        onChange={(color) => {
                            if (newPriority !== null) {
                                newPriority.indicator_color = color;
                                setNewPriority(
                                    JSON.parse(JSON.stringify(newPriority))
                                );
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setNewPriority(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={add}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={editPriority !== null}
                onClose={() => {
                    setEditPriority(null);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Edit priority</DialogTitle>
                <DialogContent>
                    <TextField
                        variant="outlined"
                        label="ID"
                        value={
                            editPriority === null
                                ? ""
                                : editPriority?.priority_id
                        }
                        onChange={(e) => {
                            if (editPriority !== null) {
                                editPriority.priority_id =
                                    e.currentTarget.value;
                                setEditPriority(
                                    JSON.parse(JSON.stringify(editPriority))
                                );
                            }
                        }}
                        fullWidth
                        sx={{ my: 2 }}
                        autoComplete="off"
                    />
                    <TextField
                        variant="outlined"
                        helperText="Please use only integers"
                        value={
                            negativeHelper
                                ? "-"
                                : editPriority === null
                                  ? "0"
                                  : editPriority?.value.toString()
                        }
                        onChange={(e) => {
                            setNegativeHelper(
                                e.currentTarget.value.trim() === "-"
                            );
                            if (editPriority !== null) {
                                editPriority.value =
                                    e.currentTarget.value.trim() === "-"
                                        ? 0
                                        : Number(e.currentTarget.value);
                                setEditPriority(
                                    JSON.parse(JSON.stringify(editPriority))
                                );
                            }
                        }}
                        label="Value"
                        autoComplete="off"
                        fullWidth
                    />
                    <Typography sx={{ mt: 2 }}>Indicator color</Typography>
                    <ColorPicker
                        value={editPriority?.indicator_color ?? null}
                        onChange={(color) => {
                            if (editPriority !== null) {
                                editPriority.indicator_color = color;
                                setEditPriority(
                                    JSON.parse(JSON.stringify(editPriority))
                                );
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setEditPriority(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={update}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={removePriority !== null}
                onClose={() => {
                    setRemovePriority(null);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Delete priority {removePriority?.priority_id} (
                    {removePriority?.value})
                </DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this priority?
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setRemovePriority(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button variant="contained" color="error" onClick={remove}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
