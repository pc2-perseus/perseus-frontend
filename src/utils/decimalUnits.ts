import Decimal from "decimal.js";

function normalizeDecimalString(value: string): string {
    return value.replace(",", ".");
}

export function decimalInputToNumber(value: string): number {
    if (value === "") {
        return 0;
    }

    return new Decimal(normalizeDecimalString(value)).toNumber();
}

export function scaledDecimalInputToNumber(
    value: string,
    factor: number
): number {
    if (value === "") {
        return 0;
    }

    return new Decimal(normalizeDecimalString(value)).mul(factor).toNumber();
}

export function scaledValueToDecimalString(
    value: number | string,
    factor: number
): string {
    return new Decimal(value).div(factor).toString();
}

export function scaledValueToRoundedDecimalString(
    value: number | string,
    factor: number,
    decimalPlaces: number
): string {
    return new Decimal(value).div(factor).toDecimalPlaces(decimalPlaces).toString();
}
