import _ from "lodash";

export default function formatNumber(value: number): string {
    let rounded: number = Math.round((value + Number.EPSILON) * 1000) / 1000;

    if (rounded >= 1000) {
        rounded = _.round(rounded);
    } else if (rounded >= 100) {
        rounded = _.round(rounded, 1);
    } else if (rounded >= 10) {
        rounded = _.round(rounded, 2);
    }

    return new Intl.NumberFormat("en-GB").format(rounded);
}
