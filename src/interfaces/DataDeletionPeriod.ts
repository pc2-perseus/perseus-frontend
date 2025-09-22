import DatabaseItem from "./DatabaseItem.ts";
import { DataDeletionKey } from "./DataDeletionKey.ts";

export default interface DataDeletionPeriod extends DatabaseItem {
    state_id: string;
    key: DataDeletionKey;
    additional_period: number;
}
