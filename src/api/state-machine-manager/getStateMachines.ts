// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import StoredStateMachine from "../../interfaces/StoredStateMachine.ts";

export default async function getStateMachines(): Promise<
    StoredStateMachine[]
> {
    const call: APIResponse<{ state_machines: StoredStateMachine[] }> =
        await makeAPICall<{
            state_machines: StoredStateMachine[];
        }>(HTTPMethod.GET, "/service/StateMachineManager/state-machines");

    return call.statusCode === 200 && call.value !== null
        ? call.value.state_machines
        : [];
}
