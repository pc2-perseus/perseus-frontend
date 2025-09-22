// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";

export default async function getFileTagSuggestions(): Promise<string[]> {
    const call: APIResponse<string[]> = await makeAPICall<string[]>(
        HTTPMethod.GET,
        "/file/tags"
    );
    return call.statusCode === 200 && call.value !== null ? call.value : [];
}
