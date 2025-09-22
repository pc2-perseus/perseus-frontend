// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";

export default async function getNationality(isoCode: string): Promise<{
    iso_code: string;
    name: string;
}> {
    const call: APIResponse<{ iso_code: string; name: string }> =
        await makeAPICall<{ iso_code: string; name: string }>(
            HTTPMethod.GET,
            "/country/" + isoCode
        );

    return call.statusCode === 200 && call.value !== null
        ? call.value
        : { iso_code: "", name: "" };
}
