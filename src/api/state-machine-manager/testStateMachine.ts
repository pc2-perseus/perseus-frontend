// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";

export default async function testStateMachine(
    id: string,
    graph: string
): Promise<string | null> {
    const call: APIResponse<{ graph: string | null }> = await makeAPICall<{
        graph: string | null;
    }>(HTTPMethod.POST, "/service/StateMachineManager/test", {
        state_machine_id: id,
        state_machine_graph: graph,
    });

    return call.statusCode === 200 && call.value !== null
        ? call.value.graph
        : "";
}
