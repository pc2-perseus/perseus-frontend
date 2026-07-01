import ResourceValue from "../../../../interfaces/ResourceValue";

export default function getLastPhase(resourceValues: ResourceValue[]): {
    start: Date | null;
    end: Date | null;
} {
    let lastStart: Date | null = null;
    let lastEnd: Date | null = null;

    resourceValues.forEach((rv: ResourceValue) => {
        const rvStart = new Date(rv.start);
        const rvEnd = new Date(rv.end);

        if (
            lastEnd === null ||
            rvEnd.valueOf() > lastEnd.valueOf() ||
            (rvEnd.valueOf() === lastEnd.valueOf() &&
                lastStart !== null &&
                rvStart.valueOf() > lastStart.valueOf())
        ) {
            lastStart = rvStart;
            lastEnd = rvEnd;
        }
    });

    return {
        start: lastStart,
        end: lastEnd,
    };
}
