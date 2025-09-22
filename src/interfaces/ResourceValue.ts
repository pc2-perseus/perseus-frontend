import ResourceValueOverwrite from "./ResourceValueOverwrite.ts";
import DatabaseItem from "./DatabaseItem.ts";

export default interface ResourceValue extends DatabaseItem {
    resource_id: string;
    value: number;
    start: string;
    end: string;
    compute_project_id: string | null;
    partitions: string[];
    overwrites: ResourceValueOverwrite[];
    priority: number;
    blocked: boolean;
}
