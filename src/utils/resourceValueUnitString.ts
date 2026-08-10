import ResourceValue from "../interfaces/ResourceValue.ts";
import Resource from "../interfaces/Resource.ts";
import formatNumber from "./formatNumber.ts";
import resourceDisplayValue from "./resourceDisplayValue.ts";

export default function resourceValueUnitString(
    resourceValue: ResourceValue,
    resource: Resource | undefined
) {
    return (
        formatNumber(resourceDisplayValue(resourceValue.value, resource)) +
        (resource?.display_unit === null || resource?.display_unit === undefined
            ? ""
            : " " + resource?.display_unit)
    );
}
