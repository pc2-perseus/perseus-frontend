// React imports
import React from "react";
import { useParams } from "react-router-dom";

// Custom imports
import ProjectSearch from "./project-search/ProjectSearch.tsx";
import PersonSearch from "./person-search/PersonSearch.tsx";
import DataExport from "./DataExport.tsx";
import ProjectEdit from "./project-edit/ProjectEdit.tsx";
import SessionManager from "./SessionManager.tsx";
import DataDeletionManager from "./DataDeletionManager.tsx";
import RoleManager from "./RoleManager.tsx";
import ProjectCreation from "./ProjectCreation.tsx";
import PersonEdit from "./PersonEdit.tsx";
import PersonCreation from "./PersonCreation.tsx";
import AffiliationManager from "./AffiliationManager.tsx";
import Settings from "./Settings.tsx";
import LogService from "./LogService.tsx";
import ResourceManager from "./ResourceManager.tsx";
import VerticalCardListService from "./VerticalCardListService.tsx";
import Reporting from "./reporting/Reporting.tsx";
import EmailTemplateManager from "./email-template-manager/EmailTemplateManager.tsx";
import PriorityManager from "./PriorityManager.tsx";
import StateMachineManager from "./state-machine-manager/StateMachineManager.tsx";
import FrontendConfigurationManager from "./FrontendConfigurationManager.tsx";

export default function Service({
    serviceId,
    keyword,
}: {
    serviceId: string;
    keyword: string | null;
}): React.ReactElement {
    const { subPath } = useParams();

    if (keyword === "service-VerticalCardListService") {
        return <VerticalCardListService serviceId={serviceId} />;
    }

    switch (serviceId) {
        case "RoleManager":
            return <RoleManager />;
        case "EmailTemplateManager":
            return <EmailTemplateManager />;
        case "ProjectCreate":
            return <ProjectCreation />;
        case "ProjectEdit":
            return <ProjectEdit projectId={subPath} />;
        case "ProjectSearch":
            return <ProjectSearch projectId={subPath} />;
        case "PersonSearch":
            return <PersonSearch personId={subPath} />;
        case "PersonEdit":
            return <PersonEdit personId={subPath} />;
        case "DataExport":
            return <DataExport />;
        case "SessionManager":
            return <SessionManager />;
        case "DataDeletionManager":
            return <DataDeletionManager />;
        case "PersonCreate":
            return <PersonCreation />;
        case "AffiliationManager":
            return <AffiliationManager />;
        case "Settings":
            return <Settings />;
        case "ProductionLogs":
            return <LogService type="production" />;
        case "DevelopmentLogs":
            return <LogService type="development" />;
        case "Reporting":
            return <Reporting report={subPath} />;
        case "ResourceManager":
            return <ResourceManager />;
        case "PriorityManager":
            return <PriorityManager />;
        case "StateMachineManager":
            return <StateMachineManager />;
        case "FrontendConfigurationManager":
            return <FrontendConfigurationManager />;
        default:
            return <>{serviceId}</>;
    }
}
