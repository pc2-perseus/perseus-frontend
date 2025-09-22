// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import FrontendConfiguration from "../../interfaces/FrontendConfiguration.ts";

export default async function updateFrontendConfig(
    configuration: FrontendConfiguration
): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall<{
        result: boolean;
    }>(
        HTTPMethod.POST,
        "/service/FrontendConfigurationManager/update",
        configuration
    );

    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
