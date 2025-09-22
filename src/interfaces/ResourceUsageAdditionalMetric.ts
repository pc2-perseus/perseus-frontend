import DatabaseItem from "./DatabaseItem.ts";

export default interface ResourceUsageAdditionalMetric extends DatabaseItem {
    metric_id: string;
    value: number;
    contingent_factor: number;
}
