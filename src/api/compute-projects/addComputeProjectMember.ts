// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";

export default async function addComputeProjectMember(
    personId: string,
    computeProjectId: string,
    projectId: string
): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall<{
        result: boolean;
    }>(
        HTTPMethod.POST,
        `/service/ProjectMembers/${projectId}?compute_project=${computeProjectId}`,
        {
            person_oid: personId,
        }
    );
    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
