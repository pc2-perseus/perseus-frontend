import makeAPICall from "../makeAPICall";
import HTTPMethod from "../HTTPMethod";
import APIResponse from "../APIResponse";
import { JSONObject } from "../../interfaces/AndromedaConfiguration";

export default async function updateAndromedaModuleConfig(
    moduleName: string,
    configuration: JSONObject
): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall(
        HTTPMethod.POST,
        `/service/Andromeda/module/${encodeURIComponent(moduleName)}/config`,
        configuration
    );

    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
