// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";

export default async function addNote(
    projectId: string,
    note: string
): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall<{
        result: boolean;
    }>(HTTPMethod.POST, "/service/Notes/add", {
        project_oid: projectId,
        note: note,
    });
    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
