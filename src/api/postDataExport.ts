// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";

export default async function postDataExport(filter: {
    project_type: string;
}): Promise<object[]> {
    const call: APIResponse<{
        projects: object[];
    }> = await makeAPICall<{
        projects: object[];
    }>(HTTPMethod.POST, "/service/DataExport/export", filter);
    return call.statusCode === 200 && call.value !== null
        ? call.value.projects
        : [];
}
