import React from "react";
import { Box, Card, Tab, Tabs } from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DataUsageIcon from "@mui/icons-material/DataUsage";
import Project from "../../../interfaces/Project.ts";
import Cluster from "../../../interfaces/Cluster.ts";
import Resource from "../../../interfaces/Resource.ts";
import PersonJobsPanel from "./PersonJobsPanel.tsx";
import PersonProjectsPanel from "./PersonProjectsPanel.tsx";
import PersonResourcesPanel from "./PersonResourcesPanel.tsx";

type PanelId = "jobs" | "projects" | "resources";

export default function PersonOverviewCard({
    personId,
    projects,
    clusters,
    resources,
}: {
    personId: string;
    projects: Project[];
    clusters: Cluster[];
    resources: Resource[];
}): React.ReactElement {
    const [activeTab, setActiveTab] = React.useState<PanelId>("jobs");
    const [visitedTabs, setVisitedTabs] = React.useState<Set<PanelId>>(
        new Set(["jobs"])
    );

    function handleTabChange(_event: React.SyntheticEvent, value: PanelId) {
        setActiveTab(value);
        setVisitedTabs((prev) => new Set(prev).add(value));
    }

    return (
        <Card
            variant="outlined"
            sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
            >
                <Tab
                    value="jobs"
                    icon={<WorkIcon />}
                    iconPosition="start"
                    label="Jobs"
                />
                <Tab
                    value="projects"
                    icon={<AssignmentIcon />}
                    iconPosition="start"
                    label="Projects"
                />
                <Tab
                    value="resources"
                    icon={<DataUsageIcon />}
                    iconPosition="start"
                    label="Resources"
                />
            </Tabs>
            <Box sx={{ p: 1, flexGrow: 1, minHeight: 0, overflow: "auto" }}>
                {visitedTabs.has("jobs") ? (
                    <Box
                        sx={{
                            display: activeTab === "jobs" ? "block" : "none",
                            height: "100%",
                        }}
                    >
                        <PersonJobsPanel
                            personId={personId}
                            projects={projects}
                            clusters={clusters}
                        />
                    </Box>
                ) : (
                    ""
                )}
                {visitedTabs.has("projects") ? (
                    <Box
                        sx={{
                            display:
                                activeTab === "projects" ? "block" : "none",
                        }}
                    >
                        <PersonProjectsPanel
                            personId={personId}
                            projects={projects}
                            clusters={clusters}
                            resources={resources}
                        />
                    </Box>
                ) : (
                    ""
                )}
                {visitedTabs.has("resources") ? (
                    <Box
                        sx={{
                            display:
                                activeTab === "resources" ? "block" : "none",
                        }}
                    >
                        <PersonResourcesPanel
                            personId={personId}
                            projects={projects}
                            clusters={clusters}
                            resources={resources}
                        />
                    </Box>
                ) : (
                    ""
                )}
            </Box>
        </Card>
    );
}
