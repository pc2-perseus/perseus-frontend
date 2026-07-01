import makeAPICall from "../makeAPICall";
import HTTPMethod from "../HTTPMethod";
import APIResponse from "../APIResponse";

export default async function disableAndromedaModule(
    moduleName: string
): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall(
        HTTPMethod.DELETE,
        `/service/Andromeda/module/${encodeURIComponent(moduleName)}`
    );

    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
