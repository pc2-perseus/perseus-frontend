export default interface Resource {
    _id?: string;
    id: string;
    cluster_id: string;
    name: string;
    resource_type: "cumulative" | "snapshot";
    display_unit: string | null;
    display_unit_factor: number;
    parent_oid: string | null;
    default_partitions: string[];
    trackable_resources: string[];
    minimum: number | null;
    maximum: number | null;
    default_value: number | null;
}
