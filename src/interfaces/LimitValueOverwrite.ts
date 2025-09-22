export default interface LimitValueOverwrite {
    overwrite_id: string;
    type: "SET_VALUE";
    start: string;
    end: string;
    value: string | number | null;
    comment: string | null;
}
