import DatabaseItem from "./DatabaseItem.ts";
import type { JobState } from "./JobState.ts";

export default interface Job extends DatabaseItem {
    job_id: number;
    group_id?: number | null;
    group_index?: number | null;
    job_name: string | null;
    project_oid: string;
    compute_project_id: string;
    cluster_id: string;
    partition: string | null;
    nodes: string[];
    allocated_resources: string[];
    working_directory: string | null;
    submitted: string | null;
    start: string | null;
    end: string | null;
    time_limit: number | null;
    user: string | null;
    state: JobState | null;
    priority_id: string | null;
    reservation: string | null;
    reason: string | null;
    cluster_cockpit_id: number | null;
    additional_data: object;
}
