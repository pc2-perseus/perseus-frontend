// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";

export default async function postSessionToken(
    name: string,
    expires: Date,
    permissions: { http_method: string; endpoint: string }[]
): Promise<string> {
    const call: APIResponse<{ token: string }> = await makeAPICall<{
        token: string;
    }>(HTTPMethod.POST, "/service/SessionManager/token", {
        token_name: name,
        token_expires: expires.toISOString(),
        token_permissions: permissions,
    });
    return call.statusCode === 200 && call.value !== null
        ? call.value.token
        : "";
}
