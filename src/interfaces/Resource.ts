export default interface Resource {
    _id?: string;
    id: string;
    cluster_id: string;
    name: string;
    resource_type: "cumulative" | "snapshot";
    display_unit: string | null;
    display_unit_factor: number;
}
