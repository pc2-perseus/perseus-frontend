// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";

export default async function editResources(
    projectId: string,
    note: string | null,
    updated_resource_values: {
        resource_id: string;
        compute_project_id: string | null;
        start: string;
        end: string;
        value: number;
    }[]
): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall<{
        result: boolean;
    }>(HTTPMethod.POST, "/service/GrantedResourceChanges/" + projectId, {
        note: note,
        updated_resource_values: updated_resource_values,
    });
    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
