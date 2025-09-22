// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import ResourceValue from "../../interfaces/ResourceValue.ts";

export default async function unblockComputeProjectResource(
    projectId: string,
    resourceValue: ResourceValue
): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall<{
        result: boolean;
    }>(HTTPMethod.POST, "/service/ComputeProjectManager/resource-unblock", {
        project_oid: projectId,
        item_id: resourceValue.resource_id,
        item_start: resourceValue.start,
        item_end: resourceValue.end,
        compute_project_id: resourceValue.compute_project_id,
    });
    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
