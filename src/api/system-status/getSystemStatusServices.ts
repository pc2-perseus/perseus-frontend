import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import SystemStatusService from "../../interfaces/SystemStatusService.ts";

export default async function getSystemStatusServices(): Promise<
    SystemStatusService[]
> {
    const call: APIResponse<{ services: SystemStatusService[] }> =
        await makeAPICall<{ services: SystemStatusService[] }>(
            HTTPMethod.GET,
            "/service/SystemStatus/services"
        );

    return call.statusCode === 200 && call.value !== null
        ? call.value.services
        : [];
}
