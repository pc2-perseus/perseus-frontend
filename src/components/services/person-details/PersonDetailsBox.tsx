// React imports
import React, { useState } from "react";
import { Link } from "react-router-dom";

// MUI imports
import {
    Box,
    Button,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Theme,
    Typography,
    useTheme,
} from "@mui/material";

// Icon imports
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import HttpIcon from "@mui/icons-material/Http";
import ApartmentIcon from "@mui/icons-material/Apartment";
import LanguageIcon from "@mui/icons-material/Language";
import EditIcon from "@mui/icons-material/Edit";

// Custom imports
import Person from "../../../interfaces/Person.ts";
import getGDPR from "../../../api/getGDPR.ts";
import CONFIG from "../../../config.ts";
import Project from "../../../interfaces/Project.ts";
import Organization from "../../../interfaces/Organization.ts";
import getAffiliations from "../../../api/getAffiliationsData.ts";
import Institute from "../../../interfaces/Institute.ts";
import LoadingBar from "../../LoadingBar.tsx";

export default function PersonDetailsBox({
    person,
    projects,
    showGDPRButton,
    showEditButton,
}: {
    person: Person;
    projects: Project[];
    showGDPRButton: boolean;
    showEditButton: boolean;
}): React.ReactElement {
    const [loading, setLoading] = useState<boolean>(true);
    const [organizations, setOrganizations] = React.useState<Organization[]>(
        []
    );
    const [institutes, setInstitutes] = React.useState<Institute[]>([]);
    const ref = React.useRef(null);

    function downloadGDPR() {
        if (person._id !== null) {
            getGDPR(person._id).then((fileId: string | null) => {
                const a = ref.current;
                if (a !== null && fileId !== null) {
                    // @ts-expect-error For download functionality
                    a.href =
                        CONFIG.CORE_URL +
                        "/file/" +
                        fileId +
                        "/" +
                        fileId +
                        ".zip";
                    // @ts-expect-error For download functionality
                    a.click();
                }
            });
        }
    }

    const theme: Theme = useTheme();

    const personAffiliations: {
        affiliationId: string;
        start: Date;
        end: Date;
    }[] = [];
    projects.forEach((project: Project) => {
        let flag: boolean = false;
        personAffiliations.forEach(
            (
                entry: { affiliationId: string; start: Date; end: Date },
                index: number
            ) => {
                if (entry.affiliationId === project.affiliation_id) {
                    flag = true;
                    if (
                        project.start !== null &&
                        new Date(project.start).getTime() <
                            entry.start.getTime()
                    ) {
                        personAffiliations[index].start = new Date(
                            project.start
                        );
                    }
                    if (
                        project.end !== null &&
                        new Date(project.end).getTime() > entry.end.getTime()
                    ) {
                        personAffiliations[index].end = new Date(project.end);
                    }
                }
            }
        );

        if (
            !flag &&
            project.affiliation_id !== null &&
            project.start !== null &&
            project.end !== null
        ) {
            personAffiliations.push({
                affiliationId: project.affiliation_id,
                start: new Date(project.start),
                end: new Date(project.end),
            });
        }
    });

    React.useEffect(() => {
        getAffiliations(
            personAffiliations.map((entry) => entry.affiliationId)
        ).then((result) => {
            setOrganizations(result.organizations);
            setInstitutes(result.institutes);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <LoadingBar />;
    }

    return (
        <Card
            variant="outlined"
            sx={{
                width: "100%",
                height: "100%",
            }}
        >
            <CardContent
                sx={{
                    pb: showGDPRButton ? 0 : undefined,
                }}
            >
                <Typography
                    sx={{ fontSize: 14 }}
                    align="center"
                    color="text.secondary"
                    gutterBottom
                >
                    {person.title === null ? <>&nbsp;</> : person.title}
                </Typography>
                <Typography variant="h5" align="center" component="div">
                    {person.firstname} {person.lastname}
                </Typography>
                <List dense>
                    <ListItem>
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        <ListItemText>
                            {person.username === null ? (
                                <i>N/A</i>
                            ) : (
                                person.username
                            )}
                        </ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <EmailIcon />
                        </ListItemIcon>
                        <ListItemText>
                            {person.email === null ? <i>N/A</i> : person.email}
                        </ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <PhoneIcon />
                        </ListItemIcon>
                        <ListItemText>
                            {person.phone === null ? <i>N/A</i> : person.phone}
                        </ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <HttpIcon />
                        </ListItemIcon>
                        <ListItemText>
                            {person.homepage === null ? (
                                <i>N/A</i>
                            ) : (
                                <a
                                    href={person.homepage}
                                    style={{
                                        textDecoration: "none",
                                        color: theme.palette.primary.main,
                                    }}
                                    target="_blank"
                                >
                                    Go to website
                                </a>
                            )}
                        </ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <ApartmentIcon />
                        </ListItemIcon>
                        <ListItemText>
                            {personAffiliations.map(
                                (entry: {
                                    affiliationId: string;
                                    start: Date;
                                    end: Date;
                                }) => {
                                    let name: string = entry.affiliationId;
                                    institutes.forEach(
                                        (institute: Institute) => {
                                            if (
                                                institute._id ===
                                                entry.affiliationId
                                            ) {
                                                name = institute.name;
                                                organizations.forEach(
                                                    (
                                                        organization: Organization
                                                    ) => {
                                                        if (
                                                            organization._id ===
                                                            institute.organization_id
                                                        ) {
                                                            name =
                                                                organization.name +
                                                                ", " +
                                                                institute.name;
                                                        }
                                                    }
                                                );
                                            }
                                        }
                                    );
                                    return (
                                        <Box key={entry.affiliationId}>
                                            {name} ({entry.start.getFullYear()}{" "}
                                            - {entry.end.getFullYear()})
                                        </Box>
                                    );
                                }
                            )}
                        </ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <LanguageIcon />
                        </ListItemIcon>
                        <ListItemText>
                            {person.nationalities.join(", ")}
                        </ListItemText>
                    </ListItem>
                </List>
                {showEditButton ? (
                    <Link
                        to={"/PersonEdit/" + person._id}
                        style={{
                            textDecoration: "none",
                            color: "inherit",
                        }}
                    >
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            fullWidth
                        >
                            Edit person data
                        </Button>
                    </Link>
                ) : (
                    ""
                )}

                <Button
                    variant="contained"
                    fullWidth
                    onClick={downloadGDPR}
                    sx={{
                        mt: 2,
                        display: showGDPRButton ? undefined : "none",
                    }}
                >
                    Download GDPR information
                </Button>
                <a
                    ref={ref}
                    target="_blank"
                    download={
                        "GDPR_" +
                        person?.firstname +
                        "_" +
                        person?.lastname +
                        ".json"
                    }
                />
            </CardContent>
        </Card>
    );
}
