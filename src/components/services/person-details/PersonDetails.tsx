// React imports
import React from "react";

// MUI imports
import { Box, Grid } from "@mui/material";

// Custom imports
import { getGDPRCheck } from "../../../api/getGDPR.ts";
import { getPersonEditCheck } from "../../../api/getPersonEdit.ts";
import Project from "../../../interfaces/Project.ts";
import searchProjects from "../../../api/project-search/searchProjects.ts";
import ProjectSearchResultList from "../project-search/ProjectSearchResultList.tsx";
import PersonDetailsBox from "./PersonDetailsBox.tsx";
import PersonOverviewCard from "./PersonOverviewCard.tsx";
import getPersonDetails from "../../../api/person-search/getPersonDetails.ts";
import Person from "../../../interfaces/Person.ts";
import getResourceManagerData from "../../../api/getResourceManagerData.ts";
import Cluster from "../../../interfaces/Cluster.ts";
import Resource from "../../../interfaces/Resource.ts";
import Limit from "../../../interfaces/Limit.ts";
import LoadingBar from "../../LoadingBar.tsx";

export default function PersonDetails({ personId }: { personId: string }) {
    const [loading, setLoading] = React.useState<boolean>(true);
    const [person, setPerson] = React.useState<Person | null>(null);
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [clusters, setClusters] = React.useState<Cluster[]>([]);
    const [resources, setResources] = React.useState<Resource[]>([]);
    const [showEditButton, setShowEditButton] = React.useState<boolean>(false);
    const [showGDPRButton, setShowGDPRButton] = React.useState<boolean>(false);

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
                    <PersonOverviewCard
                        personId={personId}
                        projects={projects}
                        clusters={clusters}
                        resources={resources}
                    />
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
