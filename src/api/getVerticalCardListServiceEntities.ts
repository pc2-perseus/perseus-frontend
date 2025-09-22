// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import VerticalCardListServiceEntity from "../interfaces/VerticalCardListServiceEntity.ts";

export default async function getVerticalCardListServiceEntities(
    serviceId: string
): Promise<VerticalCardListServiceEntity[]> {
    const call: APIResponse<VerticalCardListServiceEntity[]> =
        await makeAPICall<VerticalCardListServiceEntity[]>(
            HTTPMethod.GET,
            "/vertical-card-list-service/" + serviceId
        );

    return call.statusCode === 200 && call.value !== null ? call.value : [];
}
