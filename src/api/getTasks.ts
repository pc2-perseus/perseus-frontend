// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import { Task } from "../components/states/StateTasksOverview.tsx";

export default async function getTasks(stateId: string): Promise<Task[]> {
    const call: APIResponse<{ tasks: Task[] }> = await makeAPICall<{
        tasks: Task[];
    }>(HTTPMethod.GET, "/tasks/" + stateId);

    return call.statusCode === 200 && call.value !== null
        ? call.value.tasks
        : [];
}
