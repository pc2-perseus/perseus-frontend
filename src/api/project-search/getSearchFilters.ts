// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import SearchFilter from "../../interfaces/SearchFilter.ts";

export default async function getSearchFilters(): Promise<SearchFilter[]> {
    const call: APIResponse<{
        filters: SearchFilter[];
    }> = await makeAPICall<{ filters: SearchFilter[] }>(
        HTTPMethod.GET,
        "/service/ProjectSearch/filters"
    );

    return call.statusCode == 200 && call.value !== null
        ? call.value.filters
        : [];
}
