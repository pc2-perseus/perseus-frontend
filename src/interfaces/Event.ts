export default interface Event {
    state_id: string;
    value: string | string[] | null;
    comment: string | null;
    by: string | null;
    occurred: string;
    state_overwrite: string[] | null;
}
