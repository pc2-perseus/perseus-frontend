// React imports
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

// MUI imports
import {
    Box,
    Button,
    Divider,
    Grid,
    List,
    Paper,
    Theme,
    useTheme,
} from "@mui/material";

// Custom imports
import getTasks from "../../api/getTasks.ts";
import AuthContext, { AuthContextData } from "../../contexts/AuthContext.ts";
import assignTask from "../../api/assignTask.ts";
import unassignTask from "../../api/unassignTask.ts";
import DynamicFormElement from "../../dynamic-forms/interfaces/DynamicFormElement.ts";
import parseMarkdown from "../../dynamic-forms/core/parseMarkdown.ts";
import { projectTypeColor } from "../../utils/projectTypeColor.ts";
import LoadingBar from "../LoadingBar.tsx";
import FrontendConfiguration from "../../interfaces/FrontendConfiguration.ts";
import ConfigContext from "../../contexts/ConfigContext.ts";

export interface Task {
    id: string;
    title: string;
    project_id: string;
    project_type: string | null;
    assignee: string;
    form: DynamicFormElement | null;
    created: string | null;
    due: string | null;
}

/**
 * Component to display a list of tasks for a certain state.
 *
 * @param stateId {string} - The id of the state of which the tasks should be displayed
 *
 * @return {React.ReactElement} - The created drawer component
 */
export default function StateTasksOverview({
    stateId,
}: {
    stateId: string;
}): React.ReactElement {
    const [tasks, updateTasks] = React.useState<Task[]>([]);
    const [loading, updateLoading] = React.useState<boolean>(true);
    const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

    const authContextData: AuthContextData | null =
        React.useContext(AuthContext);

    const frontendConfig: FrontendConfiguration | null =
        React.useContext(ConfigContext);

    const location = useLocation();
    const navigate = useNavigate();
    const theme: Theme = useTheme();

    function handleClick(task: Task) {
        if (task.assignee === null) {
            setSelectedTask(task);
            assignTask(stateId, task).then((success: boolean) => {
                if (success) {
                    getTasks(stateId).then((tasks: Task[]) => {
                        updateTasks(tasks);
                        setSelectedTask(null);
                    });
                } else {
                    setSelectedTask(null);
                }
            });
        } else if (task.assignee === authContextData?.username) {
            navigate("/" + stateId + "/" + task.project_id + "/" + task.id);
        }
    }

    function unassign(task: Task) {
        if (task.assignee === authContextData?.username) {
            setSelectedTask(task);
            unassignTask(stateId, task).then((success: boolean) => {
                if (success) {
                    getTasks(stateId).then((tasks: Task[]) => {
                        updateTasks(tasks);
                        setSelectedTask(null);
                    });
                } else {
                    setSelectedTask(null);
                }
            });
        }
    }

    React.useEffect(() => {
        updateLoading(true);
        getTasks(stateId).then((tasks: Task[]) => {
            updateTasks(tasks);
            updateLoading(false);
        });
    }, [stateId]);

    if (loading) {
        return <LoadingBar />;
    }

    function list(task: Task, index: number) {
        return (
            <Paper
                elevation={16}
                sx={{ p: 0, my: 1, display: "flex" }}
                key={index}
            >
                <Box
                    sx={{
                        writingMode: "vertical-lr",
                        transform: "scale(-1, -1)",
                        textAlign: "center",
                        fontSize: "19px",
                        px: 1,
                        background: projectTypeColor(
                            task.project_type,
                            frontendConfig
                        ),
                        borderTopRightRadius: "4px",
                        borderBottomRightRadius: "4px",
                    }}
                >
                    {task.project_type === null ? "unknown" : task.project_type}
                </Box>
                <Grid container sx={{ flexGrow: 2, p: 2 }}>
                    <Grid size={{ xs: 9, xl: 10 }}>
                        <Box
                            sx={{
                                a: {
                                    color: theme.palette.primary.main,
                                    textDecoration: "none",
                                },
                            }}
                        >
                            {parseMarkdown(task.title)}
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 3, xl: 2 }}>
                        {selectedTask?.id === task.id &&
                        selectedTask?.project_id === task.project_id ? (
                            <LoadingBar />
                        ) : (
                            <>
                                <Button
                                    variant="contained"
                                    size="small"
                                    disabled={
                                        task.assignee !== null &&
                                        task.assignee !==
                                            authContextData?.username
                                    }
                                    color="primary"
                                    onClick={() => handleClick(task)}
                                    fullWidth
                                >
                                    {task.assignee === null
                                        ? "assign myself"
                                        : task.assignee ===
                                            authContextData?.username
                                          ? "continue editing"
                                          : "Assignee: " + task.assignee}
                                </Button>
                                {task.assignee === authContextData?.username ? (
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        size="small"
                                        fullWidth
                                        sx={{ mt: 1 }}
                                        onClick={() => unassign(task)}
                                    >
                                        unassign task
                                    </Button>
                                ) : (
                                    <></>
                                )}
                            </>
                        )}
                    </Grid>
                </Grid>
            </Paper>
        );
    }

    return (
        <List>
            {tasks.length > 0 ? "" : <i>no tasks available</i>}
            {tasks
                .filter((t) => t.project_id === location.hash.replace("#", ""))
                .map(list)}
            <Divider
                sx={{
                    my: 3,
                    display:
                        tasks.filter(
                            (t) =>
                                t.project_id === location.hash.replace("#", "")
                        ).length === 0
                            ? "none"
                            : undefined,
                }}
            />
            {tasks
                .filter((t) => t.project_id !== location.hash.replace("#", ""))
                .map(list)}
        </List>
    );
}
