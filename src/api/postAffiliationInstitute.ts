// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import Institute from "../interfaces/Institute.ts";

export default async function postAffiliationInstitute(
    institute: Institute
): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall<{
        result: boolean;
    }>(HTTPMethod.POST, "/service/AffiliationManager/institute", {
        ins_id: institute._id ? institute._id : null,
        name: institute.name,
        secondary_names: institute.secondary_names,
        org_id: institute.organization_id,
    });
    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
