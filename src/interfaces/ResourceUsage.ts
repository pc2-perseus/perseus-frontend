import DatabaseItem from "./DatabaseItem.ts";
import ResourceUsageAdditionalMetric from "./ResourceUsageAdditionalMetric.ts";
import ResourceUsageAdditionalResource from "./ResourceUsageAdditionalResource.ts";

export default interface ResourceUsage extends DatabaseItem {
    project_oid: string;
    compute_project_id: string;
    resource_id: string;
    start: string;
    end: string;
    value: number;
    contingent_factor: number;
    user: string | null;
    partition: string | null;
    priority: string | null;
    additional_metrics: ResourceUsageAdditionalMetric[];
    additional_resources: ResourceUsageAdditionalResource[];
    additional_data: object;
}
