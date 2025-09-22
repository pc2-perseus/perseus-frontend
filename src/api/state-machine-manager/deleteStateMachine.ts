// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";

export default async function deleteStateMachine(id: string): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall<{
        result: boolean;
    }>(HTTPMethod.DELETE, "/service/StateMachineManager/" + id);

    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
