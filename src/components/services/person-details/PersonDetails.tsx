// React imports
import React from "react";

// MUI imports
import {
    Box,
    Card,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
} from "@mui/material";

// Custom imports
import { getGDPRCheck } from "../../../api/getGDPR.ts";
import { getPersonEditCheck } from "../../../api/getPersonEdit.ts";
import Project from "../../../interfaces/Project.ts";
import searchProjects from "../../../api/project-search/searchProjects.ts";
import ProjectSearchResultList from "../project-search/ProjectSearchResultList.tsx";
import PersonDetailsBox from "./PersonDetailsBox.tsx";
import getPersonDetails from "../../../api/person-search/getPersonDetails.ts";
import Person from "../../../interfaces/Person.ts";
import ResourceValue from "../../../interfaces/ResourceValue.ts";
import getResourceManagerData from "../../../api/getResourceManagerData.ts";
import Cluster from "../../../interfaces/Cluster.ts";
import Resource from "../../../interfaces/Resource.ts";
import Limit from "../../../interfaces/Limit.ts";
import sortResourceValues from "../../../utils/sortResourceValues.ts";
import clusterMatch from "../../../utils/clusterMatch.ts";
import resourceMatch from "../../../utils/resourceMatch.ts";
import resourceValueUnitString from "../../../utils/resourceValueUnitString.ts";
import LoadingBar from "../../LoadingBar.tsx";

export default function PersonDetails({ personId }: { personId: string }) {
    const [loading, setLoading] = React.useState<boolean>(true);
    const [person, setPerson] = React.useState<Person | null>(null);
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [clusters, setClusters] = React.useState<Cluster[]>([]);
    const [resources, setResources] = React.useState<Resource[]>([]);
    const [showEditButton, setShowEditButton] = React.useState<boolean>(false);
    const [showGDPRButton, setShowGDPRButton] = React.useState<boolean>(false);

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

    React.useEffect(() => {
        getResourceManagerData().then(
            (result: {
                clusters: Cluster[];
                resources: Resource[];
                limits: Limit[];
            }) => {
                setClusters(result.clusters);
                setResources(result.resources);
            }
        );
        getPersonDetails(personId).then((result: Person | null) => {
            setPerson(result);
        });
        searchProjects("", { person_oid: [personId] }).then(
            (result: Project[]) => {
                setProjects(result);
                setLoading(false);
            }
        );
        getPersonEditCheck().then((result) => setShowEditButton(result));
        getGDPRCheck().then((result) => setShowGDPRButton(result));
    }, []);

    React.useEffect(() => {
        if (person === null) {
            return;
        } else if (person.title !== null && person.title.trim().length > 0) {
            document.title =
                person.title +
                " " +
                person.firstname +
                " " +
                person.lastname +
                " - PERSEUS";
        } else {
            document.title =
                person.firstname + " " + person.lastname + " - PERSEUS";
        }
    }, [person]);

    if (person === null || loading) {
        return <LoadingBar />;
    }

    return (
        <>
            <Grid container spacing={1}>
                <Grid size={{ xs: 12, lg: 6 }}>
                    <PersonDetailsBox
                        person={person}
                        projects={projects}
                        showGDPRButton={showGDPRButton}
                        showEditButton={showEditButton}
                    />
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Card
                        variant="outlined"
                        sx={{
                            width: "100%",
                            height: "100%",
                        }}
                    >
                        <Table sx={{ width: "100%" }} size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell>Planned projects:</TableCell>
                                    <TableCell />
                                    <TableCell>
                                        {
                                            projects.filter(
                                                filterUpcomingProjects
                                            ).length
                                        }
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Running projects:</TableCell>
                                    <TableCell />
                                    <TableCell>
                                        {
                                            projects.filter(
                                                filterCurrentProjects
                                            ).length
                                        }
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Finished projects:</TableCell>
                                    <TableCell />
                                    <TableCell>
                                        {
                                            projects.filter(
                                                filterFinishedProjects
                                            ).length
                                        }
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        <Typography
                            variant="h6"
                            sx={{ pl: 1.9, mt: 1.5, mb: 0.9 }}
                        >
                            Granted resources for current or upcoming projects
                            as principal investigator
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
                                        index + 1 ===
                                        totalGrantedResources.length
                                            ? {
                                                  borderBottomWidth: "0px",
                                              }
                                            : {};

                                    const matchedCluster: Cluster | undefined =
                                        clusterMatch(
                                            entry,
                                            resources,
                                            clusters
                                        );
                                    const matchedResource:
                                        | Resource
                                        | undefined = resourceMatch(
                                        entry,
                                        resources
                                    );

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
                    </Card>
                </Grid>
            </Grid>
            <Box
                sx={{
                    display: loading ? "block" : "none",
                    width: "100%",
                    mt: 1,
                }}
            >
                <LoadingBar />
            </Box>
            <Box sx={{ display: loading ? "none" : "block" }}>
                <ProjectSearchResultList searchResults={projects} />
            </Box>
        </>
    );
}
