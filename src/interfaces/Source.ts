import DatabaseItem from "./DatabaseItem.ts";

export default interface Source extends DatabaseItem {
    name: string;
    foreign_id: string;
    created: string;
    is_followup: boolean;
    predecessor_id: string | null;
    raw: { [key: string]: unknown };
}
