// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import ResourceValue from "../../interfaces/ResourceValue.ts";
import ResourceValueOverwrite from "../../interfaces/ResourceValueOverwrite.ts";
import isValueNumeric from "../../utils/isValueNumeric.ts";

export default async function addResourceOverwrite(
    projectId: string,
    resourceValue: ResourceValue,
    overwrite: ResourceValueOverwrite
): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall<{
        result: boolean;
    }>(HTTPMethod.POST, "/service/ComputeProjectManager/resource-overwrite", {
        project_oid: projectId,
        item_id: resourceValue.resource_id,
        item_start: resourceValue.start,
        item_end: resourceValue.end,
        compute_project_id: resourceValue.compute_project_id,
        overwrite_id:
            overwrite.overwrite_id.length === 0 ? null : overwrite.overwrite_id,
        overwrite_type: overwrite.type,
        overwrite_start: overwrite.start,
        overwrite_end: overwrite.end,
        overwrite_value:
            overwrite.value === ""
                ? null
                : isValueNumeric(overwrite.value)
                  ? Number(overwrite.value)
                  : overwrite.value,
        overwrite_comment: overwrite.comment === "" ? null : overwrite.comment,
    });
    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
