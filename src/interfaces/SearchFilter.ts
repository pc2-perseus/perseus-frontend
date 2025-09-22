import DatabaseItem from "./DatabaseItem.ts";

export default interface SearchFilter extends DatabaseItem {
    filter_id: string;
    name: string;
    options: { label: string; value: string }[];
}
