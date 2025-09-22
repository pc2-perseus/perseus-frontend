// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import { DataDeletionEntry } from "../components/services/DataDeletionManager.tsx";

export default async function getDataDeletionEntries(): Promise<
    DataDeletionEntry[]
> {
    const call: APIResponse<{ entries: DataDeletionEntry[] }> =
        await makeAPICall<{
            entries: DataDeletionEntry[];
        }>(HTTPMethod.GET, "/service/DataDeletionManager/entries");

    return call.statusCode === 200 &&
        call.value !== null &&
        call.value.entries !== null
        ? call.value.entries
        : [];
}
