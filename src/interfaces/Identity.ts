import DatabaseItem from "./DatabaseItem.ts";

export default interface Identity extends DatabaseItem {
    external_id: string;
    provider: string;
    linked_at: string | null;
}
