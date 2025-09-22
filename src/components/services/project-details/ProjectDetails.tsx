// React imports
import React from "react";
import { Link, useNavigate } from "react-router-dom";

// MUI imports
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    AppBar,
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Theme,
    Toolbar,
    Typography,
    useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Icon imports
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import HttpIcon from "@mui/icons-material/Http";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Custom imports
import Mermaid from "../../Mermaid.tsx";
import { projectTypeColor } from "../../../utils/projectTypeColor.ts";
import FileTypeIcon from "../../FileTypeIcon.tsx";
import CONFIG from "../../../config.ts";
import { stateTypeColor } from "../../../utils/stateTypeColor.ts";
import { stateTypeName } from "../../../utils/stateTypeName.ts";
import { getProjectEditCheck } from "../../../api/getProjectEdit.ts";
import postPublication from "../../../api/postPublication.ts";
import postProjectFile from "../../../api/postProjectFile.ts";
import PageBackdrop from "../../PageBackdrop.tsx";
import ResourceValue from "../../../interfaces/ResourceValue.ts";
import LimitValue from "../../../interfaces/LimitValue.ts";
import ComputeProjectList from "./ComputeProjectList.tsx";
import ComputeProject from "../../../interfaces/ComputeProject.ts";
import Cluster from "../../../interfaces/Cluster.ts";
import Limit from "../../../interfaces/Limit.ts";
import Resource from "../../../interfaces/Resource.ts";
import getResourceManagerData from "../../../api/getResourceManagerData.ts";
import ResourceLimitTable from "./ResourceLimitTable.tsx";
import blockComputeProjectResource from "../../../api/compute-projects/blockComputeProjectResource.ts";
import unblockComputeProjectResource from "../../../api/compute-projects/unblockComputeProjectResource.ts";
import checkServicePermission from "../../../api/checkServicePermission.ts";
import ResourceValueOverwrite from "../../../interfaces/ResourceValueOverwrite.ts";
import addResourceOverwrite from "../../../api/compute-projects/addResourceOverwrite.ts";
import LimitValueOverwrite from "../../../interfaces/LimitValueOverwrite.ts";
import addLimitOverwrite from "../../../api/compute-projects/addLimitOverwrite.ts";
import addComputeProject from "../../../api/compute-projects/addComputeProject.ts";
import editComputeProject from "../../../api/compute-projects/editComputeProject.ts";
import addNote from "../../../api/compute-projects/addNote.ts";
import AddNote from "./AddNote.tsx";
import getProject from "../../../api/project-details/getProject.ts";
import Project from "../../../interfaces/Project.ts";
import ScientificField from "../../../interfaces/ScientificField.ts";
import Institute from "../../../interfaces/Institute.ts";
import Organization from "../../../interfaces/Organization.ts";
import getAffiliationsData from "../../../api/getAffiliationsData.ts";
import Person from "../../../interfaces/Person.ts";
import getPersonDetails from "../../../api/person-search/getPersonDetails.ts";
import getPredecessor from "../../../api/project-details/getPredecessor.ts";
import getFollowup from "../../../api/project-details/getFollowup.ts";
import PublicationList from "./PublicationList.tsx";

// Other imports
import _ from "lodash";
import getFileTagSuggestions from "../../../api/project-details/getFileTagSuggestions.ts";
import LoadingBar from "../../LoadingBar.tsx";
import ExpandableText from "../../ExpandableText.tsx";
import ResourcePriority from "../../../interfaces/ResourcePriority.ts";
import getPriorities from "../../../api/resource-priorities/getPriorities.ts";
import ConfigContext from "../../../contexts/ConfigContext.ts";
import FrontendConfiguration from "../../../interfaces/FrontendConfiguration.ts";

export default function ProjectDetails({
    projectId,
}: {
    projectId: string;
}): React.ReactElement {
    const [project, setProject] = React.useState<Project | null>(null);
    const [clusters, setClusters] = React.useState<Cluster[]>([]);
    const [resources, setResources] = React.useState<Resource[]>([]);
    const [limits, setLimits] = React.useState<Limit[]>([]);
    const [priorities, setPriorities] = React.useState<ResourcePriority[]>([]);
    const [affiliation, setAffiliation] = React.useState<{
        institute: Institute | null;
        organization: Organization | null;
    }>({ institute: null, organization: null });
    const [principalInvestigator, setPrincipalInvestigator] =
        React.useState<Person | null>(null);
    const [personOfContact, setPersonOfContact] = React.useState<Person | null>(
        null
    );
    const [predecessor, setPredecessor] = React.useState<Project | null>(null);
    const [followup, setFollowup] = React.useState<Project | null>(null);

    const [openDetails, updateOpenDetails] = React.useState<boolean>(false);
    const [showEditButton, updateShowEditButton] =
        React.useState<boolean>(false);
    const [showOverrideActions, updateShowOverrideActions] =
        React.useState<boolean>(false);
    const [showNoteActions, updateShowNoteActions] =
        React.useState<boolean>(false);
    const [dialogPublicationOpen, setDialogPublicationOpen] =
        React.useState<boolean>(false);
    const [newPublication, setNewPublication] = React.useState<{
        type: "bibtex" | "doi";
        content: string;
    }>({
        type: "doi",
        content: "",
    });
    const [dialogFileOpen, setDialogFileOpen] = React.useState<boolean>(false);
    const [newFile, setNewFile] = React.useState<File | null>(null);
    const [newFileTagsSuggestions, setFileTagsSuggestions] = React.useState<
        string[]
    >([]);
    const [newFileTags, setNewFileTags] = React.useState<string[]>([]);
    const [showBackdrop, setShowBackdrop] = React.useState<boolean>(false);

    const frontendConfig: FrontendConfiguration | null =
        React.useContext(ConfigContext);

    function addPublication() {
        setShowBackdrop(true);
        setDialogPublicationOpen(false);
        setNewPublication({
            type: "doi",
            content: "",
        });
        postPublication(
            project === null || project._id === null ? "" : project._id,
            newPublication
        ).then((result) => {
            if (result) {
                setProject(null);
                setShowBackdrop(false);
                getProject(projectId).then((result: Project | null) => {
                    setProject(result);
                });
            } else {
                setShowBackdrop(false);
            }
        });
    }

    function uploadFile() {
        if (newFile !== null) {
            setShowBackdrop(true);
            setDialogFileOpen(false);
            postProjectFile(newFile, projectId, newFileTags).then((result) => {
                if (result) {
                    setProject(null);
                    setShowBackdrop(false);
                    getProject(projectId).then((result: Project | null) => {
                        setProject(result);
                    });
                } else {
                    setDialogFileOpen(false);
                    setShowBackdrop(false);
                }
            });
        }
    }

    function submitResourceOverwrite(
        resourceValue: ResourceValue,
        overwrite: ResourceValueOverwrite
    ) {
        setShowBackdrop(true);
        addResourceOverwrite(projectId, resourceValue, overwrite).then(
            (result: boolean) => {
                if (result) {
                    getProject(projectId).then((result: Project | null) => {
                        setProject(result);
                        setShowBackdrop(false);
                    });
                } else {
                    setShowBackdrop(false);
                }
            }
        );
    }

    function blockResource(resourceValue: ResourceValue) {
        setShowBackdrop(true);
        blockComputeProjectResource(projectId, resourceValue).then(
            (result: boolean) => {
                if (result) {
                    getProject(projectId).then((result: Project | null) => {
                        setProject(result);
                        setShowBackdrop(false);
                    });
                } else {
                    setShowBackdrop(false);
                }
            }
        );
    }

    function unblockResource(resourceValue: ResourceValue) {
        setShowBackdrop(true);
        unblockComputeProjectResource(projectId, resourceValue).then(
            (result: boolean) => {
                if (result) {
                    getProject(projectId).then((result: Project | null) => {
                        setProject(result);
                        setShowBackdrop(false);
                    });
                } else {
                    setShowBackdrop(false);
                }
            }
        );
    }

    function submitLimitOverwrite(
        limitValue: LimitValue,
        overwrite: LimitValueOverwrite
    ) {
        setShowBackdrop(true);
        addLimitOverwrite(projectId, limitValue, overwrite).then(
            (result: boolean) => {
                if (result) {
                    getProject(projectId).then((result: Project | null) => {
                        setProject(result);
                        setShowBackdrop(false);
                    });
                } else {
                    setShowBackdrop(false);
                }
            }
        );
    }

    function submitNewNote(note: string) {
        setShowBackdrop(true);
        addNote(projectId, note).then((result: boolean) => {
            if (result) {
                getProject(projectId).then((result: Project | null) => {
                    setProject(result);
                    setShowBackdrop(false);
                });
            } else {
                setShowBackdrop(false);
            }
        });
    }

    function updateComputeProject(
        computeProject: ComputeProject,
        isNew: boolean,
        resourceChanges: { phase: string; resourceId: string; value: number }[],
        limitChanges: { phase: string; limitId: string; value: number }[]
    ) {
        setShowBackdrop(true);
        if (isNew) {
            addComputeProject(projectId, computeProject).then(
                (result: boolean) => {
                    if (result) {
                        getProject(projectId).then((result: Project | null) => {
                            setProject(result);
                        });
                    }
                    setShowBackdrop(false);
                }
            );
        } else {
            const resourceChangesParam = resourceChanges.map(
                (rc: { phase: string; resourceId: string; value: number }) => {
                    const phaseSplit: string[] = rc.phase.split("-");
                    return {
                        start: new Date(Number(phaseSplit[0])).toISOString(),
                        end: new Date(Number(phaseSplit[1])).toISOString(),
                        resourceId: rc.resourceId,
                        value: rc.value,
                    };
                }
            );

            const limitChangesParam = limitChanges.map(
                (rc: { phase: string; limitId: string; value: number }) => {
                    const phaseSplit: string[] = rc.phase.split("-");
                    return {
                        start: new Date(Number(phaseSplit[0])).toISOString(),
                        end: new Date(Number(phaseSplit[1])).toISOString(),
                        limitId: rc.limitId,
                        value: rc.value,
                    };
                }
            );

            editComputeProject(
                projectId,
                computeProject,
                resourceChangesParam,
                limitChangesParam
            ).then((result: boolean) => {
                if (result) {
                    getProject(projectId).then((result: Project | null) => {
                        setProject(result);
                    });
                }
                setShowBackdrop(false);
            });
        }
    }

    const theme: Theme = useTheme();
    const navigate = useNavigate();

    function fetchAll() {
        setProject(null);
        getPredecessor(projectId).then((result: Project | null) => {
            setPredecessor(result);
        });
        getFollowup(projectId).then((result: Project | null) => {
            setFollowup(result);
        });
        getProject(projectId).then((result: Project | null) => {
            if (result !== null && result.principal_investigator_id !== null) {
                getPersonDetails(result.principal_investigator_id).then(
                    (personResult: Person | null) => {
                        setPrincipalInvestigator(personResult);
                    }
                );
            }
            if (result !== null && result.person_of_contact_id !== null) {
                getPersonDetails(result.person_of_contact_id).then(
                    (personResult: Person | null) => {
                        setPersonOfContact(personResult);
                    }
                );
            }
            if (result !== null && result.affiliation_id !== null) {
                getAffiliationsData([result.affiliation_id]).then(
                    (affiliationResult: {
                        institutes: Institute[];
                        organizations: Organization[];
                    }) => {
                        if (
                            affiliationResult.institutes.length > 0 &&
                            affiliationResult.organizations.length > 0
                        ) {
                            setAffiliation({
                                institute: affiliationResult.institutes[0],
                                organization:
                                    affiliationResult.organizations[0],
                            });
                        }
                        setProject(result);
                    }
                );
            } else {
                setProject(result);
            }
        });
    }

    React.useEffect(() => {
        setProject(null);
        getResourceManagerData().then(
            (result: {
                clusters: Cluster[];
                resources: Resource[];
                limits: Limit[];
            }) => {
                setClusters(result.clusters);
                setResources(result.resources);
                setLimits(result.limits);
            }
        );
        getPriorities().then((data: ResourcePriority[]) => setPriorities(data));
        getProjectEditCheck().then((result: boolean) => {
            updateShowEditButton(result);
        });
        checkServicePermission("ComputeProjectManager").then(
            (result: boolean) => {
                updateShowOverrideActions(result);
            }
        );
        checkServicePermission("Notes").then((result: boolean) => {
            updateShowNoteActions(result);
        });
        fetchAll();
    }, [projectId]);

    React.useEffect(() => {
        if (project === null) {
            return;
        } else if (
            project.abbreviation !== null &&
            project.abbreviation.trim().length > 0
        ) {
            document.title = project.abbreviation + " - PERSEUS";
        } else if (project.source !== null) {
            document.title =
                "#" +
                project.source.foreign_id +
                " (" +
                project.source.name +
                ") - PERSEUS";
        } else if (project.title !== null && project.title.trim().length > 0) {
            document.title = project.title + " - PERSEUS";
        }
    }, [project]);

    if (project === null) {
        return <LoadingBar />;
    }

    const VisuallyHiddenInput = styled("input")({
        clip: "rect(0 0 0 0)",
        clipPath: "inset(50%)",
        height: 1,
        overflow: "hidden",
        position: "absolute",
        bottom: 0,
        left: 0,
        whiteSpace: "nowrap",
        width: 1,
    });

    return (
        <>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                    <Typography
                        sx={{ fontSize: 14 }}
                        color="text.secondary"
                        gutterBottom
                    >
                        {project.source === null ? (
                            "source information unavailable"
                        ) : (
                            <>
                                #{project.source.foreign_id} (
                                {project.source.name})
                            </>
                        )}
                    </Typography>
                    <Typography variant="h5" component="div">
                        {project.abbreviation === null && project.title === null
                            ? "no title or abbreviation available"
                            : ""}
                        {project.abbreviation
                            ? project.abbreviation
                            : project.title}
                    </Typography>
                    <Typography
                        sx={{ fontSize: 14 }}
                        color="text.secondary"
                        gutterBottom
                    >
                        {project.abbreviation ? project.title : ""}
                    </Typography>

                    <Box sx={{ mt: 1 }}>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Call:&nbsp;&nbsp;</td>
                                    <td>
                                        {project.call === null ? (
                                            <i>not available</i>
                                        ) : (
                                            project.call
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Type:&nbsp;&nbsp;</td>
                                    <td>
                                        {project.project_type === null
                                            ? "unknown"
                                            : project.project_type}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Affiliation:&nbsp;&nbsp;</td>
                                    <td>
                                        {affiliation.institute === null ||
                                        affiliation.organization === null ? (
                                            <i>not available</i>
                                        ) : (
                                            <>
                                                {affiliation.organization.name}{" "}
                                                ({affiliation.institute.name})
                                            </>
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Current state(s):&nbsp;&nbsp;</td>
                                    <td>
                                        {project.state_machine.current_states
                                            .map((state) =>
                                                stateTypeName(
                                                    state,
                                                    frontendConfig
                                                )
                                            )
                                            .join(", ")}
                                    </td>
                                </tr>
                                {predecessor === null ? (
                                    ""
                                ) : (
                                    <tr>
                                        <td>Predecessor:&nbsp;&nbsp;</td>
                                        <td>
                                            <a
                                                href={
                                                    "/ProjectSearch/" +
                                                    predecessor._id
                                                }
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    navigate(
                                                        "/ProjectSearch/" +
                                                            predecessor._id
                                                    );
                                                    setProject(null);
                                                }}
                                                style={{
                                                    textDecoration: "none",
                                                    color: theme.palette.primary
                                                        .main,
                                                }}
                                            >
                                                #
                                                {predecessor.source?.foreign_id}{" "}
                                                ({predecessor.source?.name})
                                            </a>
                                        </td>
                                    </tr>
                                )}
                                {followup === null ? (
                                    ""
                                ) : (
                                    <tr>
                                        <td>Followup:&nbsp;&nbsp;</td>
                                        <td>
                                            <a
                                                href={
                                                    "/ProjectSearch/" +
                                                    followup._id
                                                }
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    navigate(
                                                        "/ProjectSearch/" +
                                                            followup._id
                                                    );
                                                    setProject(null);
                                                }}
                                                style={{
                                                    textDecoration: "none",
                                                    color: theme.palette.primary
                                                        .main,
                                                }}
                                            >
                                                #{followup.source?.foreign_id} (
                                                {followup.source?.name})
                                            </a>
                                        </td>
                                    </tr>
                                )}
                                <tr>
                                    <td>Start:&nbsp;&nbsp;</td>
                                    <td>
                                        {project.start === null ? (
                                            <i>no date available</i>
                                        ) : (
                                            new Date(
                                                project.start
                                            ).toUTCString()
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td>End:&nbsp;&nbsp;</td>
                                    <td>
                                        {project.end === null ? (
                                            <i>no date available</i>
                                        ) : (
                                            new Date(project.end).toUTCString()
                                        )}
                                    </td>
                                </tr>
                                {project.scientific_fields.length === 0 ? (
                                    ""
                                ) : (
                                    <>
                                        <tr>
                                            <td>
                                                Scientific fields:&nbsp;&nbsp;
                                            </td>
                                            <td>
                                                {
                                                    project.scientific_fields[0]
                                                        .subject_id
                                                }{" "}
                                                (
                                                <i>
                                                    {
                                                        project
                                                            .scientific_fields[0]
                                                            .name
                                                    }
                                                </i>
                                                )
                                            </td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td>
                                                {project.scientific_fields
                                                    .slice(1)
                                                    .map(
                                                        (
                                                            item: ScientificField,
                                                            index: number
                                                        ) => {
                                                            return index > 0 ? (
                                                                <React.Fragment
                                                                    key={index}
                                                                >
                                                                    <br />
                                                                    {
                                                                        item.subject_id
                                                                    }{" "}
                                                                    (
                                                                    <i>
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </i>
                                                                    )
                                                                </React.Fragment>
                                                            ) : (
                                                                <React.Fragment
                                                                    key={index}
                                                                >
                                                                    {
                                                                        item.subject_id
                                                                    }{" "}
                                                                    (
                                                                    <i>
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </i>
                                                                    )
                                                                </React.Fragment>
                                                            );
                                                        }
                                                    )}
                                            </td>
                                        </tr>
                                    </>
                                )}
                            </tbody>
                        </table>
                    </Box>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    <Box sx={{ textAlign: "right" }}>
                        <Chip
                            label={
                                project.project_type === null
                                    ? "unknown"
                                    : project.project_type
                            }
                            sx={{
                                background: projectTypeColor(
                                    project.project_type,
                                    frontendConfig
                                ),
                            }}
                        />
                        <Box>
                            <IconButton
                                aria-label="read more"
                                sx={{ mt: 1.5 }}
                                onClick={() => {
                                    updateOpenDetails(true);
                                }}
                            >
                                <ReadMoreIcon />
                            </IconButton>
                        </Box>
                    </Box>{" "}
                    <Box sx={{ display: "flex", gap: 1 }}>
                        {showNoteActions ? (
                            <AddNote onSubmit={submitNewNote} />
                        ) : (
                            ""
                        )}
                        {showEditButton ? (
                            <Link
                                to={"/ProjectEdit/" + project._id}
                                style={{
                                    textDecoration: "none",
                                    color: "inherit",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    aria-label="edit"
                                    sx={{ mt: 0 }}
                                    startIcon={<EditIcon />}
                                >
                                    Edit
                                </Button>
                            </Link>
                        ) : (
                            <></>
                        )}
                    </Box>
                </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
                <Card variant="outlined">
                    <TableContainer sx={{ maxHeight: "300px" }}>
                        <Table sx={{ width: "100%" }} size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Action</TableCell>
                                    <TableCell>Comment</TableCell>
                                    <TableCell>By</TableCell>
                                    <TableCell>Time</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {project.state_machine.events
                                    .sort(
                                        (e1, e2) =>
                                            new Date(e2.occurred).getTime() -
                                            new Date(e1.occurred).getTime()
                                    )
                                    .map((event, index: number) => {
                                        const borderStyle =
                                            index + 1 ===
                                            project.state_machine.events.length
                                                ? {
                                                      borderBottomWidth: "0px",
                                                  }
                                                : {};
                                        return (
                                            <TableRow
                                                key={index}
                                                sx={{
                                                    background: stateTypeColor(
                                                        event.state_id,
                                                        frontendConfig
                                                    ),
                                                }}
                                            >
                                                <TableCell
                                                    sx={{
                                                        ...borderStyle,
                                                    }}
                                                >
                                                    {stateTypeName(
                                                        event.state_id,
                                                        frontendConfig
                                                    )}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        ...borderStyle,
                                                        textarea: {
                                                            overflow: "hidden",
                                                        },
                                                    }}
                                                >
                                                    <ExpandableText
                                                        content={event.comment}
                                                    />
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        ...borderStyle,
                                                        width: "8em",
                                                    }}
                                                >
                                                    {event.by}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        ...borderStyle,
                                                        width: "20em",
                                                    }}
                                                >
                                                    {new Date(
                                                        event.occurred
                                                    ).toUTCString()}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Box>
            <Box sx={{ my: 3 }}>
                <ComputeProjectList
                    projectId={projectId}
                    clusters={clusters}
                    resources={resources}
                    limits={limits}
                    priorities={priorities}
                    computeProjects={project.compute_projects}
                    grantedResources={project.granted_resources}
                    grantedLimits={project.granted_limits}
                    onResourceBlock={blockResource}
                    onResourceUnblock={unblockResource}
                    onResourceOverwriteAdd={submitResourceOverwrite}
                    onResourceOverwriteEdit={submitResourceOverwrite}
                    onLimitOverwriteAdd={submitLimitOverwrite}
                    onLimitOverwriteEdit={submitLimitOverwrite}
                    onComputeProjectEdit={updateComputeProject}
                    showOverrideActions={showOverrideActions}
                />
            </Box>
            <Box sx={{ my: 3 }}>
                <ResourceLimitTable
                    projectId={projectId}
                    clusters={clusters}
                    resources={resources}
                    limits={limits}
                    requestedResources={project.requested_resources}
                    grantedResources={project.granted_resources}
                    requestedLimits={project.requested_limits}
                    grantedLimits={project.granted_limits}
                />
            </Box>
            <Accordion slotProps={{ transition: { timeout: 100 } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography component="span">
                        View responsible persons
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={1}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card
                                variant="outlined"
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    minHeight: "100px",
                                    position: "relative",
                                }}
                            >
                                {principalInvestigator === null ? (
                                    <CardContent
                                        sx={{
                                            width: "100%",
                                            height: "100%",
                                            padding: 0,
                                        }}
                                    >
                                        <Typography
                                            variant="h5"
                                            component="div"
                                            sx={{
                                                position: "absolute",
                                                top: "50%",
                                                marginTop: "-0.8em",
                                                width: "100%",
                                                textAlign: "center",
                                            }}
                                        >
                                            no PI available
                                        </Typography>
                                    </CardContent>
                                ) : (
                                    <CardContent>
                                        <Chip
                                            label="PI"
                                            sx={{
                                                position: "absolute",
                                                right: "10px",
                                                top: "10px",
                                            }}
                                        />
                                        <Typography
                                            sx={{ fontSize: 14 }}
                                            align="center"
                                            color="text.secondary"
                                            gutterBottom
                                        >
                                            {principalInvestigator.title ===
                                            null ? (
                                                <>&nbsp;</>
                                            ) : (
                                                principalInvestigator.title
                                            )}
                                        </Typography>
                                        <Typography
                                            variant="h5"
                                            align="center"
                                            component="div"
                                        >
                                            <Box
                                                sx={{
                                                    "&:hover": {
                                                        color: theme.palette
                                                            .primary.main,
                                                    },
                                                }}
                                                component="span"
                                            >
                                                <Link
                                                    to={
                                                        "/PersonSearch/" +
                                                        principalInvestigator._id
                                                    }
                                                    style={{
                                                        textDecoration: "none",
                                                        color: "inherit",
                                                    }}
                                                >
                                                    {
                                                        principalInvestigator.firstname
                                                    }{" "}
                                                    {
                                                        principalInvestigator.lastname
                                                    }
                                                </Link>
                                            </Box>
                                        </Typography>
                                        <List dense>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <PersonIcon />
                                                </ListItemIcon>
                                                <ListItemText>
                                                    {principalInvestigator.username ===
                                                    null ? (
                                                        <i>N/A</i>
                                                    ) : (
                                                        principalInvestigator.username
                                                    )}
                                                </ListItemText>
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <EmailIcon />
                                                </ListItemIcon>
                                                <ListItemText>
                                                    {principalInvestigator.email ===
                                                    null ? (
                                                        <i>N/A</i>
                                                    ) : (
                                                        principalInvestigator.email
                                                    )}
                                                </ListItemText>
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <PhoneIcon />
                                                </ListItemIcon>
                                                <ListItemText>
                                                    {principalInvestigator.phone ===
                                                    null ? (
                                                        <i>N/A</i>
                                                    ) : (
                                                        principalInvestigator.phone
                                                    )}
                                                </ListItemText>
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <HttpIcon />
                                                </ListItemIcon>
                                                <ListItemText>
                                                    {principalInvestigator.homepage ===
                                                    null ? (
                                                        <i>N/A</i>
                                                    ) : (
                                                        <a
                                                            href={
                                                                principalInvestigator.homepage
                                                            }
                                                            style={{
                                                                textDecoration:
                                                                    "none",
                                                                color: theme
                                                                    .palette
                                                                    .primary
                                                                    .main,
                                                            }}
                                                            target="_blank"
                                                        >
                                                            Go to website
                                                        </a>
                                                    )}
                                                </ListItemText>
                                            </ListItem>
                                        </List>
                                    </CardContent>
                                )}
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card
                                variant="outlined"
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    position: "relative",
                                }}
                            >
                                {personOfContact === null ? (
                                    <CardContent
                                        sx={{
                                            width: "100%",
                                            height: "100%",
                                            padding: 0,
                                        }}
                                    >
                                        <Typography
                                            variant="h5"
                                            component="div"
                                            sx={{
                                                position: "absolute",
                                                top: "50%",
                                                marginTop: "-0.8em",
                                                width: "100%",
                                                textAlign: "center",
                                            }}
                                        >
                                            no PC available
                                        </Typography>
                                    </CardContent>
                                ) : (
                                    <CardContent>
                                        <Chip
                                            label="PC"
                                            sx={{
                                                position: "absolute",
                                                right: "10px",
                                                top: "10px",
                                            }}
                                        />
                                        <Typography
                                            sx={{ fontSize: 14 }}
                                            align="center"
                                            color="text.secondary"
                                            gutterBottom
                                        >
                                            {personOfContact.title === null ? (
                                                <>&nbsp;</>
                                            ) : (
                                                personOfContact.title
                                            )}
                                        </Typography>
                                        <Typography
                                            variant="h5"
                                            align="center"
                                            component="div"
                                        >
                                            <Box
                                                sx={{
                                                    "&:hover": {
                                                        color: theme.palette
                                                            .primary.main,
                                                    },
                                                }}
                                                component="span"
                                            >
                                                <Link
                                                    to={
                                                        "/PersonSearch/" +
                                                        personOfContact._id
                                                    }
                                                    style={{
                                                        textDecoration: "none",
                                                        color: "inherit",
                                                    }}
                                                >
                                                    {personOfContact.firstname}{" "}
                                                    {personOfContact.lastname}
                                                </Link>
                                            </Box>
                                        </Typography>
                                        <List dense>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <PersonIcon />
                                                </ListItemIcon>
                                                <ListItemText>
                                                    {personOfContact.username ===
                                                    null ? (
                                                        <i>N/A</i>
                                                    ) : (
                                                        personOfContact.username
                                                    )}
                                                </ListItemText>
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <EmailIcon />
                                                </ListItemIcon>
                                                <ListItemText>
                                                    {personOfContact.email ===
                                                    null ? (
                                                        <i>N/A</i>
                                                    ) : (
                                                        personOfContact.email
                                                    )}
                                                </ListItemText>
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <PhoneIcon />
                                                </ListItemIcon>
                                                <ListItemText>
                                                    {personOfContact.phone ===
                                                    null ? (
                                                        <i>N/A</i>
                                                    ) : (
                                                        personOfContact.phone
                                                    )}
                                                </ListItemText>
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <HttpIcon />
                                                </ListItemIcon>
                                                <ListItemText>
                                                    {personOfContact.homepage ===
                                                    null ? (
                                                        <i>N/A</i>
                                                    ) : (
                                                        <a
                                                            href={
                                                                personOfContact.homepage
                                                            }
                                                            style={{
                                                                textDecoration:
                                                                    "none",
                                                                color: theme
                                                                    .palette
                                                                    .primary
                                                                    .main,
                                                            }}
                                                            target="_blank"
                                                        >
                                                            Go to website
                                                        </a>
                                                    )}
                                                </ListItemText>
                                            </ListItem>
                                        </List>
                                    </CardContent>
                                )}
                            </Card>
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
            <Accordion slotProps={{ transition: { timeout: 100 } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography component="span">View publications</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <PublicationList publications={project.publications} />
                    <Button
                        variant="contained"
                        sx={{ float: "right", mt: 3, mb: 2 }}
                        onClick={() => {
                            setDialogPublicationOpen(true);
                        }}
                    >
                        <AddIcon />
                        Add publication
                    </Button>
                    <Dialog
                        open={dialogPublicationOpen}
                        onClose={() => {
                            setNewPublication({
                                type: "bibtex",
                                content: "",
                            });
                            setDialogPublicationOpen(false);
                        }}
                        maxWidth="md"
                        fullWidth
                    >
                        <DialogTitle>Add new publication</DialogTitle>
                        <DialogContent>
                            <FormControl fullWidth sx={{ mt: 2 }}>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    label="Type"
                                    value={newPublication.type}
                                    onChange={(e) => {
                                        newPublication.type = e.target.value as
                                            | "bibtex"
                                            | "doi";
                                        setNewPublication(
                                            JSON.parse(
                                                JSON.stringify(newPublication)
                                            )
                                        );
                                    }}
                                >
                                    <MenuItem value="doi">DOI</MenuItem>
                                    <MenuItem value="bibtex">bibtex</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label={
                                    newPublication.type === "bibtex"
                                        ? "bibtex"
                                        : "DOI"
                                }
                                variant="outlined"
                                multiline={newPublication.type === "bibtex"}
                                rows={newPublication.type === "bibtex" ? 6 : 1}
                                value={newPublication.content}
                                onChange={(e) => {
                                    newPublication.content =
                                        e.currentTarget.value;
                                    setNewPublication(
                                        JSON.parse(
                                            JSON.stringify(newPublication)
                                        )
                                    );
                                }}
                                fullWidth
                                sx={{ mt: 2 }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => {
                                    setDialogPublicationOpen(false);
                                    setNewPublication({
                                        type: "doi",
                                        content: "",
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={addPublication}
                            >
                                Add publication
                            </Button>
                        </DialogActions>
                    </Dialog>
                </AccordionDetails>
            </Accordion>
            <Accordion slotProps={{ transition: { timeout: 100 } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography component="span">View files</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <List>
                        {_.keys(project.files).map((name: string) => {
                            return (
                                <ListItem
                                    disablePadding
                                    key={project.files[name]}
                                >
                                    <a
                                        href={
                                            CONFIG.CORE_URL +
                                            "/file/" +
                                            project.files[name] +
                                            "/" +
                                            name
                                        }
                                        target="_blank"
                                        style={{
                                            color: "inherit",
                                            textDecoration: "none",
                                            width: "100%",
                                        }}
                                    >
                                        <ListItemButton>
                                            <ListItemIcon>
                                                <FileTypeIcon
                                                    filename={name}
                                                    size="2.5em"
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={name}
                                                secondary={project.file_tags[
                                                    name
                                                ].join(", ")}
                                            />
                                        </ListItemButton>
                                    </a>
                                </ListItem>
                            );
                        })}
                    </List>
                    <Button
                        variant="contained"
                        sx={{ float: "right", mt: 3, mb: 2 }}
                        onClick={() => {
                            getFileTagSuggestions().then((result: string[]) => {
                                setFileTagsSuggestions(result);
                            });
                            setDialogFileOpen(true);
                        }}
                    >
                        <AddIcon />
                        Add file
                    </Button>
                    <Dialog
                        open={dialogFileOpen}
                        onClose={() => {
                            setNewFile(null);
                            setNewFileTags([]);
                            setDialogFileOpen(false);
                        }}
                        maxWidth="md"
                        fullWidth
                    >
                        <DialogTitle>Add file</DialogTitle>
                        <DialogContent sx={{ textAlign: "center" }}>
                            <Button
                                component="label"
                                role={undefined}
                                variant="contained"
                                disabled={newFile !== null}
                                tabIndex={-1}
                                startIcon={<CloudUploadIcon />}
                            >
                                {newFile === null
                                    ? "Select file"
                                    : newFile.name}
                                <VisuallyHiddenInput
                                    type="file"
                                    onChange={(e) => {
                                        const files = e.target.files;
                                        if (files !== null) {
                                            setNewFile(files[0]);
                                        }
                                    }}
                                />
                            </Button>
                            <Autocomplete
                                freeSolo
                                multiple
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Tags"
                                        helperText="Use the enter key to add a tag, otherwise they will not be saved!"
                                    />
                                )}
                                value={newFileTags}
                                onChange={(_, newValues) => {
                                    setNewFileTags(
                                        JSON.parse(JSON.stringify(newValues))
                                    );
                                }}
                                options={newFileTagsSuggestions}
                                sx={{ mt: 2 }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => {
                                    setDialogFileOpen(false);
                                    setNewFile(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button variant="contained" onClick={uploadFile}>
                                Upload
                            </Button>
                        </DialogActions>
                    </Dialog>
                </AccordionDetails>
            </Accordion>
            <Accordion slotProps={{ transition: { timeout: 100 } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography component="span">View state machine</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ textAlign: "center" }}>
                        <Mermaid chart={project.state_machine.graph} />
                    </Box>
                </AccordionDetails>
            </Accordion>
            <Accordion slotProps={{ transition: { timeout: 100 } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography component="span">View source</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <pre style={{ maxWidth: "100%", overflowX: "scroll" }}>
                        {JSON.stringify(project, null, 2)}
                    </pre>
                </AccordionDetails>
            </Accordion>
            <Dialog
                open={openDetails}
                onClose={() => {
                    updateOpenDetails(false);
                }}
                fullScreen
            >
                <AppBar sx={{ position: "relative" }}>
                    <Toolbar>
                        <Typography
                            sx={{ flex: 1 }}
                            variant="h6"
                            component="div"
                        >
                            {project.title}
                        </Typography>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={() => {
                                updateOpenDetails(false);
                            }}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Box sx={{ px: 3 }}>
                    <table
                        style={{
                            borderCollapse: "separate",
                            borderSpacing: "0 1em",
                        }}
                    >
                        <tbody>
                            <tr>
                                <td
                                    style={{
                                        verticalAlign: "top",
                                        minWidth: "150px",
                                        maxWidth: "25%",
                                    }}
                                >
                                    Description:&nbsp;
                                </td>
                                <td>{project.description}</td>
                            </tr>
                            {_.keys(
                                project.custom_fields[
                                    "additional_description"
                                ] as { [key: string]: string | number }
                            ).map((entryKey: string) => {
                                return (
                                    <tr key={entryKey}>
                                        <td style={{ verticalAlign: "top" }}>
                                            {entryKey}:&nbsp;
                                        </td>
                                        <td>
                                            {
                                                (
                                                    project.custom_fields[
                                                        "additional_description"
                                                    ] as {
                                                        [key: string]:
                                                            | string
                                                            | number;
                                                    }
                                                )[entryKey]
                                            }
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Box>
            </Dialog>
            <PageBackdrop open={showBackdrop} />
        </>
    );
}
