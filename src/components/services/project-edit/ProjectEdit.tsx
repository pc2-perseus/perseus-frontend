// React imports
import React from "react";

// MUI imports
import {
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Snackbar,
    TextField,
    Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";

// Custom imports
import Project from "../../../interfaces/Project.ts";
import getProject from "../../../api/project-details/getProject.ts";
import MaterialUICopyField from "../../../dynamic-forms/renderer/mui/MaterialUICopyField.tsx";
import ScientificField from "../../../interfaces/ScientificField.ts";
import Resource from "../../../interfaces/Resource.ts";
import Cluster from "../../../interfaces/Cluster.ts";
import getResourceManagerData from "../../../api/getResourceManagerData.ts";
import ResourceCard from "./ResourceCard.tsx";
import LimitCard from "./LimitCard.tsx";
import Limit from "../../../interfaces/Limit.ts";
import getProjectEditOptions from "../../../api/project-edit/getProjectEditOptions.ts";
import TextFieldProjectAttribute from "./TextFieldProjectAttribute.tsx";
import ScientificFieldsSelector from "./ScientificFieldsSelector.tsx";
import ActiveSelector from "./ActiveSelector.tsx";
import RuntimeSelector from "./RuntimeSelector.tsx";
import Person from "../../../interfaces/Person.ts";
import PersonSelector from "./PersonSelector.tsx";
import Institute from "../../../interfaces/Institute.ts";
import Organization from "../../../interfaces/Organization.ts";
import AffiliationSelector from "./AffiliationSelector.tsx";
import ResourceValue from "../../../interfaces/ResourceValue.ts";

// Other imports
import { Dayjs } from "dayjs";
import projectDiff from "../../../utils/projectDiff.ts";
import LimitValue from "../../../interfaces/LimitValue.ts";
import StatesSelector from "./StatesSelector.tsx";
import editProject from "../../../api/project-edit/editProject.ts";
import PageBackdrop from "../../PageBackdrop.tsx";
import LoadingBar from "../../LoadingBar.tsx";
import ResourcePriority from "../../../interfaces/ResourcePriority.ts";
import getPriorities from "../../../api/resource-priorities/getPriorities.ts";

export default function ProjectEdit({
    projectId,
}: {
    projectId?: string;
}): React.ReactElement {
    const [project, setProject] = React.useState<Project | null>(null);
    const [resources, setResources] = React.useState<Resource[]>([]);
    const [clusters, setClusters] = React.useState<Cluster[]>([]);
    const [limits, setLimits] = React.useState<Limit[]>([]);
    const [priorities, setPriorities] = React.useState<ResourcePriority[]>([]);
    const [diff, setDiff] = React.useState<string[]>([]);
    const [showDialog, setShowDialog] = React.useState<boolean>(false);
    const [showSnackbar, setShowSnackbar] = React.useState<boolean>(false);
    const [showBackdrop, setShowBackdrop] = React.useState<boolean>(false);

    const workingCopy = React.useRef<Project | null>(null);

    const [options, setOptions] = React.useState<{
        source_names: string[];
        project_types: string[];
        scientific_fields: ScientificField[];
        calls: string[];
        persons: Person[];
        institutes: Institute[];
        organizations: Organization[];
        states: string[];
    }>({
        source_names: [],
        project_types: [],
        scientific_fields: [],
        calls: [],
        persons: [],
        institutes: [],
        organizations: [],
        states: [],
    });

    function openSaveDialog() {
        if (project !== null && workingCopy.current !== null) {
            const currentDiff: string[] = projectDiff(
                project,
                workingCopy.current
            );
            setDiff(currentDiff);
            if (currentDiff.length > 0) {
                setShowDialog(true);
            } else {
                setShowSnackbar(true);
            }
        } else {
            setDiff([]);
        }
    }

    function submitChanges() {
        if (workingCopy.current !== null) {
            setShowBackdrop(true);
            editProject(
                workingCopy.current,
                `${
                    diff.filter(
                        (item: string) =>
                            ![
                                "Changes regarding requested resources:",
                                "Changes regarding granted resources:",
                                "Changes regarding requested limits:",
                                "Changes regarding granted limits:",
                            ].includes(item)
                    ).length
                } change(s):\n` + diff.join("\n")
            ).then((data: boolean) => {
                setShowBackdrop(false);
                if (data) {
                    window.location.href = `${import.meta.env.BASE_URL}ProjectSearch/${projectId}`;
                }
            });
        }
    }

    React.useEffect(() => {
        getResourceManagerData().then(
            (data: {
                clusters: Cluster[];
                resources: Resource[];
                limits: Limit[];
            }) => {
                setClusters(data.clusters);
                setResources(data.resources);
                setLimits(data.limits);
            }
        );
        getProjectEditOptions().then(
            (data: {
                source_names: string[];
                project_types: string[];
                scientific_fields: ScientificField[];
                calls: string[];
                persons: Person[];
                institutes: Institute[];
                organizations: Organization[];
                states: string[];
            }) => {
                setOptions(data);
            }
        );
        getPriorities().then((data: ResourcePriority[]) => setPriorities(data));
    }, []);

    React.useEffect(() => {
        if (projectId === undefined) {
            setProject(null);
        } else {
            getProject(projectId).then((data: Project | null) => {
                workingCopy.current = JSON.parse(JSON.stringify(data));
                setProject(data);
            });
        }
    }, [projectId]);

    React.useEffect(() => {
        if (project === null) {
            return;
        } else if (
            project.abbreviation !== null &&
            project.abbreviation.trim().length > 0
        ) {
            document.title = "Edit " + project.abbreviation + " - PERSEUS";
        } else if (project.source !== null) {
            document.title =
                "Edit #" +
                project.source.foreign_id +
                " (" +
                project.source.name +
                ") - PERSEUS";
        } else if (project.title !== null && project.title.trim().length > 0) {
            document.title = "Edit " + project.title + " - PERSEUS";
        }
    }, [project]);

    if (
        project === null ||
        workingCopy.current === null ||
        options.persons.length === 0
    ) {
        return <LoadingBar />;
    }

    return (
        <>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 8, md: 5, lg: 4 }}>
                        <Typography variant="h3">Edit project</Typography>
                    </Grid>
                    <Grid size={{ xs: 4, md: 7, lg: 8 }}>
                        <MaterialUICopyField
                            config={{
                                type: "copyitem",
                                id: "",
                                label: "PERSEUS OID",
                                value: project._id === null ? "" : project._id,
                            }}
                        />
                    </Grid>
                </Grid>

                <Card sx={{ my: 2 }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Source
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextFieldProjectAttribute
                                    label="Source"
                                    value={project.source?.name}
                                    options={options.source_names}
                                    onChange={(value: string | null) => {
                                        if (
                                            value !== null &&
                                            workingCopy.current !== null &&
                                            workingCopy.current?.source !== null
                                        ) {
                                            workingCopy.current.source.name =
                                                value;
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextFieldProjectAttribute
                                    label="Source ID"
                                    value={project.source?.foreign_id}
                                    onChange={(value: string | null) => {
                                        if (
                                            value !== null &&
                                            workingCopy.current !== null &&
                                            workingCopy.current?.source !== null
                                        ) {
                                            workingCopy.current.source.foreign_id =
                                                value;
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Card sx={{ my: 2 }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            General
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextFieldProjectAttribute
                                    label="Abbreviation"
                                    value={project.abbreviation}
                                    onChange={(value: string | null) => {
                                        if (
                                            value !== null &&
                                            workingCopy.current !== null
                                        ) {
                                            workingCopy.current.abbreviation =
                                                value;
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextFieldProjectAttribute
                                    label="Type"
                                    value={project.project_type}
                                    options={options.project_types}
                                    onChange={(value: string | null) => {
                                        if (
                                            value !== null &&
                                            workingCopy.current !== null
                                        ) {
                                            workingCopy.current.project_type =
                                                value;
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextFieldProjectAttribute
                                    label="Title"
                                    value={project.title}
                                    onChange={(value: string | null) => {
                                        if (
                                            value !== null &&
                                            workingCopy.current !== null
                                        ) {
                                            workingCopy.current.title = value;
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextFieldProjectAttribute
                                    label="Description"
                                    value={project.description}
                                    onChange={(value: string | null) => {
                                        if (
                                            value !== null &&
                                            workingCopy.current !== null
                                        ) {
                                            workingCopy.current.description =
                                                value;
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <ScientificFieldsSelector
                                    scientificFields={project.scientific_fields}
                                    options={options.scientific_fields}
                                    onChange={(value: ScientificField[]) => {
                                        if (workingCopy.current !== null) {
                                            workingCopy.current.scientific_fields =
                                                value;
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Card sx={{ my: 2 }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Runtime
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <RuntimeSelector
                                    label="Start (UTC)"
                                    value={project.start}
                                    onChange={(value: Dayjs | null) => {
                                        if (workingCopy.current !== null) {
                                            workingCopy.current.start =
                                                value === null
                                                    ? null
                                                    : value
                                                          .toDate()
                                                          .toISOString();
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <RuntimeSelector
                                    label="End (UTC)"
                                    value={project.end}
                                    onChange={(value: Dayjs | null) => {
                                        if (workingCopy.current !== null) {
                                            workingCopy.current.end =
                                                value === null
                                                    ? null
                                                    : value
                                                          .toDate()
                                                          .toISOString();
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextFieldProjectAttribute
                                    label="Call"
                                    value={project.call}
                                    freeSolo
                                    options={options.calls}
                                    onChange={(value: string | null) => {
                                        if (
                                            value !== null &&
                                            workingCopy.current !== null
                                        ) {
                                            workingCopy.current.call = value;
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <ActiveSelector
                                    value={project.is_active}
                                    onChange={(value: boolean) => {
                                        if (
                                            value !== null &&
                                            workingCopy.current !== null
                                        ) {
                                            workingCopy.current.is_active =
                                                value;
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Card sx={{ my: 2 }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Links
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <PersonSelector
                                    label="Principal Investigator"
                                    personId={project.principal_investigator_id}
                                    options={options.persons}
                                    onChange={(value: Person | null) => {
                                        if (workingCopy.current !== null) {
                                            workingCopy.current.principal_investigator_id =
                                                value === null
                                                    ? null
                                                    : value._id;
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <PersonSelector
                                    label="Person of Contact"
                                    personId={project.person_of_contact_id}
                                    options={options.persons}
                                    onChange={(value: Person | null) => {
                                        if (workingCopy.current !== null) {
                                            workingCopy.current.person_of_contact_id =
                                                value === null
                                                    ? null
                                                    : value._id;
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <AffiliationSelector
                                    affiliationId={project.affiliation_id}
                                    institutes={options.institutes}
                                    organizations={options.organizations}
                                    onChange={(value: Institute | null) => {
                                        if (workingCopy.current !== null) {
                                            workingCopy.current.affiliation_id =
                                                value === null ||
                                                value._id === undefined
                                                    ? null
                                                    : value._id;
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextFieldProjectAttribute
                                    label="Predecessor OID"
                                    value={project.source?.predecessor_id}
                                    onChange={(value: string | null) => {
                                        if (
                                            value !== null &&
                                            workingCopy.current !== null &&
                                            workingCopy.current.source !== null
                                        ) {
                                            workingCopy.current.source.predecessor_id =
                                                value;
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <ResourceCard
                    title="Requested resources"
                    resourceValues={project.requested_resources}
                    clusters={clusters}
                    resources={resources}
                    priorities={priorities}
                    projectStart={workingCopy.current?.start}
                    projectEnd={workingCopy.current?.end}
                    onChange={(values: ResourceValue[]) => {
                        if (workingCopy.current !== null) {
                            workingCopy.current.requested_resources = values;
                        }
                    }}
                />

                <ResourceCard
                    title="Granted resources"
                    resourceValues={project.granted_resources}
                    clusters={clusters}
                    resources={resources}
                    priorities={priorities}
                    projectStart={workingCopy.current?.start}
                    projectEnd={workingCopy.current?.end}
                    onChange={(values: ResourceValue[]) => {
                        if (workingCopy.current !== null) {
                            workingCopy.current.granted_resources = values;
                        }
                    }}
                />

                <LimitCard
                    title="Requested limits"
                    limitValues={project.requested_limits}
                    limits={limits}
                    projectStart={workingCopy.current?.start}
                    projectEnd={workingCopy.current?.end}
                    onChange={(values: LimitValue[]) => {
                        if (workingCopy.current !== null) {
                            workingCopy.current.requested_limits = values;
                        }
                    }}
                />

                <LimitCard
                    title="Granted limits"
                    limitValues={project.granted_limits}
                    limits={limits}
                    projectStart={workingCopy.current?.start}
                    projectEnd={workingCopy.current?.end}
                    onChange={(values: LimitValue[]) => {
                        if (workingCopy.current !== null) {
                            workingCopy.current.granted_limits = values;
                        }
                    }}
                />

                <Card sx={{ my: 2 }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            State
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <StatesSelector
                                    states={
                                        project.state_machine.current_states
                                    }
                                    options={options.states}
                                    onChange={(value: string[]) => {
                                        if (workingCopy.current !== null) {
                                            workingCopy.current.state_machine.current_states =
                                                value;
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Button
                    variant="contained"
                    sx={{ my: 2, float: "right" }}
                    onClick={openSaveDialog}
                >
                    Save changes
                </Button>
                <Button
                    variant="contained"
                    color="warning"
                    sx={{ m: 2, float: "right" }}
                    onClick={() => {
                        window.location.reload();
                    }}
                >
                    Reset changes
                </Button>
                <Snackbar
                    open={showSnackbar}
                    autoHideDuration={3000}
                    onClose={() => {
                        setShowSnackbar(false);
                    }}
                    sx={{ mb: 10 }}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    message="No changes made yet"
                />
                <Dialog
                    open={showDialog}
                    onClose={() => {
                        setShowDialog(false);
                    }}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>Save changes</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Please note that saved changes lead to direct data
                            manipulation on the project object in the database.
                            Please be sure that you only made changes you
                            intended to:
                        </Typography>
                        <TextField
                            label="Changes"
                            defaultValue={diff.join("\n")}
                            slotProps={{
                                input: {
                                    readOnly: true,
                                },
                            }}
                            sx={{ mt: 3 }}
                            multiline
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => {
                                setShowDialog(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button variant="contained" onClick={submitChanges}>
                            Save changes
                        </Button>
                    </DialogActions>
                </Dialog>
            </LocalizationProvider>
            <PageBackdrop open={showBackdrop} />
        </>
    );
}
