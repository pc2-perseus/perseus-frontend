// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import Project from "../../interfaces/Project.ts";

export default async function getPredecessor(
    projectId: string
): Promise<Project | null> {
    const call: APIResponse<{ project: Project | null }> = await makeAPICall<{
        project: Project | null;
    }>(
        HTTPMethod.GET,
        "/service/ProjectSearch/" + projectId + "?action=predecessor"
    );
    return call.statusCode === 200 && call.value !== null
        ? call.value.project
        : null;
}
