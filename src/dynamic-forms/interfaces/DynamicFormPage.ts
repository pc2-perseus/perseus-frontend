// Custom imports
import { Input } from "./Input";
import TextItem from "./TextItem";
import CopyItem from "./CopyItem";

export default interface DynamicFormPage {
    title?: string;
    items: (Input | TextItem | CopyItem)[];
}
