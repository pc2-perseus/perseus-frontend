// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";

export default async function getUsage(
    projectId: string,
    compute_project_id: string
): Promise<
    | {
          resource_id: string;
          phases: { start: string; end: string; value: number; max: number }[];
      }[]
    | null
> {
    const call: APIResponse<{
        used:
            | {
                  resource_id: string;
                  phases: {
                      start: string;
                      end: string;
                      value: number;
                      max: number;
                  }[];
              }[]
            | null;
    }> = await makeAPICall<{
        used:
            | {
                  resource_id: string;
                  phases: {
                      start: string;
                      end: string;
                      value: number;
                      max: number;
                  }[];
              }[]
            | null;
    }>(
        HTTPMethod.GET,
        "/service/Usage/used-contingents?project_oid=" +
            projectId +
            "&compute_project_id=" +
            compute_project_id
    );
    return call.statusCode === 200 && call.value !== null
        ? call.value.used
        : null;
}
