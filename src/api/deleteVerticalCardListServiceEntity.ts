// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import VerticalCardListServiceEntity from "../interfaces/VerticalCardListServiceEntity.ts";

export default async function deleteVerticalCardListServiceEntity(
    serviceId: string,
    entity: VerticalCardListServiceEntity
): Promise<boolean> {
    const call: APIResponse<unknown> = await makeAPICall<unknown>(
        HTTPMethod.DELETE,
        "/vertical-card-list-service/" + serviceId + "/" + entity.entity_id
    );

    return call.statusCode === 200;
}
