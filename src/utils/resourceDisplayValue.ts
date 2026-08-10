import Resource from "../interfaces/Resource.ts";

export default function resourceDisplayValue(
    value: number,
    resource: Resource | undefined
): number {
    return (
        Math.round(
            (value /
                (resource?.display_unit_factor !== undefined
                    ? resource.display_unit_factor
                    : 1)) *
                1000
        ) / 1000
    );
}
