import React from "react";
import { Box, Skeleton, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import getPersonResourceUsage from "../../../api/person-details/getPersonResourceUsage.ts";
import Project from "../../../interfaces/Project.ts";
import Cluster from "../../../interfaces/Cluster.ts";
import Resource from "../../../interfaces/Resource.ts";
import clusterMatch from "../../../utils/clusterMatch.ts";
import resourceMatch from "../../../utils/resourceMatch.ts";
import formatNumber from "../../../utils/formatNumber.ts";
import resourceDisplayValue from "../../../utils/resourceDisplayValue.ts";
import isProjectArchived from "../../../utils/isProjectArchived.ts";
import projectDisplayName from "../../../utils/projectDisplayName.ts";

interface ResourceUsageRow {
    id: string;
    projectName: string;
    clusterName: string;
    resourceName: string;
    value: number;
    unit: string;
}

export default function PersonResourcesPanel({
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
    const [usage, setUsage] = React.useState<{
        [projectOid: string]: { resource_id: string; value: number }[];
    } | null>(null);
    const [paginationModel, setPaginationModel] =
        React.useState<GridPaginationModel>({
            page: 0,
            pageSize: 10,
        });

    React.useEffect(() => {
        let active = true;
        setUsage(null);
        setPaginationModel((current) => ({ ...current, page: 0 }));

        getPersonResourceUsage(personId).then((result) => {
            if (active) {
                setUsage(result);
            }
        });

        return () => {
            active = false;
        };
    }, [personId]);
    const rows: ResourceUsageRow[] = React.useMemo(() => {
        if (usage === null) {
            return [];
        }

        return Object.keys(usage)
            .flatMap((projectOid: string) => {
                const project: Project | undefined = projects.find(
                    (item) => item._id === projectOid
                );

                if (project === undefined || isProjectArchived(project)) {
                    return [];
                }

                const aggregatedUsage = new Map<string, number>();
                usage[projectOid].forEach((entry) => {
                    aggregatedUsage.set(
                        entry.resource_id,
                        (aggregatedUsage.get(entry.resource_id) ?? 0) +
                            entry.value
                    );
                });

                return Array.from(aggregatedUsage.entries()).map(
                    ([resourceId, totalValue]) => {
                        const matchedCluster: Cluster | undefined =
                            clusterMatch(
                                { resource_id: resourceId },
                                resources,
                                clusters
                            );
                        const matchedResource: Resource | undefined =
                            resourceMatch(
                                { resource_id: resourceId },
                                resources
                            );

                        return {
                            id: projectOid + "-" + resourceId,
                            projectName: projectDisplayName(
                                project,
                                project._id ?? ""
                            ),
                            clusterName: matchedCluster?.name ?? "",
                            resourceName: matchedResource?.name ?? "",
                            value: resourceDisplayValue(
                                totalValue,
                                matchedResource
                            ),
                            unit: matchedResource?.display_unit ?? "",
                        };
                    }
                );
            })
            .sort(
                (left: ResourceUsageRow, right: ResourceUsageRow) =>
                    left.projectName.localeCompare(right.projectName) ||
                    left.clusterName.localeCompare(right.clusterName) ||
                    left.resourceName.localeCompare(right.resourceName)
            );
    }, [clusters, projects, resources, usage]);

    React.useEffect(() => {
        const maxPage =
            rows.length === 0
                ? 0
                : Math.max(
                      0,
                      Math.ceil(rows.length / paginationModel.pageSize) - 1
                  );

        if (paginationModel.page > maxPage) {
            setPaginationModel((current) => ({
                ...current,
                page: maxPage,
            }));
        }
    }, [rows.length, paginationModel.page, paginationModel.pageSize]);

    if (usage === null) {
        return (
            <Skeleton
                variant="rectangular"
                animation="wave"
                width="100%"
                height={300}
            />
        );
    }

    if (rows.length === 0) {
        return (
            <Typography
                sx={{ fontSize: 14, pl: 1.9, mt: 1.5 }}
                color="text.secondary"
                gutterBottom
            >
                <i>No resource usage in non-archived projects</i>
            </Typography>
        );
    }

    const columns: GridColDef<ResourceUsageRow>[] = [
        {
            field: "projectName",
            headerName: "Project",
            flex: 1,
            minWidth: 140,
        },
        {
            field: "clusterName",
            headerName: "Cluster",
            flex: 1,
            minWidth: 120,
        },
        {
            field: "resourceName",
            headerName: "Resource",
            flex: 1,
            minWidth: 140,
        },
        {
            field: "value",
            headerName: "Used",
            type: "number",
            flex: 1,
            minWidth: 120,
            valueFormatter: (_value, row) =>
                formatNumber(row.value) +
                (row.unit === "" ? "" : " " + row.unit),
        },
    ];

    return (
        <Box sx={{ width: "100%", height: "500px" }}>
            <DataGrid
                columns={columns}
                rows={rows}
                density="compact"
                showToolbar
                initialState={{
                    sorting: {
                        sortModel: [{ field: "projectName", sort: "asc" }],
                    },
                }}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 25, 50]}
                sx={{ height: "100%" }}
            />
        </Box>
    );
}
