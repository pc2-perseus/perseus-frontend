// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import Organization from "../interfaces/Organization.ts";
import Institute from "../interfaces/Institute.ts";

export default async function getAffiliationsData(
    affiliationIds: string[]
): Promise<{
    institutes: Institute[];
    organizations: Organization[];
}> {
    const call: APIResponse<{
        institutes: Institute[];
        organizations: Organization[];
    }> = await makeAPICall<{
        institutes: Institute[];
        organizations: Organization[];
    }>(
        HTTPMethod.GET,
        "/service/AffiliationManager/affiliations?affiliation_id=" +
            affiliationIds.join(",")
    );
    return call.statusCode === 200 && call.value !== null
        ? call.value
        : {
              institutes: [],
              organizations: [],
          };
}
