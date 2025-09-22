import LimitValueOverwrite from "./LimitValueOverwrite.ts";
import DatabaseItem from "./DatabaseItem.ts";

export default interface LimitValue extends DatabaseItem {
    limit_id: string;
    value: number;
    start: string;
    end: string;
    affected_users: string[] | null;
    compute_project_id: string | null;
    overwrites: LimitValueOverwrite[];
}
