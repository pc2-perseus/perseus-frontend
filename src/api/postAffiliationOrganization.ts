// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import Organization from "../interfaces/Organization.ts";

export default async function postAffiliationOrganization(
    organization: Organization
): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall<{
        result: boolean;
    }>(HTTPMethod.POST, "/service/AffiliationManager/organization", {
        org_id: organization._id ? organization._id : null,
        name: organization.name,
        secondary_names: organization.secondary_names,
        location_street: organization.location.street,
        location_postal_code: organization.location.postal_code,
        location_city: organization.location.city,
        location_state: organization.location.state,
        location_country: organization.location.country,
    });
    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
