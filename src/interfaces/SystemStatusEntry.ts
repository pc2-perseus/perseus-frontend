import DatabaseItem from "./DatabaseItem.ts";
import SystemStatusCategory from "./SystemStatusCategory.ts";

export default interface SystemStatusEntry extends DatabaseItem {
    service_oids: string[];
    title: string;
    description: string;
    category: SystemStatusCategory;
    status_type: string;
    start: string | null;
    end: string | null;
    global_alert: boolean;
}
