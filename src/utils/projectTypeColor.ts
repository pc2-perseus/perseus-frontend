import FrontendConfiguration from "../interfaces/FrontendConfiguration.ts";
import _ from "lodash";

export function projectTypeColor(
    projectType: string | null,
    config: FrontendConfiguration | null
): string {
    projectType = projectType === null ? "unknown" : projectType;
    let color: string = "rgba(0, 0, 0, 0)";
    if (config === null) {
        return color;
    }
    _.keys(config.project_type_colors).forEach((type: string) => {
        if (projectType === type && config.project_type_colors[type] !== null) {
            color = config.project_type_colors[type];
        }
    });
    return color;
}
