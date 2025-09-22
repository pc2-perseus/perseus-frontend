import { Input } from "../dynamic-forms/interfaces/Input.ts";

export default interface VerticalCardListServiceEntityContentItem {
    item_id: string;
    name: string;
    content: string | number | null;
    edit_element: Input | null;
    is_project_oid: boolean;
}
