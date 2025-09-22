// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import ComputeProject from "../../interfaces/ComputeProject.ts";

export default async function addComputeProject(
    projectId: string,
    computeProject: ComputeProject
): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall<{
        result: boolean;
    }>(HTTPMethod.POST, "/service/ComputeProjectManager/compute-project-add", {
        project_oid: projectId,
        compute_project_id: computeProject.compute_project_id,
        custom_fields: computeProject.custom_fields,
    });
    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
