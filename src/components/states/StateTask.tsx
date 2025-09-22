// React imports
import React from "react";
import { useParams } from "react-router-dom";

// custom imports
import { Task } from "./StateTasksOverview.tsx";
import getTask from "../../api/getTask.ts";
import DynamicForm from "../../dynamic-forms/DynamicForm.tsx";
import CONFIG from "../../config.ts";
import LoadingBar from "../LoadingBar.tsx";

export default function StateTask({
    stateId,
}: {
    stateId: string;
}): React.ReactElement {
    const [task, setTask] = React.useState<Task | null | undefined>(undefined);
    const { projectId, taskId } = useParams();

    React.useEffect(() => {
        if (projectId !== undefined && taskId !== undefined) {
            getTask(stateId, projectId, taskId).then((result: Task | null) => {
                if (
                    result !== null &&
                    result.form?.submitEndpoint !== undefined
                ) {
                    result.form.submitEndpoint =
                        CONFIG.CORE_URL + result.form.submitEndpoint;
                    result.form.onSuccess = () => {
                        window.location.href = `${import.meta.env.BASE_URL}${stateId}`;
                    };
                }
                setTask(result);
            });
        }
    }, []);

    if (task === undefined) {
        return <LoadingBar />;
    }

    return (
        <>
            {task !== null && task.form !== null ? (
                <DynamicForm form={task.form} />
            ) : (
                ""
            )}
        </>
    );
}
