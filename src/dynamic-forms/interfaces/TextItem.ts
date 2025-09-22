// Custom imports
import Rule from "./Rule";

export default interface TextItem {
    type: "textitem";
    content: string;
    visibility?: Rule[];
}
