import _ from "lodash";
export default function arrayEquals(a: unknown[], b: unknown[]): boolean {
    const sortedA: unknown[] = [...a].sort();
    const sortedB: unknown[] = [...b].sort();

    return (
        sortedA.length === sortedB.length &&
        sortedA.every((value: unknown, index: number) =>
            _.isEqual(value, sortedB[index])
        )
    );
}
