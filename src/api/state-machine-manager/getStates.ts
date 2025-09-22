// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";

export default async function getStates(): Promise<string[]> {
    const call: APIResponse<{ states: string[] }> = await makeAPICall<{
        states: string[];
    }>(HTTPMethod.GET, "/service/StateMachineManager/states");

    return call.statusCode === 200 && call.value !== null
        ? call.value.states
        : [];
}
