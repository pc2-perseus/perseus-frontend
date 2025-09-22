// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";

export default async function getVersion(): Promise<string> {
    try {
        const call: APIResponse<{ version: string }> = await makeAPICall<{
            version: string;
        }>(HTTPMethod.GET, "/version");

        return call.value?.version ? call.value?.version : "";
    } catch (e) {
        return "";
    }
}
