// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import { Task } from "../components/states/StateTasksOverview.tsx";

export default async function assignTask(
    state_id: string,
    task: Task
): Promise<boolean> {
    const call: APIResponse<object> = await makeAPICall<object>(
        HTTPMethod.POST,
        "/tasks/" + state_id + "/assign",
        {
            project_id: task.project_id,
            task_id: task.id,
        }
    );

    return call.statusCode == 200;
}
