import DatabaseItem from "./DatabaseItem.ts";

export type SystemStatusServiceDomain = "cluster" | "central_services";

export default interface SystemStatusService extends DatabaseItem {
    name: string;
    domain: SystemStatusServiceDomain;
    cluster_id: string | null;
    linked_resource_id: string | null;
    display_rank: number;
    is_active: boolean;
}
