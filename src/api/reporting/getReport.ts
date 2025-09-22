// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";

export default async function getReport(
    reportServiceId: string,
    start: string | null,
    end: string | null,
    projectId: string | null
): Promise<{
    name: string;
    created_at: string;
    markdown: string[];
    data: object | null;
    charts: string[];
    documents: string[];
}> {
    const filters = [
        start !== null ? "start=" + start : null,
        end !== null ? "end=" + end : null,
        projectId !== null ? "project_oid=" + projectId : null,
    ].filter((x) => x !== null);
    const call: APIResponse<{
        name: string;
        created_at: string;
        markdown: string[];
        data: object | null;
        charts: string[];
        documents: string[];
    }> = await makeAPICall<{
        name: string;
        created_at: string;
        markdown: string[];
        data: object | null;
        charts: string[];
        documents: string[];
    }>(
        HTTPMethod.GET,
        "/reporting/" +
            reportServiceId +
            (filters.length > 0 ? "?" + filters.join("&") : "")
    );

    return call.statusCode == 200 && call.value !== null
        ? call.value
        : {
              name: "",
              markdown: [],
              created_at: "",
              data: null,
              charts: [],
              documents: [],
          };
}
