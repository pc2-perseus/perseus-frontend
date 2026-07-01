import makeAPICall from "../makeAPICall";
import HTTPMethod from "../HTTPMethod";
import APIResponse from "../APIResponse";

export default async function enableAndromedaModule(
    moduleName: string
): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall(
        HTTPMethod.POST,
        `/service/Andromeda/module/${encodeURIComponent(moduleName)}`,
        {}
    );

    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
