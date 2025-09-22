// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";

export default async function getGDPR(
    personId: string
): Promise<string | null> {
    const call: APIResponse<{ file_id: string }> = await makeAPICall<{
        file_id: string;
    }>(HTTPMethod.GET, "/service/GDPR/" + personId);

    return call.statusCode === 200 && call.value !== null
        ? call.value.file_id
        : null;
}

export async function getGDPRCheck(): Promise<boolean> {
    const call: APIResponse<object> = await makeAPICall<object>(
        HTTPMethod.GET,
        "/service/GDPR/check"
    );
    return call.statusCode === 200;
}
