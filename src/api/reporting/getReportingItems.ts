// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import ReportingItem from "../../interfaces/ReportingItem.ts";

export default async function getReportingItems(): Promise<ReportingItem[]> {
    const call: APIResponse<{
        items: ReportingItem[];
    }> = await makeAPICall<{ items: ReportingItem[] }>(
        HTTPMethod.GET,
        "/service/Reporting/list"
    );

    return call.statusCode == 200 && call.value !== null
        ? call.value.items
        : [];
}
