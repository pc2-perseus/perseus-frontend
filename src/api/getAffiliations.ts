// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import Organization from "../interfaces/Organization.ts";
import Institute from "../interfaces/Institute.ts";

export default async function getAffiliations(): Promise<
    { organization: Organization; institutes: Institute[] }[]
> {
    const call: APIResponse<{
        affiliations: { organization: Organization; institutes: Institute[] }[];
    }> = await makeAPICall<{
        affiliations: { organization: Organization; institutes: Institute[] }[];
    }>(HTTPMethod.GET, "/service/AffiliationManager/all");

    return call.statusCode === 200 && call.value !== null
        ? call.value.affiliations
        : [];
}
