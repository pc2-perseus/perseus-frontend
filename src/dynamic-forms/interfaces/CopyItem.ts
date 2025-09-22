// Custom imports
import Rule from "./Rule";

export default interface CopyItem {
    type: "copyitem";
    id: string;
    value: string;
    label?: string;
    helperText?: string;
    visibility?: Rule[];
}
