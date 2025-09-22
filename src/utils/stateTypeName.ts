import FrontendConfiguration from "../interfaces/FrontendConfiguration.ts";
import _ from "lodash";

export function stateTypeName(
    eventType: string,
    config: FrontendConfiguration | null
) {
    let name: string = eventType;
    if (config === null) {
        return name;
    }
    _.keys(config.state_event_names).forEach((state: string) => {
        if (eventType === state && config.state_event_names[state] !== null) {
            name = config.state_event_names[state];
        }
    });
    return name;
}
