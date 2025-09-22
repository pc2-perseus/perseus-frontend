// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";

export default async function getPersonCreateOptions(): Promise<
    { label: string; value: string }[]
> {
    const call: APIResponse<{ countries: { label: string; value: string }[] }> =
        await makeAPICall<{ countries: { label: string; value: string }[] }>(
            HTTPMethod.GET,
            "/service/PersonCreate/options"
        );

    return call.statusCode === 200 && call.value !== null
        ? call.value.countries
        : [];
}
