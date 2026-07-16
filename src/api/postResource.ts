// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import Resource from "../interfaces/Resource.ts";

export default async function postResource(
    resource: Resource
): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall<{
        result: boolean;
    }>(HTTPMethod.POST, "/service/ResourceManager/resource", {
        resource_id: resource._id ? resource._id : null,
        item_id: resource.id,
        name: resource.name,
        cluster_id: resource.cluster_id,
        resource_type: resource.resource_type,
        display_unit: resource.display_unit,
        display_unit_factor: resource.display_unit_factor,
        parent_oid: resource.parent_oid,
        default_partitions: resource.default_partitions,
        trackable_resources: resource.trackable_resources,
        minimum: resource.minimum,
        maximum: resource.maximum,
        default_value: resource.default_value,
    });
    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
