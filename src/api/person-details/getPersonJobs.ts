import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import Job from "../../interfaces/Job.ts";

export default async function getPersonJobs(
    personId: string,
    page: number,
    pageSize: number
): Promise<Job[] | null> {
    const call: APIResponse<{ jobs: Job[] }> = await makeAPICall<{
        jobs: Job[];
    }>(
        HTTPMethod.GET,
        "/service/JobManager/user/" +
            encodeURIComponent(personId) +
            "?page=" +
            page +
            "&page_size=" +
            pageSize
    );
    return call.statusCode === 200 && call.value !== null
        ? call.value.jobs
        : null;
}
