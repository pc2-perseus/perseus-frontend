// React imports
import React from "react";

// MUI imports
import {
    Alert,
    AppBar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Theme,
    Toolbar,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";

// Icon imports
import CloseIcon from "@mui/icons-material/Close";

// Other imports
import _ from "lodash";

// Custom imports
import Mermaid from "../../Mermaid.tsx";
import testStateMachine from "../../../api/state-machine-manager/testStateMachine.ts";
import createStateMachine from "../../../api/state-machine-manager/createStateMachine.ts";
import updateStateMachine from "../../../api/state-machine-manager/updateStateMachine.ts";

export default function StateMachineEditor({
    open,
    states,
    isNew,
    stateMachineId,
    chart,
    onHide,
    onSuccess,
}: {
    open: boolean;
    states: string[];
    isNew: boolean;
    stateMachineId: string | null;
    chart: string | null;
    onHide: () => void;
    onSuccess: () => void;
}): React.ReactElement {
    const [selectedState, setSelectedState] = React.useState<string | null>(
        null
    );

    const chartClasses: { [key: string]: string } = {
        notSelected: "cursor:pointer",
        selected: "fill:#826CC6,cursor:pointer",
        emptyState:
            "stroke:#826CC6,stroke-width:2,stroke-dasharray:10 5,font-style:italic",
    };

    const [currentChart, setCurrentChart] = React.useState<string>(
        chart === null ? "stateDiagram-v2" : chart
    );
    const [currentId, setCurrentId] = React.useState<string>(
        stateMachineId === null ? "" : stateMachineId
    );
    const [createdChart, setCreatedChart] = React.useState<string | null>(null);

    const [showConditionDialog, setShowConditionDialog] =
        React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);

    const [conditionTable, setConditionTable] = React.useState<{
        [key: string]: { [key: string]: string | null };
    }>({});

    const theme: Theme = useTheme();

    // @ts-expect-error MouseEvent is generic
    function selectState(e: MouseEvent<HTMLDivElement>) {
        const node = e.target.closest(".node");
        if (
            node !== null &&
            node.classList.contains("statediagram-state") &&
            !node.classList.contains("emptyState")
        ) {
            try {
                const selection: string = node
                    .getElementsByClassName("nodeLabel")[0]
                    .getElementsByTagName("p")[0].innerHTML;
                setSelectedState(
                    selectedState === selection ? null : selection
                );
            } catch (e) {
                /* empty */
            }
        }
    }

    function getStateConnections(
        state: string
    ): { from: string; to: string; value: string | null; line: number }[] {
        return currentChart
            .split("\n")
            .map((line: string, index: number) => {
                if (line.includes("-->")) {
                    const parts: string[] = line.split("-->", 2);
                    if (parts.length === 2) {
                        let from: string = parts[0];
                        let to: string = parts[1];
                        let value: string | null = null;
                        _.keys(chartClasses).forEach((className: string) => {
                            from = from.replaceAll(`:::${className}`, "");
                            to = to.replaceAll(`:::${className}`, "");
                        });
                        from = from.trim();
                        if (to.includes(":")) {
                            [to, value] = to.split(":", 2);
                            value = value.trim();
                            if (value === "default") {
                                value = null;
                            }
                        }
                        to = to.trim();
                        if (from !== state && to !== state) {
                            return null;
                        }
                        return {
                            from: from,
                            to: to,
                            value: value,
                            line: index,
                        };
                    }
                }
                return null;
            })
            .filter((item) => item !== null);
    }

    function addNewState() {
        if (selectedState !== null) {
            const connections: { from: string; to: string; line: number }[] =
                getStateConnections(selectedState);
            if (connections.length === 1) {
                setCurrentChart(
                    `${currentChart}\n${selectedState} --> drop_state_here:::emptyState: `
                );
            } else {
                const oldChartLines: string[] = currentChart.split("\n");
                connections.forEach(
                    (connection: {
                        from: string;
                        to: string;
                        line: number;
                    }) => {
                        if (connection.from === selectedState) {
                            oldChartLines[connection.line] = oldChartLines[
                                connection.line
                            ].replace(selectedState, "drop_state_here");
                        }
                    }
                );
                oldChartLines.push(
                    `${selectedState} --> drop_state_here:::emptyState: `
                );

                setCurrentChart(oldChartLines.join("\n"));
            }

            setSelectedState(null);
        }
    }

    // @ts-expect-error DragEvent is generic
    function dropState(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        let draggingState: string = e.dataTransfer.getData("state");
        let mode: "choice" | "fork" | null = null;

        if (draggingState === "<<choice>>") {
            draggingState = `$choice${Math.floor(Math.random() * 10000000)}`;
            mode = "choice";
        }
        if (draggingState === "<<fork>>") {
            draggingState = `$fork${Math.floor(Math.random() * 10000000)}`;
            mode = "fork";
        }

        const node = e.target.closest(".node");
        if (node !== null && node.classList.contains("statediagram-state")) {
            try {
                const droppingState: string = node
                    .getElementsByClassName("nodeLabel")[0]
                    .getElementsByTagName("p")[0].innerHTML;

                const connections: {
                    from: string;
                    to: string;
                    line: number;
                }[] = getStateConnections(droppingState);

                let oldChartLines: string[] = currentChart.split("\n");

                if (mode === null) {
                    connections.forEach(
                        (connection: {
                            from: string;
                            to: string;
                            line: number;
                        }) => {
                            if (
                                connection.from === droppingState ||
                                connection.to === droppingState
                            ) {
                                oldChartLines[connection.line] = oldChartLines[
                                    connection.line
                                ].replace(droppingState, draggingState);
                            }
                        }
                    );
                } else if (mode === "choice") {
                    oldChartLines.push(
                        `${draggingState} --> drop_choice1_here:::emptyState: `
                    );
                    oldChartLines.push(
                        `${draggingState} --> drop_choice2_here:::emptyState: value`
                    );
                    connections.forEach(
                        (connection: {
                            from: string;
                            to: string;
                            line: number;
                        }) => {
                            if (connection.to === droppingState) {
                                oldChartLines[connection.line] = oldChartLines[
                                    connection.line
                                ].replace(droppingState, draggingState);
                            }
                            if (connection.from === droppingState) {
                                oldChartLines[connection.line] = oldChartLines[
                                    connection.line
                                ].replace(droppingState, "drop_choice1_here");
                                oldChartLines.push(
                                    `drop_choice2_here --> ${connection.to}: `
                                );
                            }
                        }
                    );
                    oldChartLines = [
                        oldChartLines[0],
                        `state ${draggingState} <<choice>>`,
                        ...oldChartLines.slice(1),
                    ];
                } else if (mode === "fork") {
                    oldChartLines.push(
                        `${draggingState} --> drop_path1_here:::emptyState`
                    );
                    oldChartLines.push(
                        `${draggingState} --> drop_path2_here:::emptyState`
                    );
                    oldChartLines.push(
                        `drop_path1_here --> $join${draggingState}: `
                    );
                    oldChartLines.push(
                        `drop_path2_here --> $join${draggingState}: `
                    );
                    connections.forEach(
                        (connection: {
                            from: string;
                            to: string;
                            line: number;
                        }) => {
                            if (connection.to === droppingState) {
                                oldChartLines[connection.line] = oldChartLines[
                                    connection.line
                                ].replace(droppingState, draggingState);
                            }
                            if (connection.from === droppingState) {
                                oldChartLines[connection.line] = oldChartLines[
                                    connection.line
                                ].replace(
                                    droppingState,
                                    `$join${draggingState}`
                                );
                            }
                        }
                    );
                    oldChartLines = [
                        oldChartLines[0],
                        `state ${draggingState} <<fork>>`,
                        `state $join${draggingState} <<join>>`,
                        ...oldChartLines.slice(1),
                    ];
                }
                let newChart: string = oldChartLines.join("\n");
                _.keys(chartClasses).forEach((className: string) => {
                    newChart = newChart.replaceAll(
                        `${draggingState}:::${className}`,
                        draggingState
                    );
                });
                setCurrentChart(
                    newChart.replace(
                        `--> ${draggingState}`,
                        `--> ${draggingState}:::notSelected`
                    )
                );
            } catch (e) {
                /* empty */
            }
        }
    }

    function setCondition(from: string, to: string, value: string | null) {
        conditionTable[from][to] = value;
        setConditionTable(JSON.parse(JSON.stringify(conditionTable)));
    }

    function resetConditions() {
        const newConditions: {
            [key: string]: { [key: string]: string | null };
        } = {};
        const relevantStates: string[] = [];

        states.map((state: string) => {
            const connections = getStateConnections(state).filter(
                (c) => c.to !== "[*]" && c.from !== "[*]"
            );
            if (connections.length > 0) {
                relevantStates.push(state);
                if (!(state in newConditions)) {
                    newConditions[state] = {};
                }
            }

            connections
                .filter(
                    (c) =>
                        (c.from === state ||
                            c.from.startsWith("$choice") ||
                            c.from.startsWith("$fork")) &&
                        !c.to.startsWith("$choice") &&
                        !c.to.startsWith("$fork") &&
                        !c.from.startsWith("$join") &&
                        !c.to.startsWith("$join")
                )
                .forEach((connection) => {
                    if (
                        connection.from.startsWith("$choice") ||
                        connection.from.startsWith("$fork")
                    ) {
                        const from: string = getStateConnections(
                            connection.from
                        ).filter((c) => c.to === connection.from)[0].from;
                        if (!(from in newConditions)) {
                            newConditions[from] = {};
                        }
                        newConditions[from][connection.to] = connection.value;
                    } else {
                        newConditions[state][connection.to] = connection.value;
                    }
                });
        });
        _.keys(newConditions).forEach((stateFrom: string) => {
            relevantStates.forEach((stateTo: string) => {
                if (!(stateTo in newConditions[stateFrom])) {
                    newConditions[stateFrom][stateTo] = "<<none>>";
                }
            });
        });
        setConditionTable(JSON.parse(JSON.stringify(newConditions)));
    }

    function saveConditions() {
        const chartLines: string[] = currentChart.split("\n");
        const conditionTableCopy: {
            [key: string]: { [key: string]: string | null };
        } = JSON.parse(JSON.stringify(conditionTable));
        states.forEach((state: string) => {
            const connections = getStateConnections(state).filter(
                (c) => c.to !== "[*]" && c.from === state
            );
            connections.forEach((connection) => {
                if (
                    state in conditionTable &&
                    connection.to in conditionTable[state]
                ) {
                    chartLines[connection.line] =
                        `${chartLines[connection.line].substring(0, chartLines[connection.line].lastIndexOf(":"))}: ${conditionTable[state][connection.to]}`;
                    delete conditionTableCopy[state][connection.to];
                }
            });
        });
        _.keys(conditionTable).forEach((stateFrom: string) => {
            _.keys(conditionTable[stateFrom]).forEach((stateTo: string) => {
                if (
                    stateFrom in conditionTableCopy &&
                    stateTo in conditionTableCopy[stateFrom] &&
                    ["", "<<none>>", null, undefined].includes(
                        conditionTableCopy[stateFrom][stateTo]
                    )
                ) {
                    delete conditionTableCopy[stateFrom][stateTo];
                }
            });
            if (_.keys(conditionTableCopy[stateFrom]).length === 0) {
                delete conditionTableCopy[stateFrom];
            }
        });
        _.keys(conditionTableCopy).forEach((stateFrom: string) => {
            _.keys(conditionTableCopy[stateFrom]).forEach((stateTo: string) => {
                getStateConnections(stateFrom).forEach((connection) => {
                    getStateConnections(connection.to).forEach(
                        (innerConnection) => {
                            if (innerConnection.to === stateTo) {
                                chartLines[innerConnection.line] =
                                    `${chartLines[innerConnection.line].substring(0, chartLines[innerConnection.line].lastIndexOf(":"))}: ${conditionTableCopy[stateFrom][stateTo]}`;
                            }
                        }
                    );
                });
            });
        });
        setCurrentChart(chartLines.join("\n"));
    }

    function test() {
        let finishedChart: string = currentChart;
        _.keys(chartClasses).forEach((className: string) => {
            finishedChart = finishedChart.replaceAll(`:::${className}`, "");
        });
        finishedChart = finishedChart.replaceAll(":\n", "\n");
        testStateMachine(currentId, finishedChart).then(
            (graph: string | null) => {
                if (graph === null) {
                    setCreatedChart(null);
                    setError(
                        "PERSEUS core was not able to create this state machine. Please verify that it obeys all rules."
                    );
                } else {
                    setCreatedChart(graph.replaceAll(":::currentState", ""));
                }
            }
        );
    }

    function submit() {
        let finishedChart: string = currentChart;
        _.keys(chartClasses).forEach((className: string) => {
            finishedChart = finishedChart.replaceAll(`:::${className}`, "");
        });
        finishedChart = finishedChart.replaceAll(":\n", "\n");
        if (isNew) {
            createStateMachine(currentId, finishedChart).then((result) => {
                if (result) {
                    onSuccess();
                } else {
                    setCreatedChart(null);
                    setError(
                        "PERSEUS core was not able to create this state machine. Please verify that it obeys all rules."
                    );
                }
            });
        } else {
            updateStateMachine(currentId, finishedChart).then((result) => {
                if (result) {
                    onSuccess();
                } else {
                    setCreatedChart(null);
                    setError(
                        "PERSEUS core was not able to create this state machine. Please verify that it obeys all rules."
                    );
                }
            });
        }
    }

    React.useEffect(() => {
        if (selectedState === null) {
            setCurrentChart(
                currentChart.replace(":::selected", ":::notSelected")
            );
        } else {
            setCurrentChart(
                currentChart
                    .replace(":::selected", ":::notSelected")
                    .replace(
                        `${selectedState}:::notSelected`,
                        `${selectedState}:::selected`
                    )
            );
        }
    }, [selectedState]);

    React.useEffect(() => {
        let c: string = chart === null ? "stateDiagram-v2" : chart;
        if (chart !== null) {
            c = c
                .split("\n")
                .filter((line: string) => !line.startsWith("classDef"))
                .toSpliced(
                    1,
                    0,
                    ..._.keys(chartClasses).map(
                        (className: string) =>
                            `classDef ${className} ${chartClasses[className]}`
                    )
                )
                .join("\n");
            states.forEach((state: string) => {
                c = c.replaceAll(` ${state}:`, `${state}:::notSelected:`);
            });
        }
        setCurrentChart(c);
        setCreatedChart(null);
        setError(null);
    }, [chart]);

    React.useEffect(() => {
        resetConditions();
    }, [currentChart]);

    React.useEffect(() => {
        setCurrentId(stateMachineId === null ? "" : stateMachineId);
    }, [stateMachineId]);

    return (
        <>
            <Dialog open={open} onClose={onHide} fullScreen>
                <AppBar sx={{ position: "relative" }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={onHide}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography
                            sx={{ ml: 2, flex: 1 }}
                            variant="h6"
                            component="div"
                        >
                            State machine editor: {stateMachineId}
                        </Typography>
                    </Toolbar>
                </AppBar>
                <DialogContent>
                    <Box
                        sx={{
                            display: "flex",
                            maxHeight: "100%",
                            overflow: "hidden",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                borderRight: `1px solid ${theme.palette.divider}`,
                                pr: 2,
                                overflowY: "scroll",
                                textAlign: "center",
                            }}
                        >
                            <Stack spacing={2}>
                                <Button
                                    onClick={() => {
                                        setCurrentChart(
                                            chart === null
                                                ? "stateDiagram-v2"
                                                : chart
                                        );
                                    }}
                                    variant="contained"
                                    color="warning"
                                >
                                    Reset all changes
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => setShowConditionDialog(true)}
                                >
                                    Update conditions
                                </Button>
                                {selectedState === null ||
                                selectedState === "Archive" ? (
                                    <Tooltip
                                        title="Select state other than Archive to add a new state"
                                        placement="right"
                                    >
                                        <Box sx={{ width: "100%" }}>
                                            <Button
                                                onClick={addNewState}
                                                disabled={
                                                    selectedState === null ||
                                                    selectedState === "Archive"
                                                }
                                                variant="contained"
                                                fullWidth
                                            >
                                                Add new state
                                            </Button>
                                        </Box>
                                    </Tooltip>
                                ) : (
                                    <Button
                                        onClick={addNewState}
                                        disabled={
                                            selectedState === null ||
                                            selectedState === "Archive"
                                        }
                                        variant="contained"
                                        fullWidth
                                    >
                                        Add new state
                                    </Button>
                                )}
                            </Stack>
                            <Divider sx={{ my: 2 }} />
                            <div
                                draggable={true}
                                onDragStart={(e) => {
                                    e.dataTransfer.setData(
                                        "state",
                                        "<<choice>>"
                                    );
                                }}
                                style={{
                                    cursor: "pointer",
                                    display: "inline-block",
                                }}
                            >
                                <Mermaid
                                    chart={`stateDiagram-v2\nstate choice <<choice>>\nchoice --> A\nchoice --> B:alternative`}
                                />
                            </div>
                            <div
                                draggable={true}
                                onDragStart={(e) => {
                                    e.dataTransfer.setData("state", "<<fork>>");
                                }}
                                style={{
                                    cursor: "pointer",
                                    display: "inline-block",
                                }}
                            >
                                <Mermaid
                                    chart={`stateDiagram-v2\nstate fork <<fork>>\nstate join <<join>>\nfork --> A\nfork --> B\nA --> join\nB --> join`}
                                />
                            </div>

                            {states.map((state: string) => {
                                return (
                                    <span
                                        key={state}
                                        draggable={true}
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData(
                                                "state",
                                                state
                                            );
                                        }}
                                        style={{ display: "inline-block" }}
                                    >
                                        <Mermaid
                                            chart={`stateDiagram-v2\nclassDef dragState cursor:pointer\n${state}:::dragState`}
                                        />
                                    </span>
                                );
                            })}
                        </Box>

                        <Box
                            sx={{
                                flexGrow: 100,
                                textAlign: "center",
                                overflowY: "scroll",
                            }}
                        >
                            {error && (
                                <Alert
                                    severity="error"
                                    onClose={() => {
                                        setError(null);
                                    }}
                                    sx={{ mb: 2 }}
                                >
                                    {error}
                                </Alert>
                            )}
                            {createdChart && (
                                <Typography variant="h4">
                                    Created by user
                                </Typography>
                            )}
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={dropState}
                            >
                                <Mermaid
                                    chart={currentChart}
                                    onClick={selectState}
                                />
                            </div>
                        </Box>
                        {createdChart !== null && (
                            <Box
                                sx={{
                                    flexGrow: 100,
                                    textAlign: "center",
                                    overflowY: "scroll",
                                }}
                            >
                                <Box sx={{ position: "relative" }}>
                                    <Typography variant="h4">
                                        Created by core
                                    </Typography>
                                    <IconButton
                                        edge="start"
                                        color="inherit"
                                        aria-label="close"
                                        onClick={() => {
                                            setCreatedChart(null);
                                        }}
                                        sx={{
                                            top: 0,
                                            right: "5px",
                                            position: "absolute",
                                        }}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </Box>
                                <Mermaid chart={createdChart} />
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions
                    sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
                >
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={test}
                    >
                        Test
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={submit}
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={showConditionDialog}
                onClose={() => {
                    setShowConditionDialog(false);
                    resetConditions();
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Add condition</DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell />
                                    {_.keys(conditionTable)
                                        .sort()
                                        .map((state: string) => (
                                            <TableCell key={state}>
                                                {state}
                                            </TableCell>
                                        ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {_.keys(conditionTable)
                                    .sort()
                                    .map((stateFrom: string) => (
                                        <TableRow key={stateFrom}>
                                            <TableCell>{stateFrom}</TableCell>
                                            {_.keys(conditionTable[stateFrom])
                                                .sort()
                                                .map((stateTo: string) => (
                                                    <TableCell key={stateTo}>
                                                        {conditionTable[
                                                            stateFrom
                                                        ][stateTo] ===
                                                        "<<none>>" ? (
                                                            <div
                                                                style={{
                                                                    width: "100%",
                                                                    textAlign:
                                                                        "center",
                                                                }}
                                                            >
                                                                -
                                                            </div>
                                                        ) : (
                                                            <TextField
                                                                size="small"
                                                                value={
                                                                    conditionTable[
                                                                        stateFrom
                                                                    ][
                                                                        stateTo
                                                                    ] === null
                                                                        ? ""
                                                                        : conditionTable[
                                                                              stateFrom
                                                                          ][
                                                                              stateTo
                                                                          ]
                                                                }
                                                                onChange={(e) =>
                                                                    setCondition(
                                                                        stateFrom,
                                                                        stateTo,
                                                                        e
                                                                            .currentTarget
                                                                            .value
                                                                    )
                                                                }
                                                                autoComplete="off"
                                                                fullWidth
                                                            />
                                                        )}
                                                    </TableCell>
                                                ))}
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setShowConditionDialog(false);
                            resetConditions();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            saveConditions();
                            setShowConditionDialog(false);
                        }}
                        variant="contained"
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
