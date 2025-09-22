import DatabaseItem from "./DatabaseItem.ts";

export default interface ResourcePriority extends DatabaseItem {
    priority_id: string;
    value: number;
}
