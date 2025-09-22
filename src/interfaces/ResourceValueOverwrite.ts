export default interface ResourceValueOverwrite {
    overwrite_id: string;
    type: "SET_PRIORITY" | "SET_VALUE" | "ADD_PARTITION" | "REMOVE_PARTITION";
    start: string;
    end: string;
    value: string | number | null;
    comment: string | null;
}
