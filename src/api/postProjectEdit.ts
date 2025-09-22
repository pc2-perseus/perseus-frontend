// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";

export default async function postProjectEdit(
    projectId: string,
    changes: object
): Promise<boolean> {
    const call: APIResponse<{ response: boolean }> = await makeAPICall<{
        response: boolean;
    }>(HTTPMethod.POST, "/service/ProjectEdit/" + projectId, changes);
    return call.statusCode === 200 && call.value?.response === true;
}
