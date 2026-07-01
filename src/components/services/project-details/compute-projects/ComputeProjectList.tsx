// React imports
import React from "react";

// MUI imports
import { Box, Button } from "@mui/material";

// Custom imports
import ComputeProject from "../../../../interfaces/ComputeProject.ts";
import ResourceValue from "../../../../interfaces/ResourceValue.ts";
import LimitValue from "../../../../interfaces/LimitValue.ts";
import Cluster from "../../../../interfaces/Cluster.ts";
import Resource from "../../../../interfaces/Resource.ts";
import Limit from "../../../../interfaces/Limit.ts";
import ResourceValueOverwrite from "../../../../interfaces/ResourceValueOverwrite.ts";
import LimitValueOverwrite from "../../../../interfaces/LimitValueOverwrite.ts";
import EditComputeProject from "./EditComputeProject.tsx";
import getUsage from "../../../../api/project-details/getUsage.ts";
import ResourcePriority from "../../../../interfaces/ResourcePriority.ts";

// Other imports
import _ from "lodash";
import ComputeProjectCard from "./ComputeProjectCard.tsx";

export default function ComputeProjectList({
    projectId,
    computeProjects,
    grantedResources,
    grantedLimits,
    clusters,
    resources,
    limits,
    priorities,
    onResourceBlock,
    onResourceUnblock,
    onResourceOverwriteAdd,
    onResourceOverwriteEdit,
    onLimitOverwriteAdd,
    onLimitOverwriteEdit,
    onComputeProjectEdit,
    showOverrideActions,
}: {
    projectId: string;
    computeProjects: ComputeProject[];
    grantedResources: ResourceValue[];
    grantedLimits: LimitValue[];
    clusters: Cluster[];
    resources: Resource[];
    limits: Limit[];
    priorities: ResourcePriority[];
    onResourceBlock: (resourceValue: ResourceValue) => void;
    onResourceUnblock: (resourceValue: ResourceValue) => void;
    onResourceOverwriteAdd: (
        resourceValue: ResourceValue,
        overwrite: ResourceValueOverwrite
    ) => void;
    onResourceOverwriteEdit: (
        resourceValue: ResourceValue,
        overwrite: ResourceValueOverwrite
    ) => void;
    onLimitOverwriteAdd: (
        limitValue: LimitValue,
        overwrite: LimitValueOverwrite
    ) => void;
    onLimitOverwriteEdit: (
        limitValue: LimitValue,
        overwrite: LimitValueOverwrite
    ) => void;
    onComputeProjectEdit: (
        computeProject: ComputeProject,
        isNew: boolean,
        resourceChanges: { phase: string; resourceId: string; value: number }[],
        limitChanges: { phase: string; limitId: string; value: number }[]
    ) => void;
    showOverrideActions: boolean;
}): React.ReactElement {
    const [showComputeProjectEditDialog, setShowComputeProjectEditDialog] =
        React.useState<boolean>(false);
    const [isNewComputeProject, setIsNewComputeProject] =
        React.useState<boolean>(true);
    const [workingComputeProject, setWorkingComputeProject] =
        React.useState<ComputeProject>({
            _id: null,
            files: {},
            file_tags: {},
            member_ids: [],
            compute_project_id: "",
            custom_fields: { "": "" },
        });
    const [usageInformation, setUsageInformation] = React.useState<{
        [key: string]:
            | {
                  resource_id: string;
                  phases: {
                      start: string;
                      end: string;
                      value: number;
                      max: number;
                  }[];
              }[]
            | null;
    }>({});

    const grantedElementsGrouped = _.groupBy(
        [...grantedResources, ...grantedLimits],
        (item: ResourceValue | LimitValue) => item.compute_project_id
    );

    _.keys(grantedElementsGrouped).forEach((compute_project_id: string) => {
        // @ts-expect-error Correct access
        grantedElementsGrouped[compute_project_id] = _.groupBy(
            grantedElementsGrouped[compute_project_id],
            (item: ResourceValue | LimitValue) => {
                return (
                    new Date(item.start).valueOf().toString() +
                    "-" +
                    new Date(item.end).valueOf().toString()
                );
            }
        );
    });

    const emptyComputeProjects: ComputeProject[] = computeProjects.filter(
        (cp: ComputeProject) =>
            !_.keys(grantedElementsGrouped).includes(cp.compute_project_id)
    );

    function editComputeProject(computeProjectId: string) {
        const cpList: ComputeProject[] = computeProjects.filter(
            (cp: ComputeProject) => cp.compute_project_id === computeProjectId
        );
        if (cpList.length > 0) {
            setWorkingComputeProject(cpList[0]);
        }
        setIsNewComputeProject(false);
        setShowComputeProjectEditDialog(true);
    }

    React.useEffect(() => {
        let cancelled: boolean = false;

        const fetchUsage = async () => {
            try {
                const calls: Promise<{
                    computeProjectId: string;
                    usage:
                        | {
                              resource_id: string;
                              phases: {
                                  start: string;
                                  end: string;
                                  value: number;
                                  max: number;
                              }[];
                          }[]
                        | null;
                }>[] = _.keys(grantedElementsGrouped).map(
                    (computeProjectId: string) =>
                        getUsage(projectId, computeProjectId).then(
                            (
                                usage:
                                    | {
                                          resource_id: string;
                                          phases: {
                                              start: string;
                                              end: string;
                                              value: number;
                                              max: number;
                                          }[];
                                      }[]
                                    | null
                            ) => ({
                                computeProjectId,
                                usage,
                            })
                        )
                );
                const results: {
                    computeProjectId: string;
                    usage:
                        | {
                              resource_id: string;
                              phases: {
                                  start: string;
                                  end: string;
                                  value: number;
                                  max: number;
                              }[];
                          }[]
                        | null;
                }[] = await Promise.all(calls);
                if (!cancelled) {
                    results.forEach(
                        (data: {
                            computeProjectId: string;
                            usage:
                                | {
                                      resource_id: string;
                                      phases: {
                                          start: string;
                                          end: string;
                                          value: number;
                                          max: number;
                                      }[];
                                  }[]
                                | null;
                        }) => {
                            usageInformation[data.computeProjectId] =
                                data.usage;
                        }
                    );
                    setUsageInformation(
                        JSON.parse(JSON.stringify(usageInformation))
                    );
                }
            } catch (e) {
                /* empty */
            }
        };

        fetchUsage().then();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <>
            {_.keys(grantedElementsGrouped).map((computeProjectId: string) => {
                if (
                    !computeProjects
                        .map((cp) => cp.compute_project_id)
                        .includes(computeProjectId)
                ) {
                    return (
                        <React.Fragment key={computeProjectId}></React.Fragment>
                    );
                }
                return (
                    <ComputeProjectCard
                        key={computeProjectId}
                        projectId={projectId}
                        computeProjectId={computeProjectId}
                        clusters={clusters}
                        resources={resources}
                        limits={limits}
                        priorities={priorities}
                        grantedResources={grantedResources}
                        grantedLimits={grantedLimits}
                        usageInformation={usageInformation}
                        onResourceBlock={onResourceBlock}
                        onResourceUnblock={onResourceUnblock}
                        onResourceOverwriteAdd={onResourceOverwriteAdd}
                        onResourceOverwriteEdit={onResourceOverwriteEdit}
                        onLimitOverwriteAdd={onLimitOverwriteAdd}
                        onLimitOverwriteEdit={onLimitOverwriteEdit}
                        showOverrideActions={showOverrideActions}
                        onEdit={() => editComputeProject(computeProjectId)}
                    />
                );
            })}
            {emptyComputeProjects.map((computeProject: ComputeProject) => {
                return (
                    <ComputeProjectCard
                        key={computeProject.compute_project_id}
                        projectId={projectId}
                        computeProjectId={computeProject.compute_project_id}
                        clusters={clusters}
                        resources={resources}
                        limits={limits}
                        priorities={priorities}
                        grantedResources={grantedResources}
                        grantedLimits={grantedLimits}
                        usageInformation={usageInformation}
                        onResourceBlock={onResourceBlock}
                        onResourceUnblock={onResourceUnblock}
                        onResourceOverwriteAdd={onResourceOverwriteAdd}
                        onResourceOverwriteEdit={onResourceOverwriteEdit}
                        onLimitOverwriteAdd={onLimitOverwriteAdd}
                        onLimitOverwriteEdit={onLimitOverwriteEdit}
                        showOverrideActions={showOverrideActions}
                        onEdit={() =>
                            editComputeProject(
                                computeProject.compute_project_id
                            )
                        }
                    />
                );
            })}
            {showOverrideActions ? (
                <>
                    <Box sx={{ my: 3, textAlign: "right" }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                setWorkingComputeProject({
                                    _id: null,
                                    files: {},
                                    file_tags: {},
                                    compute_project_id: "",
                                    member_ids: [],
                                    custom_fields: { "": "" },
                                });
                                setIsNewComputeProject(true);
                                setShowComputeProjectEditDialog(true);
                            }}
                        >
                            Add new compute project
                        </Button>
                    </Box>
                    <EditComputeProject
                        computeProject={workingComputeProject}
                        computeProjectElements={
                            workingComputeProject.compute_project_id === "" ||
                            grantedElementsGrouped[
                                workingComputeProject.compute_project_id
                            ] === undefined
                                ? {}
                                : (grantedElementsGrouped[
                                      workingComputeProject.compute_project_id
                                  ] as unknown as {
                                      [key: string]: (
                                          | ResourceValue
                                          | LimitValue
                                      )[];
                                  })
                        }
                        grantedResources={grantedResources}
                        grantedLimits={grantedLimits}
                        isNewComputeProject={isNewComputeProject}
                        existingComputeProjects={computeProjects}
                        clusters={clusters}
                        resources={resources}
                        limits={limits}
                        onEdit={(
                            computeProject: ComputeProject,
                            resourceChanges: {
                                phase: string;
                                resourceId: string;
                                value: number;
                            }[],
                            limitChanges: {
                                phase: string;
                                limitId: string;
                                value: number;
                            }[]
                        ) => {
                            onComputeProjectEdit(
                                computeProject,
                                isNewComputeProject,
                                resourceChanges,
                                limitChanges
                            );
                        }}
                        showDialog={showComputeProjectEditDialog}
                        setShowDialog={setShowComputeProjectEditDialog}
                    />
                </>
            ) : (
                ""
            )}
        </>
    );
}
