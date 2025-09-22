// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import { OptionsResponse } from "../components/services/DataExport.tsx";

export default async function getDataExportOptions(): Promise<OptionsResponse | null> {
    const call: APIResponse<OptionsResponse> =
        await makeAPICall<OptionsResponse>(
            HTTPMethod.GET,
            "/service/DataExport/options"
        );
    return call.statusCode === 200 && call.value !== null ? call.value : null;
}
