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
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

// Custom imports
import getStates from "../../../api/state-machine-manager/getStates.ts";
import AddIcon from "@mui/icons-material/Add";
import SearchBar from "../../SearchBar.tsx";
import LoadingBar from "../../LoadingBar.tsx";
import StateMachineEditor from "./StateMachineEditor.tsx";
import StoredStateMachine from "../../../interfaces/StoredStateMachine.ts";
import getStateMachines from "../../../api/state-machine-manager/getStateMachines.ts";
import _ from "lodash";
import Mermaid from "../../Mermaid.tsx";
import deleteStateMachine from "../../../api/state-machine-manager/deleteStateMachine.ts";

export default function StateMachineManager(): React.ReactElement {
    const [loading, setLoading] = React.useState<boolean>(true);
    const [search, setSearch] = React.useState<string>("");
    const [showChartIds, setShowChartIds] = React.useState<string[]>([]);
    const [states, setStates] = React.useState<string[]>([]);
    const [stateMachines, setStateMachines] = React.useState<
        StoredStateMachine[]
    >([]);
    const chartClasses: { [key: string]: string } = {
        notSelected: "cursor:pointer",
        selected: "fill:#826CC6,cursor:pointer",
        emptyState:
            "stroke:#826CC6,stroke-width:2,stroke-dasharray:10 5,font-style:italic",
    };
    const [editChart, setEditChart] = React.useState<string | null>(null);
    const [editId, setEditId] = React.useState<string | null>(null);
    const [showIdDialog, setShowIdDialog] = React.useState<boolean>(false);
    const [isNew, setIsNew] = React.useState<boolean>(true);
    const [removeStateMachine, setRemoveStateMachine] =
        React.useState<StoredStateMachine | null>(null);

    const filteredStateMachines: StoredStateMachine[] = stateMachines.filter(
        (stateMachine: StoredStateMachine) =>
            stateMachine.state_machine_id.includes(search) ||
            stateMachine.state_machine.graph.includes(search)
    );

    function reload() {
        setLoading(true);
        setEditChart(null);
        setEditId(null);
        getStateMachines().then((data: StoredStateMachine[]) => {
            setStateMachines(data);
            setLoading(false);
        });
    }

    function remove() {
        if (removeStateMachine === null) {
            return;
        }
        deleteStateMachine(removeStateMachine.state_machine_id).then(
            (result: boolean) => {
                if (result) {
                    setRemoveStateMachine(null);
                    reload();
                }
            }
        );
    }

    React.useEffect(() => {
        getStateMachines().then((data: StoredStateMachine[]) => {
            setStateMachines(data);
            setLoading(false);
        });
        getStates().then((data: string[]) => {
            setStates(data);
        });
    }, []);

    if (loading) {
        return <LoadingBar />;
    }

    return (
        <Box>
            <SearchBar
                onSearch={(value: string) => setSearch(value.toLowerCase())}
                actionTitle="Add state machine"
                actionIcon={<AddIcon />}
                onAction={() => setShowIdDialog(true)}
            />
            <Stack spacing={1} sx={{ mt: 2 }}>
                {filteredStateMachines.map(
                    (stateMachine: StoredStateMachine, index: number) => {
                        return (
                            <Paper elevation={16} sx={{ p: 2 }} key={index}>
                                <Typography
                                    variant="h5"
                                    component="span"
                                    gutterBottom
                                >
                                    {stateMachine.state_machine_id}
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                        setRemoveStateMachine(stateMachine);
                                    }}
                                    sx={{ float: "right", mx: 0.5 }}
                                >
                                    <DeleteIcon />
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => {
                                        setIsNew(false);
                                        setEditId(
                                            stateMachine.state_machine_id
                                        );
                                        setEditChart(
                                            stateMachine.state_machine.graph.replaceAll(
                                                ":::currentState",
                                                ""
                                            )
                                        );
                                    }}
                                    sx={{ float: "right", mx: 0.5 }}
                                >
                                    <EditIcon />
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    size="small"
                                    onClick={() => {
                                        if (
                                            showChartIds.includes(
                                                stateMachine.state_machine_id
                                            )
                                        ) {
                                            setShowChartIds([
                                                ...showChartIds.filter(
                                                    (id: string) =>
                                                        id !==
                                                        stateMachine.state_machine_id
                                                ),
                                            ]);
                                        } else {
                                            setShowChartIds([
                                                ...showChartIds,
                                                stateMachine.state_machine_id,
                                            ]);
                                        }
                                    }}
                                    sx={{ float: "right", mx: 0.5 }}
                                >
                                    {showChartIds.includes(
                                        stateMachine.state_machine_id
                                    ) ? (
                                        <VisibilityOffIcon />
                                    ) : (
                                        <VisibilityIcon />
                                    )}
                                </Button>
                                <Box
                                    sx={{
                                        width: "100%",
                                        textAlign: "center",
                                        display: showChartIds.includes(
                                            stateMachine.state_machine_id
                                        )
                                            ? undefined
                                            : "none",
                                    }}
                                >
                                    <Mermaid
                                        chart={stateMachine.state_machine.graph.replaceAll(
                                            ":::currentState",
                                            ""
                                        )}
                                    />
                                </Box>
                            </Paper>
                        );
                    }
                )}
            </Stack>
            <Dialog
                open={showIdDialog}
                onClose={() => {
                    setShowIdDialog(false);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Add state machine</DialogTitle>
                <DialogContent>
                    <TextField
                        variant="outlined"
                        label="ID"
                        value={editId === null ? "" : editId}
                        onChange={(e) => setEditId(e.currentTarget.value)}
                        fullWidth
                        sx={{ mt: 3 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setShowIdDialog(false);
                            setEditId(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setIsNew(true);
                            setEditChart(
                                [
                                    "stateDiagram-v2",
                                    ..._.keys(chartClasses).map(
                                        (className: string) =>
                                            `classDef ${className} ${chartClasses[className]}`
                                    ),
                                    "[*] --> InitialState: ",
                                    "InitialState --> Archive: ",
                                    "Archive --> [*]",
                                ].join("\n")
                            );
                            setShowIdDialog(false);
                        }}
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={removeStateMachine !== null}
                onClose={() => {
                    setRemoveStateMachine(null);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Delete state machine</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete the state machine{" "}
                    {removeStateMachine?.state_machine_id}?
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setRemoveStateMachine(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button variant="contained" color="error" onClick={remove}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <StateMachineEditor
                open={editChart !== null}
                states={states}
                isNew={isNew}
                stateMachineId={editId}
                chart={editChart}
                onHide={() => {
                    setEditChart(null);
                    setEditId(null);
                }}
                onSuccess={reload}
            />
        </Box>
    );
}
