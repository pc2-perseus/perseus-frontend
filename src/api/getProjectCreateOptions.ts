// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";

export default async function getProjectCreateOptions(): Promise<{
    types: string[];
    calls: string[];
}> {
    const call: APIResponse<{ types: string[]; calls: string[] }> =
        await makeAPICall<{
            types: string[];
            calls: string[];
        }>(HTTPMethod.GET, "/service/ProjectCreate/options");

    return call.statusCode === 200 && call.value !== null
        ? call.value
        : { types: [], calls: [] };
}
