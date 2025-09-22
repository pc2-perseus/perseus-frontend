// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import Limit from "../interfaces/Limit.ts";

export default async function postLimit(limit: Limit): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall<{
        result: boolean;
    }>(HTTPMethod.POST, "/service/ResourceManager/limit", {
        limit_id: limit._id ? limit._id : null,
        item_id: limit.id,
        name: limit.name,
        display_unit: limit.display_unit,
        display_unit_factor: limit.display_unit_factor,
    });
    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
