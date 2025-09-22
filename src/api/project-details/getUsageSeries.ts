// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import ResourceUsage from "../../interfaces/ResourceUsage.ts";

export default async function getUsageSeries(
    projectId: string,
    compute_project_id: string
): Promise<ResourceUsage[] | null> {
    const call: APIResponse<{
        used: ResourceUsage[] | null;
    }> = await makeAPICall<{
        used: ResourceUsage[] | null;
    }>(
        HTTPMethod.GET,
        "/service/Usage/" +
            projectId +
            "?compute_project_id=" +
            compute_project_id
    );
    return call.statusCode === 200 && call.value !== null
        ? call.value.used
        : null;
}
