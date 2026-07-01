import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import SystemStatusEntry from "../../interfaces/SystemStatusEntry.ts";

export default async function getSystemStatusEntries(): Promise<
    SystemStatusEntry[]
> {
    const call: APIResponse<{ entries: SystemStatusEntry[] }> =
        await makeAPICall<{ entries: SystemStatusEntry[] }>(
            HTTPMethod.GET,
            "/service/SystemStatus/entries"
        );

    return call.statusCode === 200 && call.value !== null
        ? call.value.entries
        : [];
}
