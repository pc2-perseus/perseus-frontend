// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import Project from "../../interfaces/Project.ts";

export default async function editProject(
    project: Project,
    comment: string
): Promise<boolean> {
    const call: APIResponse<{ response: boolean }> = await makeAPICall<{
        response: boolean;
    }>(HTTPMethod.POST, "/service/ProjectEdit/" + project._id, {
        comment: comment,
        edited_project: project,
    });
    return call.statusCode === 200 && call.value?.response === true;
}
