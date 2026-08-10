import React from "react";
import { Box, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import JobsPanel from "./JobsPanel.tsx";
import getJobs from "../../../../api/project-details/getJobs.ts";
import Job from "../../../../interfaces/Job.ts";
import Cluster from "../../../../interfaces/Cluster.ts";

export default function ComputeProjectJobList({
    projectId,
    computeProjectId,
    clusters,
    onClose,
}: {
    projectId: string;
    computeProjectId: string;
    clusters: Cluster[];
    onClose: () => void;
}): React.ReactElement {
    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                minHeight: 0,
                position: "relative",
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
                    mt: "0.5em",
                    zIndex: 10,
                }}
                onClick={onClose}
            >
                <CloseIcon fontSize="small" />
            </Button>
            <Box
                sx={{
                    pt: "2.75em",
                    height: "100%",
                    minHeight: 0,
                    boxSizing: "border-box",
                }}
            >
                <JobsPanel
                    fetchJobs={(
                        page: number,
                        pageSize: number
                    ): Promise<Job[] | null> =>
                        getJobs(projectId, computeProjectId, page, pageSize)
                    }
                    clusters={clusters}
                    resetKey={projectId + "-" + computeProjectId}
                />
            </Box>
        </Box>
    );
}
