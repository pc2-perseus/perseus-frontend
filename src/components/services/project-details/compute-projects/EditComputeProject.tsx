// React imports
import React, { useState } from "react";

// MUI imports
import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    Tab,
    Tabs,
    TextField,
} from "@mui/material";

// Custom imports
import ComputeProject from "../../../../interfaces/ComputeProject.ts";
import ResourceValue from "../../../../interfaces/ResourceValue.ts";
import LimitValue from "../../../../interfaces/LimitValue.ts";
import EditComputeProjectResources from "./EditComputeProjectResources.tsx";

// Other imports
import _ from "lodash";
import Resource from "../../../../interfaces/Resource.ts";
import Limit from "../../../../interfaces/Limit.ts";
import Cluster from "../../../../interfaces/Cluster.ts";
import EditComputeProjectLimits from "./EditComputeProjectLimits.tsx";

export default function EditComputeProject({
    computeProject,
    isNewComputeProject,
    existingComputeProjects,
    computeProjectElements,
    grantedResources,
    grantedLimits,
    clusters,
    resources,
    limits,
    onEdit,
    showDialog,
    setShowDialog,
}: {
    computeProject: ComputeProject;
    isNewComputeProject: boolean;
    existingComputeProjects: ComputeProject[];
    computeProjectElements: { [key: string]: (ResourceValue | LimitValue)[] };
    grantedResources: ResourceValue[];
    grantedLimits: LimitValue[];
    clusters: Cluster[];
    resources: Resource[];
    limits: Limit[];
    onEdit: (
        computeProject: ComputeProject,
        resourceChanges: { phase: string; resourceId: string; value: number }[],
        limitChanges: { phase: string; limitId: string; value: number }[]
    ) => void;
    showDialog: boolean;
    setShowDialog: (showDialog: boolean) => void;
}): React.ReactElement {
    const [currentTab, setCurrentTab] = React.useState<number>(0);
    const [elements, setElements] = useState<{
        [key: string]: (ResourceValue | LimitValue)[];
    }>({});

    const [isNew, setIsNew] = useState<boolean>(false);
    const [workingComputeProject, setWorkingComputeProject] =
        React.useState<ComputeProject>({
            _id: null,
            files: {},
            file_tags: {},
            compute_project_id: "",
            member_ids: [],
            custom_fields: { "": "" },
        });

    const [resourceChanges, updateResourceChanges] = React.useState<
        { phase: string; resourceId: string; value: number }[]
    >([]);
    const [limitChanges, updateLimitChanges] = React.useState<
        { phase: string; limitId: string; value: number }[]
    >([]);

    const customFieldOptions: string[] = _.difference(
        _.flatten(
            existingComputeProjects.map((cp: ComputeProject) => {
                return _.keys(cp.custom_fields);
            })
        ),
        _.keys(workingComputeProject.custom_fields)
    );

    function updateKey(key: string, newKey: string) {
        workingComputeProject.custom_fields = Object.fromEntries(
            Object.entries(workingComputeProject.custom_fields).map(
                ([oldKey, value]: [string, string]) => [
                    oldKey === key ? newKey : oldKey,
                    value,
                ]
            )
        );
        if (
            !_.some(
                _.keys(workingComputeProject.custom_fields),
                (key: string) => key.length === 0
            )
        ) {
            workingComputeProject.custom_fields[""] = "";
        }
        setWorkingComputeProject(
            JSON.parse(JSON.stringify(workingComputeProject))
        );
    }

    React.useEffect(() => {
        if (
            !_.some(
                _.keys(computeProject.custom_fields),
                (key: string) => key.length === 0
            )
        ) {
            computeProject.custom_fields[""] = "";
        }
        setCurrentTab(0);
        setWorkingComputeProject(JSON.parse(JSON.stringify(computeProject)));
        updateResourceChanges([]);
        updateLimitChanges([]);
    }, [computeProject]);

    React.useEffect(() => {
        setIsNew(isNewComputeProject);
    }, [isNewComputeProject]);

    React.useEffect(() => {
        setElements(JSON.parse(JSON.stringify(computeProjectElements)));
    }, [computeProjectElements]);

    return (
        <Dialog
            open={showDialog}
            onClose={() => {
                setShowDialog(false);
            }}
            maxWidth="md"
            fullWidth
            scroll="paper"
        >
            <DialogTitle sx={{ pb: 0 }}>
                {isNewComputeProject ? "Add new" : "Edit"} compute project{" "}
                {computeProject !== undefined ? (
                    <i>{computeProject.compute_project_id}</i>
                ) : (
                    ""
                )}
                <Tabs
                    value={currentTab}
                    onChange={(_, value: number) => {
                        setCurrentTab(value);
                    }}
                >
                    <Tab label="General" />
                    {isNew ? "" : <Tab label="Resources" />}
                    {/* <Tab label="Limits" /> */}
                </Tabs>
            </DialogTitle>
            <DialogContent dividers>
                <Box>
                    <div
                        role="tabpanel"
                        hidden={currentTab !== 0}
                        style={{ position: "relative" }}
                    >
                        {currentTab === 0 ? (
                            <Grid container spacing={2}>
                                <Grid size={12}>
                                    <TextField
                                        label="Name"
                                        value={
                                            workingComputeProject.compute_project_id
                                        }
                                        onChange={(e) => {
                                            workingComputeProject.compute_project_id =
                                                e.currentTarget.value;
                                            setWorkingComputeProject(
                                                JSON.parse(
                                                    JSON.stringify(
                                                        workingComputeProject
                                                    )
                                                )
                                            );
                                        }}
                                        disabled={!isNew}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid size={12}>
                                    <Divider orientation="horizontal">
                                        custom metadata
                                    </Divider>
                                </Grid>
                                {_.keys(
                                    workingComputeProject.custom_fields
                                ).map((key: string, index: number) => {
                                    return (
                                        <React.Fragment key={index}>
                                            <Grid size={{ xs: 12, md: 4 }}>
                                                <Autocomplete
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Key"
                                                        />
                                                    )}
                                                    inputValue={key}
                                                    onInputChange={(
                                                        _,
                                                        newKey: string
                                                    ) => {
                                                        updateKey(key, newKey);
                                                    }}
                                                    options={customFieldOptions}
                                                    groupBy={() =>
                                                        "Suggestions"
                                                    }
                                                    freeSolo
                                                    fullWidth
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 8 }}>
                                                <TextField
                                                    label="Value"
                                                    value={
                                                        workingComputeProject
                                                            .custom_fields[key]
                                                    }
                                                    onChange={(e) => {
                                                        workingComputeProject.custom_fields[
                                                            key
                                                        ] =
                                                            e.currentTarget.value;
                                                        setWorkingComputeProject(
                                                            JSON.parse(
                                                                JSON.stringify(
                                                                    workingComputeProject
                                                                )
                                                            )
                                                        );
                                                    }}
                                                    fullWidth
                                                />
                                            </Grid>
                                        </React.Fragment>
                                    );
                                })}
                            </Grid>
                        ) : (
                            ""
                        )}
                    </div>
                    <div role="tabpanel" hidden={currentTab !== 1}>
                        {currentTab === 1 ? (
                            <EditComputeProjectResources
                                computeProjectId={
                                    computeProject.compute_project_id
                                }
                                elements={elements}
                                clusters={clusters}
                                resources={resources}
                                grantedResources={grantedResources}
                                resourceChanges={resourceChanges}
                                updateResourceChanges={updateResourceChanges}
                            />
                        ) : (
                            ""
                        )}
                    </div>
                    <div role="tabpanel" hidden={currentTab !== 2}>
                        {currentTab === 2 ? (
                            <EditComputeProjectLimits
                                computeProjectId={
                                    computeProject.compute_project_id
                                }
                                elements={elements}
                                limits={limits}
                                grantedLimits={grantedLimits}
                                limitChanges={limitChanges}
                                updateLimitChanges={updateLimitChanges}
                            />
                        ) : (
                            ""
                        )}
                    </div>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        setShowDialog(false);
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        if (
                            _.keys(
                                workingComputeProject.custom_fields
                            ).includes("")
                        ) {
                            delete workingComputeProject.custom_fields[""];
                        }

                        setShowDialog(false);
                        onEdit(
                            workingComputeProject,
                            resourceChanges,
                            limitChanges
                        );
                    }}
                >
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
}
