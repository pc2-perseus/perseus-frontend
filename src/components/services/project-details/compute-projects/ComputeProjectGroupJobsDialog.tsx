import React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import { GridPaginationModel } from "@mui/x-data-grid";
import getGroupJobs from "../../../../api/project-details/getGroupJobs.ts";
import Job from "../../../../interfaces/Job.ts";
import Cluster from "../../../../interfaces/Cluster.ts";
import ComputeProjectJobDetailsDialog from "./ComputeProjectJobDetailsDialog.tsx";
import ComputeProjectJobsTable from "./ComputeProjectJobsTable.tsx";

const DEFAULT_ROWS_PER_PAGE = 10;

export default function ComputeProjectGroupJobsDialog({
    job,
    projectId,
    computeProjectId,
    clusters,
    onClose,
}: {
    job: Job | null;
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

    const groupId: number | null =
        typeof job?.group_id === "number" ? job.group_id : null;
    const hasNextPage: boolean =
        jobs !== null && jobs.length === paginationModel.pageSize;
    const rowCount: number =
        jobs !== null && !hasNextPage
            ? paginationModel.page * paginationModel.pageSize + jobs.length
            : -1;

    React.useEffect(() => {
        setPaginationModel({
            page: 0,
            pageSize: DEFAULT_ROWS_PER_PAGE,
        });
        setSelectedJob(null);
    }, [groupId]);

    React.useEffect(() => {
        if (job === null || groupId === null) {
            setJobs(null);
            return;
        }

        let active = true;
        setJobs(null);

        getGroupJobs(
            projectId,
            computeProjectId,
            groupId,
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
    }, [job, groupId, projectId, computeProjectId, paginationModel]);

    return (
        <>
            <Dialog
                open={job !== null}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>Job Group {groupId ?? ""}</DialogTitle>
                <DialogContent
                    dividers
                    sx={{
                        height: 520,
                        px: { xs: 1, sm: 3 },
                        overflowX: "auto",
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
                        onJobIdClick={setSelectedJob}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
            <ComputeProjectJobDetailsDialog
                job={selectedJob}
                clusters={clusters}
                onClose={() => setSelectedJob(null)}
            />
        </>
    );
}
