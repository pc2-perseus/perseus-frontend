// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import ResourcePriority from "../../interfaces/ResourcePriority.ts";

export default async function updatePriority(
    priority: ResourcePriority
): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall<{
        result: boolean;
    }>(HTTPMethod.POST, "/service/PriorityManager/" + priority._id, {
        priority_id: priority.priority_id,
        value: priority.value,
        indicator_color: priority.indicator_color,
    });

    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
