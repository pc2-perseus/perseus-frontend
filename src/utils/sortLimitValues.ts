import LimitValue from "../interfaces/LimitValue.ts";
import Limit from "../interfaces/Limit.ts";
import limitMatch from "./limitMatch.ts";

export default function sortLimitValues(
    limitValues: LimitValue[],
    limits: Limit[]
): LimitValue[] {
    return JSON.parse(JSON.stringify(limitValues)).sort(
        (lv1: LimitValue, lv2: LimitValue): number => {
            const l1: Limit | undefined = limitMatch(lv1, limits);
            const l2: Limit | undefined = limitMatch(lv2, limits);

            if (l1 === undefined && l2 !== undefined) {
                return -1;
            } else if (l1 !== undefined && l2 === undefined) {
                return 1;
            } else if (l1 !== undefined && l2 !== undefined) {
                return l1.name.localeCompare(l2.name);
            }
            return lv1.limit_id.localeCompare(lv2.limit_id);
        }
    );
}
