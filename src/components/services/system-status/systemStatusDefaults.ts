import SystemStatusEntry from "../../../interfaces/SystemStatusEntry.ts";
import SystemStatusCategory from "../../../interfaces/SystemStatusCategory.ts";
import SystemStatusService, {
    SystemStatusServiceDomain,
} from "../../../interfaces/SystemStatusService.ts";

export const SYSTEM_STATUS_CATEGORY_ORDER: SystemStatusCategory[] = [
    SystemStatusCategory.ERROR,
    SystemStatusCategory.WARNING,
    SystemStatusCategory.INFO,
    SystemStatusCategory.RUNNING,
];

export function createEmptySystemStatusEntry(): SystemStatusEntry {
    return {
        _id: null,
        files: {},
        file_tags: {},
        service_oids: [],
        title: "",
        description: "",
        category: SystemStatusCategory.INFO,
        status_type: "",
        start: null,
        end: null,
        global_alert: false,
    };
}

export function createEmptySystemStatusService(
    domain: SystemStatusServiceDomain,
    clusterId: string | null = null
): SystemStatusService {
    return {
        _id: null,
        files: {},
        file_tags: {},
        name: "",
        domain,
        cluster_id: clusterId,
        linked_resource_id: null,
        display_rank: 0,
        is_active: true,
    };
}
