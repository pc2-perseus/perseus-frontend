import DatabaseItem from "./DatabaseItem.ts";
import { DataDeletionKey } from "./DataDeletionKey.ts";

export default interface DataDeletionEntry extends DatabaseItem {
    project_oid: string;
    key: DataDeletionKey;
    deletion_date: string;
}
