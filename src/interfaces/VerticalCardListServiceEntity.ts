import VerticalCardListServiceEntityContentItem from "./VerticalCardListServiceEntityContentItem.ts";
import { Input } from "../dynamic-forms/interfaces/Input.ts";

export default interface VerticalCardListServiceEntity {
    entity_id: string;
    name: string;
    items: VerticalCardListServiceEntity[];
    adding_allowed: boolean;
    editing_allowed: boolean;
    deleting_allowed: boolean;
    content: VerticalCardListServiceEntityContentItem[];
    adding_elements: Input[];
}
