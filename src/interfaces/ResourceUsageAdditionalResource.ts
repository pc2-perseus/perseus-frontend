import DatabaseItem from "./DatabaseItem.ts";

export default interface ResourceUsageAdditionalResource extends DatabaseItem {
    resource_id: string;
    value: number;
    contingent_factor: number;
}
