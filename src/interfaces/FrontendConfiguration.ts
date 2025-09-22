import DatabaseItem from "./DatabaseItem.ts";

export default interface FrontendConfiguration extends DatabaseItem {
    project_type_colors: { [key: string]: string | null };
    state_event_colors: { [key: string]: string | null };
    state_event_names: { [key: string]: string | null };
}
