// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import FrontendConfiguration from "../../interfaces/FrontendConfiguration.ts";

export default async function getFrontendConfig(): Promise<FrontendConfiguration> {
    const call: APIResponse<{ configuration: FrontendConfiguration }> =
        await makeAPICall<{
            configuration: FrontendConfiguration;
        }>(HTTPMethod.GET, "/service/FrontendConfigurationManager/config");

    return call.statusCode === 200 && call.value !== null
        ? call.value.configuration
        : {
              _id: null,
              files: {},
              file_tags: {},
              project_type_colors: {},
              state_event_colors: {},
              state_event_names: {},
          };
}
