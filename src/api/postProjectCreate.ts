// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";

export default async function postProjectCreate(
    title: string,
    abbreviation: string,
    start: string,
    end: string,
    type: string,
    project_call: string
): Promise<string | null> {
    const call: APIResponse<{ oid: string }> = await makeAPICall<{
        oid: string;
    }>(HTTPMethod.POST, "/service/ProjectCreate/create", {
        title: title,
        abbreviation: abbreviation,
        start: start,
        end: end,
        project_type: type,
        call: project_call,
    });
    return call.statusCode === 200 && call.value !== null
        ? call.value.oid
        : null;
}
