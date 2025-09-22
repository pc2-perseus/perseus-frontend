// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";

export default async function getLog(
    type: "production" | "development",
    offset: number = 0
): Promise<string[]> {
    let endpoint = "";
    switch (type) {
        case "development":
            endpoint = "/service/DevelopmentLogs/";
            break;
        case "production":
            endpoint = "/service/ProductionLogs/";
            break;
    }
    const call: APIResponse<{ lines: string[] }> = await makeAPICall<{
        lines: string[];
    }>(HTTPMethod.GET, endpoint + offset.toString());

    return call.statusCode === 200 && call.value !== null
        ? call.value.lines
        : [];
}
