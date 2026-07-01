export default function getAPIErrorMessage(
    value: unknown,
    fallback: string
): string {
    if (typeof value === "string" && value.trim().length > 0) {
        return value;
    }

    if (value !== null && typeof value === "object") {
        const errorRecord: Record<string, unknown> = value as Record<
            string,
            unknown
        >;
        const candidates: unknown[] = [
            errorRecord.detail,
            errorRecord.message,
            errorRecord.error,
            errorRecord.errors,
        ];

        for (const candidate of candidates) {
            if (typeof candidate === "string" && candidate.trim().length > 0) {
                return candidate;
            }
            if (Array.isArray(candidate) && candidate.length > 0) {
                const joinedErrors: string = candidate
                    .filter((entry: unknown) => typeof entry === "string")
                    .join(", ");
                if (joinedErrors.trim().length > 0) {
                    return joinedErrors;
                }
            }
        }
    }

    return fallback;
}
