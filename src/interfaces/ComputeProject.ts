import DatabaseItem from "./DatabaseItem.ts";

export default interface ComputeProject extends DatabaseItem {
    compute_project_id: string;
    custom_fields: { [key: string]: string };
}
