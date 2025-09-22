import ResourceValue from "../interfaces/ResourceValue.ts";
import Resource from "../interfaces/Resource.ts";
import formatNumber from "./formatNumber.ts";

export default function resourceValueUnitString(
    resourceValue: ResourceValue,
    resource: Resource | undefined
) {
    return (
        formatNumber(
            Math.round(
                (resourceValue.value /
                    (resource?.display_unit_factor !== undefined
                        ? resource?.display_unit_factor
                        : 1)) *
                    1000
            ) / 1000
        ) +
        (resource?.display_unit === null || resource?.display_unit === undefined
            ? ""
            : " " + resource?.display_unit)
    );
}
