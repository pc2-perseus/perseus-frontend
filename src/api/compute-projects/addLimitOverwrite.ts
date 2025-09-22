// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import ResourceValueOverwrite from "../../interfaces/ResourceValueOverwrite.ts";
import isValueNumeric from "../../utils/isValueNumeric.ts";
import LimitValue from "../../interfaces/LimitValue.ts";

export default async function addLimitOverwrite(
    projectId: string,
    limitValue: LimitValue,
    overwrite: ResourceValueOverwrite
): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall<{
        result: boolean;
    }>(HTTPMethod.POST, "/service/ComputeProjectManager/limit-overwrite", {
        project_oid: projectId,
        item_id: limitValue.limit_id,
        item_start: limitValue.start,
        item_end: limitValue.end,
        compute_project_id: limitValue.compute_project_id,
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
