// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";

export default async function updateStateMachine(
    id: string,
    graph: string
): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall<{
        result: boolean;
    }>(HTTPMethod.POST, "/service/StateMachineManager/update", {
        state_machine_id: id,
        state_machine_graph: graph,
    });

    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
