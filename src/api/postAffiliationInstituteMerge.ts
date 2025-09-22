// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import Institute from "../interfaces/Institute.ts";

export default async function postAffiliationInstituteMerge(
    institute: Institute,
    merge: string
): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall<{
        result: boolean;
    }>(HTTPMethod.POST, "/service/AffiliationManager/institute-merge", {
        ins_id: institute._id ? institute._id : null,
        merge_id: merge,
    });
    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
