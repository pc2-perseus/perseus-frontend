import React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography,
} from "@mui/material";
import Job from "../../../../interfaces/Job.ts";
import Cluster from "../../../../interfaces/Cluster.ts";

function getClusterName(clusterId: string, clusters: Cluster[]): string {
    return (
        clusters.find((cluster) => cluster.id === clusterId)?.name ?? clusterId
    );
}

function formatJobValue(value: unknown): string {
    if (value === null || value === undefined) {
        return "N/A";
    }

    if (Array.isArray(value)) {
        return value.length > 0 ? value.join(", ") : "N/A";
    }

    if (typeof value === "object") {
        return JSON.stringify(value, null, 2);
    }

    return value.toString();
}

export default function ComputeProjectJobDetailsDialog({
    job,
    clusters,
    onClose,
}: {
    job: Job | null;
    clusters: Cluster[];
    onClose: () => void;
}): React.ReactElement {
    const jobDetails: { label: string; value: unknown }[] =
        job === null
            ? []
            : [
                  { label: "Job ID", value: job.job_id },
                  { label: "Job name", value: job.job_name },
                  { label: "Project OID", value: job.project_oid },
                  {
                      label: "Compute project ID",
                      value: job.compute_project_id,
                  },
                  {
                      label: "Cluster",
                      value: getClusterName(job.cluster_id, clusters),
                  },
                  { label: "Cluster ID", value: job.cluster_id },
                  { label: "Partition", value: job.partition },
                  { label: "Nodes", value: job.nodes },
                  {
                      label: "Allocated resources",
                      value: job.allocated_resources,
                  },
                  {
                      label: "Working directory",
                      value: job.working_directory,
                  },
                  { label: "Submitted", value: job.submitted },
                  { label: "Start", value: job.start },
                  { label: "End", value: job.end },
                  { label: "Time limit", value: job.time_limit },
                  { label: "User", value: job.user },
                  { label: "State", value: job.state },
                  { label: "Priority ID", value: job.priority_id },
                  { label: "Reservation", value: job.reservation },
                  { label: "Reason", value: job.reason },
                  {
                      label: "Cluster cockpit ID",
                      value: job.cluster_cockpit_id,
                  },
                  {
                      label: "Additional data",
                      value: job.additional_data,
                  },
              ];

    return (
        <Dialog open={job !== null} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Job {job?.job_id}
                {job?.job_name !== null &&
                    job?.job_name !== undefined &&
                    `: ${job.job_name}`}
            </DialogTitle>
            <DialogContent dividers>
                {job !== null && (
                    <TableContainer>
                        <Table size="small">
                            <TableBody>
                                {jobDetails.map((detail) => (
                                    <TableRow key={detail.label}>
                                        <TableCell
                                            component="th"
                                            scope="row"
                                            sx={{
                                                width: "35%",
                                                fontWeight: "bold",
                                                verticalAlign: "top",
                                            }}
                                        >
                                            {detail.label}
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                component="pre"
                                                sx={{
                                                    fontFamily: "inherit",
                                                    fontSize: "inherit",
                                                    m: 0,
                                                    whiteSpace: "pre-wrap",
                                                    overflowWrap: "anywhere",
                                                }}
                                            >
                                                {formatJobValue(detail.value)}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
