// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import Project from "../../interfaces/Project.ts";

export default async function searchProjects(
    search: string,
    filters: {
        [key: string]: (boolean | string | number)[];
    },
    page: number | null = null,
    size: number | null = null
): Promise<Project[]> {
    const call: APIResponse<{
        projects: Project[];
    }> = await makeAPICall<{ projects: Project[] }>(
        HTTPMethod.POST,
        "/service/ProjectSearch/search",
        {
            search: search,
            filters: filters,
            page: page,
            size: size,
        }
    );

    return call.statusCode == 200 && call.value !== null
        ? call.value.projects
        : [];
}
