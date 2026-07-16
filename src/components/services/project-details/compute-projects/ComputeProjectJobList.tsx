import React from "react";
import { Box, Button } from "@mui/material";
import { GridPaginationModel } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import ComputeProjectJobDetailsDialog from "./ComputeProjectJobDetailsDialog.tsx";
import ComputeProjectGroupJobsDialog from "./ComputeProjectGroupJobsDialog.tsx";
import ComputeProjectJobsTable from "./ComputeProjectJobsTable.tsx";
import getJobs from "../../../../api/project-details/getJobs.ts";
import Job from "../../../../interfaces/Job.ts";
import Cluster from "../../../../interfaces/Cluster.ts";
import { isGroupJob } from "./jobDisplay.ts";

const DEFAULT_ROWS_PER_PAGE = 10;

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

        getJobs(
            projectId,
            computeProjectId,
            paginationModel.page + 1,
            paginationModel.pageSize
        )
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
    }, [projectId, computeProjectId, paginationModel]);

    React.useEffect(() => {
        setPaginationModel((current: GridPaginationModel) => ({
            ...current,
            page: 0,
        }));
    }, [projectId, computeProjectId]);

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
                <ComputeProjectJobsTable
                    jobs={jobs ?? []}
                    clusters={clusters}
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
            </Box>
            <ComputeProjectJobDetailsDialog
                job={selectedJob}
                clusters={clusters}
                onClose={() => setSelectedJob(null)}
            />
            <ComputeProjectGroupJobsDialog
                job={selectedGroupJob}
                projectId={projectId}
                computeProjectId={computeProjectId}
                clusters={clusters}
                onClose={() => setSelectedGroupJob(null)}
            />
        </Box>
    );
}
