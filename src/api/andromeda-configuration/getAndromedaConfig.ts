import makeAPICall from "../makeAPICall";
import HTTPMethod from "../HTTPMethod";
import APIResponse from "../APIResponse";
import AndromedaConfiguration from "../../interfaces/AndromedaConfiguration";

export default async function getAndromedaConfig(): Promise<AndromedaConfiguration> {
    const call: APIResponse<AndromedaConfiguration> = await makeAPICall(
        HTTPMethod.GET,
        `/service/Andromeda/config`
    );

    if (call.statusCode === 200 && call.value !== null) {
        const { enabled_modules, module_configurations } = call.value;
        return {
            enabled_modules,
            module_configurations,
        };
    }

    throw new Error("Failed to load Andromeda configuration.");
}
