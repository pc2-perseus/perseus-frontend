import React from "react";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import {
    DataGrid,
    GridColDef,
    GridPaginationModel,
    GridRenderCellParams,
} from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/Info";
import StateIcon from "./StateIcon.tsx";
import ComputeProjectJobDetailsDialog from "./ComputeProjectJobDetailsDialog.tsx";
import getJobs from "../../../../api/project-details/getJobs.ts";
import Job from "../../../../interfaces/Job.ts";
import Cluster from "../../../../interfaces/Cluster.ts";
import { JOB_STATES } from "../../../../interfaces/JobState.ts";

const DEFAULT_ROWS_PER_PAGE = 10;

function getClusterName(clusterId: string, clusters: Cluster[]): string {
    return (
        clusters.find((cluster) => cluster.id === clusterId)?.name ?? clusterId
    );
}

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

    const hasNextPage: boolean =
        jobs !== null && jobs.length === paginationModel.pageSize;
    const rowCount: number =
        jobs !== null && !hasNextPage
            ? paginationModel.page * paginationModel.pageSize + jobs.length
            : -1;

    const columns: GridColDef<Job>[] = [
        {
            field: "state",
            headerName: "",
            type: "singleSelect",
            valueOptions: [...JOB_STATES],
            width: 48,
            filterable: true,
            sortable: true,
            hideable: false,
            align: "center",
            renderCell: (params: GridRenderCellParams<Job>) => (
                <Tooltip title={params.row.state ?? "Unknown"}>
                    <span>
                        <StateIcon state={params.row.state} />
                    </span>
                </Tooltip>
            ),
        },
        {
            field: "details",
            headerName: "",
            width: 44,
            sortable: false,
            filterable: false,
            hideable: false,
            disableColumnMenu: true,
            align: "center",
            renderCell: (params: GridRenderCellParams<Job>) => (
                <Tooltip title="Show job details">
                    <IconButton
                        size="small"
                        onClick={() => setSelectedJob(params.row)}
                    >
                        <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            ),
        },
        {
            field: "job_id",
            headerName: "Job ID",
            type: "number",
            width: 100,
            renderCell: (params: GridRenderCellParams<Job>) =>
                params.row.job_id.toString(),
        },
        {
            field: "cluster_id",
            headerName: "Cluster",
            flex: 1,
            minWidth: 140,
            valueGetter: (_value, row) =>
                getClusterName(row.cluster_id, clusters),
        },
        {
            field: "partition",
            headerName: "Partition",
            flex: 1,
            minWidth: 120,
            valueGetter: (_value, row) => row.partition ?? "",
        },
        {
            field: "user",
            headerName: "User",
            flex: 1,
            minWidth: 120,
            valueGetter: (_value, row) => row.user ?? "",
        },
    ];

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
                <DataGrid
                    columns={columns}
                    rows={jobs ?? []}
                    density="compact"
                    rowHeight={40}
                    columnHeaderHeight={40}
                    sx={{ height: "100%" }}
                    getRowId={(row: Job) => `${row.cluster_id}-${row.job_id}`}
                    loading={jobs === null}
                    paginationMode="server"
                    disableColumnSorting={true}
                    disableColumnFilter={true}
                    rowCount={rowCount}
                    paginationMeta={{
                        hasNextPage,
                    }}
                    paginationModel={paginationModel}
                    initialState={{
                        sorting: {
                            sortModel: [{ field: "job_id", sort: "asc" }],
                        },
                    }}
                    pageSizeOptions={[10, 25]}
                    onPaginationModelChange={(
                        nextPaginationModel: GridPaginationModel
                    ) => {
                        if (
                            nextPaginationModel.page > paginationModel.page &&
                            !hasNextPage
                        ) {
                            return;
                        }
                        setPaginationModel(nextPaginationModel);
                    }}
                    disableRowSelectionOnClick
                    localeText={{
                        noRowsLabel: "No jobs found",
                    }}
                />
            </Box>
            <ComputeProjectJobDetailsDialog
                job={selectedJob}
                clusters={clusters}
                onClose={() => setSelectedJob(null)}
            />
        </Box>
    );
}
