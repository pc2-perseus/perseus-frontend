import React from "react";
import { Box } from "@mui/material";
import { GridPaginationModel } from "@mui/x-data-grid";
import ComputeProjectJobDetailsDialog from "./ComputeProjectJobDetailsDialog.tsx";
import ComputeProjectGroupJobsDialog from "./ComputeProjectGroupJobsDialog.tsx";
import ComputeProjectJobsTable from "./ComputeProjectJobsTable.tsx";
import { isGroupJob } from "./jobDisplay.ts";
import Job from "../../../../interfaces/Job.ts";
import Cluster from "../../../../interfaces/Cluster.ts";
import Project from "../../../../interfaces/Project.ts";

const DEFAULT_ROWS_PER_PAGE = 10;

/**
 * Paginated jobs table with job/group-job detail dialogs, shared between
 * project-scoped (ComputeProjectJobList) and person-scoped (PersonJobsPanel)
 * job listings. Group job details are resolved from the selected job's own
 * project_oid/compute_project_id, so callers never need to supply those.
 */
export default function JobsPanel({
    fetchJobs,
    clusters,
    projects,
    resetKey,
}: {
    fetchJobs: (page: number, pageSize: number) => Promise<Job[] | null>;
    clusters: Cluster[];
    projects?: Project[];
    resetKey: string;
}): React.ReactElement {
    const [jobs, setJobs] = React.useState<Job[] | null>(null);
    const [paginationModel, setPaginationModel] =
        React.useState<GridPaginationModel>({
            page: 0,
            pageSize: DEFAULT_ROWS_PER_PAGE,
        });
    const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
    const [selectedGroupJob, setSelectedGroupJob] = React.useState<Job | null>(
        null
    );

    const hasNextPage: boolean =
        jobs !== null && jobs.length === paginationModel.pageSize;
    const rowCount: number =
        jobs !== null && !hasNextPage
            ? paginationModel.page * paginationModel.pageSize + jobs.length
            : -1;

    React.useEffect(() => {
        let active = true;
        setJobs(null);

        fetchJobs(paginationModel.page + 1, paginationModel.pageSize)
            .then((result: Job[] | null) => {
                if (active) {
                    setJobs(result ?? []);
                }
            })
            .catch(() => {
                if (active) {
                    setJobs([]);
                }
            });

        return () => {
            active = false;
        };
        // fetchJobs intentionally excluded: it's a new function identity on
        // every render, only resetKey/paginationModel should trigger a refetch
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetKey, paginationModel]);

    React.useEffect(() => {
        setPaginationModel((current: GridPaginationModel) => ({
            ...current,
            page: 0,
        }));
    }, [resetKey]);

    return (
        <Box sx={{ width: "100%", height: "100%", minHeight: 0 }}>
            <ComputeProjectJobsTable
                jobs={jobs ?? []}
                clusters={clusters}
                projects={projects}
                loading={jobs === null}
                paginationModel={paginationModel}
                hasNextPage={hasNextPage}
                rowCount={rowCount}
                onPaginationModelChange={setPaginationModel}
                onJobDetails={setSelectedJob}
                onGroupDetails={setSelectedGroupJob}
                hideStateForGroupJobs={true}
                jobIdFormat="summary"
                onJobIdClick={(job: Job) => {
                    if (isGroupJob(job)) {
                        setSelectedGroupJob(job);
                        return;
                    }

                    setSelectedJob(job);
                }}
            />
            <ComputeProjectJobDetailsDialog
                job={selectedJob}
                clusters={clusters}
                onClose={() => setSelectedJob(null)}
            />
            <ComputeProjectGroupJobsDialog
                job={selectedGroupJob}
                projectId={selectedGroupJob?.project_oid ?? ""}
                computeProjectId={selectedGroupJob?.compute_project_id ?? ""}
                clusters={clusters}
                onClose={() => setSelectedGroupJob(null)}
            />
        </Box>
    );
}
