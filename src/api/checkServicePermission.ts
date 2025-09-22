// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";

export default async function checkServicePermission(
    serviceId: string
): Promise<boolean> {
    const call: APIResponse<unknown> = await makeAPICall<unknown>(
        HTTPMethod.GET,
        "/service/" + serviceId + "/check"
    );

    return call.statusCode === 200;
}
