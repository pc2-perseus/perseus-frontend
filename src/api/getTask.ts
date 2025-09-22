// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import { Task } from "../components/states/StateTasksOverview.tsx";

export default async function getTask(
    stateId: string,
    projectId: string,
    taskId: string
): Promise<Task | null> {
    const call: APIResponse<Task> = await makeAPICall<Task>(
        HTTPMethod.GET,
        "/tasks/" + stateId + "/" + projectId + "/" + taskId
    );

    return call.statusCode === 200 && call.value !== null ? call.value : null;
}
