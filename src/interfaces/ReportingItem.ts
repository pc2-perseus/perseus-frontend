import DatabaseItem from "./DatabaseItem.ts";

export default interface ReportingItem extends DatabaseItem {
    name: string;
    registered_service: string;
    description: string | null;
    allow_single_project: boolean;
    allow_time_frame: boolean;
}
