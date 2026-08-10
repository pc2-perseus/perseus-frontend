import React from "react";
import { Box } from "@mui/material";
import JobsPanel from "../project-details/compute-projects/JobsPanel.tsx";
import getPersonJobs from "../../../api/person-details/getPersonJobs.ts";
import Job from "../../../interfaces/Job.ts";
import Cluster from "../../../interfaces/Cluster.ts";
import Project from "../../../interfaces/Project.ts";

export default function PersonJobsPanel({
    personId,
    projects,
    clusters,
}: {
    personId: string;
    projects: Project[];
    clusters: Cluster[];
}): React.ReactElement {
    return (
        <Box sx={{ width: "100%", height: "600px", minHeight: 0 }}>
            <JobsPanel
                fetchJobs={(
                    page: number,
                    pageSize: number
                ): Promise<Job[] | null> =>
                    getPersonJobs(personId, page, pageSize)
                }
                clusters={clusters}
                projects={projects}
                resetKey={personId}
            />
        </Box>
    );
}
