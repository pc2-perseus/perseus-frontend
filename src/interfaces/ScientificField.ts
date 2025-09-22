import DatabaseItem from "./DatabaseItem.ts";

export default interface ScientificField extends DatabaseItem {
    version: string;
    subject_id: string;
    name: string | null;
}
