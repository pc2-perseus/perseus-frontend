import LimitValue from "../interfaces/LimitValue.ts";
import Limit from "../interfaces/Limit.ts";

export default function limitMatch(
    limitValue: LimitValue,
    limits: Limit[]
): Limit | undefined {
    try {
        return limits.filter((l) => l.id === limitValue.limit_id)[0];
    } catch {
        return undefined;
    }
}
