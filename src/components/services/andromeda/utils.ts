import { JSONObject } from "../../../interfaces/AndromedaConfiguration";

export type LoadingAction = "toggle" | "config" | null;

export function parseJSONObject(value: string): JSONObject | null {
    try {
        const parsed: unknown = JSON.parse(value);
        if (
            typeof parsed !== "object" ||
            parsed === null ||
            Array.isArray(parsed)
        ) {
            return null;
        }

        return parsed as JSONObject;
    } catch (error) {
        return null;
    }
}
