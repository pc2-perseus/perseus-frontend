export default function isValueNumeric(value: unknown) {
    const s = String(value);
    return (
        !isNaN(+s) &&
        isFinite(+s) &&
        (typeof value === "number" || !/e/i.test(s))
    );
}
