// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import ComputeProject from "../../interfaces/ComputeProject.ts";

export default async function editComputeProject(
    projectId: string,
    computeProject: ComputeProject,
    resourceChanges: {
        start: string;
        end: string;
        resourceId: string;
        value: number;
    }[],
    limitChanges: {
        start: string;
        end: string;
        limitId: string;
        value: number;
    }[]
): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall<{
        result: boolean;
    }>(HTTPMethod.POST, "/service/ComputeProjectManager/compute-project-edit", {
        project_oid: projectId,
        compute_project_id: computeProject.compute_project_id,
        custom_fields: computeProject.custom_fields,
        resource_changes: resourceChanges,
        limit_changes: limitChanges,
    });
    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
