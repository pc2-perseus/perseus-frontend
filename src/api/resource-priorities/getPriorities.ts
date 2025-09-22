// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import ResourcePriority from "../../interfaces/ResourcePriority.ts";

export default async function getPriorities(): Promise<ResourcePriority[]> {
    const call: APIResponse<{ resource_priorities: ResourcePriority[] }> =
        await makeAPICall<{
            resource_priorities: ResourcePriority[];
        }>(HTTPMethod.GET, "/service/PriorityManager/all");

    return call.statusCode === 200 && call.value !== null
        ? call.value.resource_priorities
        : [];
}
