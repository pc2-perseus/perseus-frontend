import React from "react";
import { Button, IconButton, Tooltip } from "@mui/material";
import {
    DataGrid,
    GridColDef,
    GridPaginationModel,
    GridRenderCellParams,
} from "@mui/x-data-grid";
import InfoOutlinedIcon from "@mui/icons-material/Info";
import ReorderIcon from "@mui/icons-material/Reorder";
import StateIcon from "./StateIcon.tsx";
import Job from "../../../../interfaces/Job.ts";
import Cluster from "../../../../interfaces/Cluster.ts";
import { JOB_STATES } from "../../../../interfaces/JobState.ts";
import {
    formatJobId,
    getJobRowId,
    isGroupJob,
    type JobIdFormat,
} from "./jobDisplay.ts";

function getClusterName(clusterId: string, clusters: Cluster[]): string {
    return (
        clusters.find((cluster) => cluster.id === clusterId)?.name ?? clusterId
    );
}

export default function ComputeProjectJobsTable({
    jobs,
    clusters,
    loading,
    paginationModel,
    hasNextPage,
    rowCount,
    onPaginationModelChange,
    onJobDetails,
    onGroupDetails,
    hideStateForGroupJobs,
    jobIdFormat,
    onJobIdClick,
}: {
    jobs: Job[];
    clusters: Cluster[];
    loading: boolean;
    paginationModel: GridPaginationModel;
    hasNextPage: boolean;
    rowCount: number;
    onPaginationModelChange: (paginationModel: GridPaginationModel) => void;
    onJobDetails: (job: Job) => void;
    onGroupDetails?: (job: Job) => void;
    hideStateForGroupJobs?: boolean;
    jobIdFormat?: JobIdFormat;
    onJobIdClick?: (job: Job) => void;
}): React.ReactElement {
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
            renderCell: (params: GridRenderCellParams<Job>) => {
                if (hideStateForGroupJobs && isGroupJob(params.row)) {
                    return (
                        <Tooltip title="Group job">
                            <span>
                                <ReorderIcon fontSize="small" />
                            </span>
                        </Tooltip>
                    );
                }

                return (
                    <Tooltip title={params.row.state ?? "Unknown"}>
                        <span>
                            <StateIcon state={params.row.state} />
                        </span>
                    </Tooltip>
                );
            },
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
            renderCell: (params: GridRenderCellParams<Job>) => {
                const isGrouped: boolean = isGroupJob(params.row);
                const openDetails = () => {
                    if (isGrouped && onGroupDetails !== undefined) {
                        onGroupDetails(params.row);
                        return;
                    }
                    onJobDetails(params.row);
                };

                return (
                    <Tooltip
                        title={
                            isGrouped && onGroupDetails !== undefined
                                ? "Show grouped jobs"
                                : "Show job details"
                        }
                    >
                        <IconButton size="small" onClick={openDetails}>
                            <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                );
            },
        },
        {
            field: "job_id",
            headerName: "Job ID",
            width: 120,
            sortable: false,
            renderCell: (params: GridRenderCellParams<Job>) => {
                if (onJobIdClick !== undefined) {
                    return (
                        <Button
                            size="small"
                            sx={{ minWidth: 0, px: 0 }}
                            onClick={() => onJobIdClick(params.row)}
                        >
                            {formatJobId(params.row, jobIdFormat)}
                        </Button>
                    );
                }

                return formatJobId(params.row, jobIdFormat);
            },
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

    return (
        <DataGrid
            columns={columns}
            rows={jobs}
            density="compact"
            rowHeight={40}
            columnHeaderHeight={40}
            sx={{ height: "100%" }}
            getRowId={getJobRowId}
            loading={loading}
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
                onPaginationModelChange(nextPaginationModel);
            }}
            disableRowSelectionOnClick
            localeText={{
                noRowsLabel: "No jobs found",
            }}
        />
    );
}
