import FrontendConfiguration from "../interfaces/FrontendConfiguration.ts";
import _ from "lodash";

export function stateTypeColor(
    eventType: string,
    config: FrontendConfiguration | null
): string {
    let color: string = "rgba(0, 0, 0, 0)";
    if (config === null) {
        return color;
    }
    _.keys(config.state_event_colors).forEach((state: string) => {
        if (eventType === state && config.state_event_colors[state] !== null) {
            color = config.state_event_colors[state];
        }
    });
    return color;
}
