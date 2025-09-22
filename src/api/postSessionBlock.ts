// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";

export default async function postSessionBlock(
    sessionId: string
): Promise<boolean> {
    const call: APIResponse<object> = await makeAPICall<object>(
        HTTPMethod.POST,
        "/service/SessionManager/block",
        { session_id: sessionId }
    );
    return call.statusCode === 200 && call.value !== null;
}
