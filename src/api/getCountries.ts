// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";

export default async function getCountries(): Promise<
    { name: string; iso_code: string }[]
> {
    const call: APIResponse<{
        countries: { name: string; iso_code: string }[];
    }> = await makeAPICall<{ countries: { name: string; iso_code: string }[] }>(
        HTTPMethod.GET,
        "/country"
    );

    return call.statusCode == 200 && call.value !== null
        ? call.value.countries
        : [];
}
