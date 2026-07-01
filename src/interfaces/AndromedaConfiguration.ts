export interface JSONObject {
    [key: string]: unknown;
}

export default interface AndromedaConfiguration {
    enabled_modules: string[];
    module_configurations: { [key: string]: JSONObject };
}
