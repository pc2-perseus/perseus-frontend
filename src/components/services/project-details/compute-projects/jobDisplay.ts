import Job from "../../../../interfaces/Job.ts";

export type JobIdFormat = "summary" | "full";

export function isGroupJob(job: Job): boolean {
    return typeof job.group_id === "number" && job.group_id > 0;
}

export function formatJobId(job: Job, format: JobIdFormat = "full"): string {
    if (isGroupJob(job)) {
        if (format === "summary") {
            return job.group_id!.toString();
        }

        if (typeof job.group_index === "number" && job.group_index >= 0) {
            return `${job.group_id}_${job.group_index}`;
        }
    }

    return job.job_id.toString();
}

export function getJobRowId(job: Job): string {
    return `${job.cluster_id}-${formatJobId(job)}-${job.job_id}`;
}
