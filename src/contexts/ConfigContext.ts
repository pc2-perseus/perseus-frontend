// React imports
import React from "react";
import FrontendConfiguration from "../interfaces/FrontendConfiguration.ts";

const ConfigContext: React.Context<null | FrontendConfiguration> =
    React.createContext<null | FrontendConfiguration>(null);

export default ConfigContext;
