import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";

export default async function getPersonResourceUsage(
    personId: string
): Promise<{ [projectOid: string]: { resource_id: string; value: number }[] }> {
    const call: APIResponse<{
        used: {
            [projectOid: string]: { resource_id: string; value: number }[];
        } | null;
    }> = await makeAPICall<{
        used: {
            [projectOid: string]: { resource_id: string; value: number }[];
        } | null;
    }>(
        HTTPMethod.GET,
        "/service/Usage/used-contingents?person_oid=" +
            encodeURIComponent(personId)
    );
    return call.statusCode === 200 &&
        call.value !== null &&
        call.value.used !== null
        ? call.value.used
        : {};
}
