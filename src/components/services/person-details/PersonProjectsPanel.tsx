// React imports
import React from "react";

// MUI imports
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
} from "@mui/material";

// Custom imports
import Project from "../../../interfaces/Project.ts";
import ResourceValue from "../../../interfaces/ResourceValue.ts";
import Cluster from "../../../interfaces/Cluster.ts";
import Resource from "../../../interfaces/Resource.ts";
import sortResourceValues from "../../../utils/sortResourceValues.ts";
import clusterMatch from "../../../utils/clusterMatch.ts";
import resourceMatch from "../../../utils/resourceMatch.ts";
import resourceValueUnitString from "../../../utils/resourceValueUnitString.ts";

export default function PersonProjectsPanel({
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
    function filterUpcomingProjects(project: Project) {
        return (
            project.start !== null &&
            Date.now() < new Date(project.start).getTime()
        );
    }

    function filterCurrentProjects(project: Project) {
        return (
            project.start !== null &&
            project.end !== null &&
            Date.now() > new Date(project.start).getTime() &&
            Date.now() < new Date(project.end).getTime()
        );
    }

    function filterFinishedProjects(project: Project): boolean {
        return (
            project.end === null || Date.now() > new Date(project.end).getTime()
        );
    }

    const totalGrantedResources: ResourceValue[] = [];
    projects
        .filter(
            (project: Project) =>
                (filterUpcomingProjects(project) ||
                    filterCurrentProjects(project)) &&
                project.principal_investigator_id == personId
        )
        .forEach((project: Project) => {
            project.granted_resources.forEach(
                (grantedResource: ResourceValue) => {
                    let flag: boolean = false;
                    totalGrantedResources.forEach(
                        (item: ResourceValue, index: number) => {
                            if (
                                item.resource_id === grantedResource.resource_id
                            ) {
                                totalGrantedResources[index].value +=
                                    grantedResource.value;
                                flag = true;
                            }
                        }
                    );
                    if (!flag) {
                        totalGrantedResources.push(
                            JSON.parse(JSON.stringify(grantedResource))
                        );
                    }
                }
            );
        });

    return (
        <>
            <Table sx={{ width: "100%" }} size="small">
                <TableBody>
                    <TableRow>
                        <TableCell>Planned projects:</TableCell>
                        <TableCell />
                        <TableCell>
                            {projects.filter(filterUpcomingProjects).length}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Running projects:</TableCell>
                        <TableCell />
                        <TableCell>
                            {projects.filter(filterCurrentProjects).length}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Finished projects:</TableCell>
                        <TableCell />
                        <TableCell>
                            {projects.filter(filterFinishedProjects).length}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Typography variant="h6" sx={{ pl: 1.9, mt: 1.5, mb: 0.9 }}>
                Granted resources for current or upcoming projects as principal
                investigator
            </Typography>
            {totalGrantedResources.length > 0 ? (
                ""
            ) : (
                <Typography
                    sx={{ fontSize: 14, pl: 1.9 }}
                    color="text.secondary"
                    gutterBottom
                >
                    <i>None</i>
                </Typography>
            )}
            <Table sx={{ width: "100%" }} size="small">
                <TableBody>
                    {sortResourceValues(
                        totalGrantedResources,
                        resources,
                        clusters
                    ).map((entry, index: number) => {
                        const borderStyle =
                            index + 1 === totalGrantedResources.length
                                ? { borderBottomWidth: "0px" }
                                : {};

                        const matchedCluster: Cluster | undefined =
                            clusterMatch(entry, resources, clusters);
                        const matchedResource: Resource | undefined =
                            resourceMatch(entry, resources);

                        return (
                            <TableRow key={index}>
                                <TableCell sx={borderStyle}>
                                    {matchedCluster === undefined
                                        ? ""
                                        : matchedCluster.name}
                                </TableCell>
                                <TableCell sx={borderStyle}>
                                    {matchedResource === undefined
                                        ? ""
                                        : matchedResource.name}
                                </TableCell>
                                <TableCell sx={borderStyle}>
                                    {resourceValueUnitString(
                                        entry,
                                        matchedResource
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </>
    );
}
