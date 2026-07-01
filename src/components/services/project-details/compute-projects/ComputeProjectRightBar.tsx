import React from "react";
import { Box, Button, Theme, Tooltip, useTheme } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import WorkIcon from "@mui/icons-material/Work";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ComputeProjectMembers from "./ComputeProjectMembers.tsx";
import CloseIcon from "@mui/icons-material/Close";
import UsageChart from "./UsageChart.tsx";
import ComputeProjectJobList from "./ComputeProjectJobList.tsx";
import Cluster from "../../../../interfaces/Cluster.ts";
import Resource from "../../../../interfaces/Resource.ts";
import ResourceValue from "../../../../interfaces/ResourceValue.ts";

export default function ComputeProjectRightBar({
    projectId,
    computeProjectId,
    clusters,
    resources,
    grantedResources,
}: {
    projectId: string;
    computeProjectId: string;
    clusters: Cluster[];
    resources: Resource[];
    grantedResources: ResourceValue[];
}): React.ReactElement {
    const [contentId, setContentId] = React.useState<string | null>(null);

    const contentMinHeight: { [key: string]: string } = {
        jobs: "300px",
        members: "300px",
        "usage-chart": "500px",
    };

    const theme: Theme = useTheme();

    return (
        <Box
            sx={{
                width: contentId !== null ? "650px" : "2.75em",
                height: contentId === "jobs" ? "600px" : undefined,
                minHeight:
                    contentId === null ? "9.6em" : contentMinHeight[contentId],
                maxHeight: "100%",
                flexBasis: contentId !== null ? "650px" : "2.75em",
                flexShrink: 0,
                overflowY: contentId === "jobs" ? "hidden" : "scroll",
                scrollbarWidth: "none",
                borderLeftWidth: "1px",
                borderLeftStyle: "solid",
                borderLeftColor: theme.palette.divider,
            }}
        >
            {contentId === null ? (
                <Box sx={{ textAlign: "center", mt: 1 }}>
                    <Tooltip title="Show users" placement="left">
                        <Button
                            size="small"
                            sx={{
                                minWidth: "2.25em",
                                maxWidth: "2.25em",
                                cursor: "pointer",
                            }}
                            onClick={() => setContentId("members")}
                        >
                            <GroupIcon />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Show jobs" placement="left">
                        <Button
                            size="small"
                            sx={{
                                minWidth: "2.25em",
                                maxWidth: "2.25em",
                                cursor: "pointer",
                            }}
                            onClick={() => setContentId("jobs")}
                        >
                            <WorkIcon />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Show usage chart" placement="left">
                        <Button
                            size="small"
                            sx={{
                                minWidth: "2.25em",
                                maxWidth: "2.25em",
                                cursor: "pointer",
                            }}
                            onClick={() => setContentId("usage-chart")}
                        >
                            <TrendingUpIcon />
                        </Button>
                    </Tooltip>
                </Box>
            ) : (
                ""
            )}
            {contentId === "members" ? (
                <ComputeProjectMembers
                    projectId={projectId}
                    computeProjectId={computeProjectId}
                    resources={resources}
                    clusters={clusters}
                    grantedResources={grantedResources.filter(
                        (rv) => rv.compute_project_id === computeProjectId
                    )}
                    onClose={() => setContentId(null)}
                />
            ) : (
                ""
            )}
            {contentId === "jobs" ? (
                <ComputeProjectJobList
                    projectId={projectId}
                    computeProjectId={computeProjectId}
                    clusters={clusters}
                    onClose={() => setContentId(null)}
                />
            ) : (
                ""
            )}
            {contentId === "usage-chart" ? (
                <Box
                    sx={{
                        position: "relative",
                        overflow: "hidden",
                        pt: "1.5em",
                        height: "100%",
                    }}
                >
                    <Button
                        size="small"
                        sx={{
                            minWidth: "2.25em",
                            maxWidth: "2.25em",
                            cursor: "pointer",
                            position: "absolute",
                            ml: "0.5em",
                            mt: "-1.5em",
                            zIndex: 10,
                        }}
                        onClick={() => setContentId(null)}
                    >
                        <CloseIcon fontSize="small" />
                    </Button>
                    <UsageChart
                        projectId={projectId}
                        computeProjectId={computeProjectId}
                        resources={resources}
                        clusters={clusters}
                    />
                </Box>
            ) : (
                ""
            )}
        </Box>
    );
}
