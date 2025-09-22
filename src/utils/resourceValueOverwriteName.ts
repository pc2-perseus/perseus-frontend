// Custom imports
import ResourceValueOverwrite from "../interfaces/ResourceValueOverwrite.ts";

export default function resourceValueOverwriteName(
    overwrite: ResourceValueOverwrite
): string {
    switch (overwrite.type) {
        case "ADD_PARTITION":
            return "Enable partition";
        case "REMOVE_PARTITION":
            return "Disable partition";
        case "SET_PRIORITY":
            return "Set priority";
        case "SET_VALUE":
            return "Change value";
        default:
            return overwrite.type;
    }
}
