// React imports
import React from "react";

// MUI imports
import {
    Box,
    Button,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Theme,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";

// Icon imports
import EditIcon from "@mui/icons-material/Edit";
import WorkIcon from "@mui/icons-material/Work";
import CloseIcon from "@mui/icons-material/Close";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

// Custom imports
import ComputeProject from "../../../interfaces/ComputeProject.ts";
import ResourceValue from "../../../interfaces/ResourceValue.ts";
import LimitValue from "../../../interfaces/LimitValue.ts";
import Cluster from "../../../interfaces/Cluster.ts";
import Resource from "../../../interfaces/Resource.ts";
import Limit from "../../../interfaces/Limit.ts";
import ComputeProjectPhaseRow from "./ComputeProjectPhaseRow.tsx";
import ResourceValueOverwrite from "../../../interfaces/ResourceValueOverwrite.ts";
import LimitValueOverwrite from "../../../interfaces/LimitValueOverwrite.ts";
import EditComputeProject from "./EditComputeProject.tsx";

// Other imports
import _ from "lodash";
import getUsage from "../../../api/project-details/getUsage.ts";
import UsageChart from "./UsageChart.tsx";
import ResourcePriority from "../../../interfaces/ResourcePriority.ts";

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
    const leftRefs = React.useRef<{
        [key: string]: HTMLDivElement | null;
    }>({});
    const observers = React.useRef<{ [key: string]: ResizeObserver }>({});

    const [leftHeights, setLeftHeights] = React.useState<{
        [key: string]: number;
    }>({});
    const [showRight, setShowRight] = React.useState<{
        [key: string]: string | null;
    }>({});
    const [showComputeProjectEditDialog, setShowComputeProjectEditDialog] =
        React.useState<boolean>(false);
    const [isNewComputeProject, setIsNewComputeProject] =
        React.useState<boolean>(true);
    const [workingComputeProject, setWorkingComputeProject] =
        React.useState<ComputeProject>({
            _id: null,
            files: {},
            file_tags: {},
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

    const theme: Theme = useTheme();

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

    function getRightContent(computeProjectId: string): string | null {
        if (computeProjectId in showRight) {
            return showRight[computeProjectId];
        }
        return null;
    }

    function showJobList(computeProjectId: string) {
        showRight[computeProjectId] = "jobs";
        setShowRight(JSON.parse(JSON.stringify(showRight)));
    }

    function showUsageChart(computeProjectId: string) {
        showRight[computeProjectId] = "usage-chart";
        setShowRight(JSON.parse(JSON.stringify(showRight)));
    }

    function hideRight(computeProjectId: string) {
        showRight[computeProjectId] = null;
        setShowRight(JSON.parse(JSON.stringify(showRight)));
    }

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

    function phaseUsageInformation(
        computeProjectId: string,
        phase: string
    ):
        | {
              resourceId: string;
              value: number;
              max: number;
          }[]
        | null
        | undefined {
        let information:
            | {
                  resourceId: string;
                  value: number;
                  max: number;
              }[]
            | null
            | undefined = undefined;

        if (computeProjectId in usageInformation) {
            if (usageInformation[computeProjectId] === null) {
                information = null;
            } else {
                information = [];
                usageInformation[computeProjectId]?.forEach(
                    (entry: {
                        resource_id: string;
                        phases: {
                            start: string;
                            end: string;
                            value: number;
                            max: number;
                        }[];
                    }) => {
                        entry.phases.forEach(
                            (usagePhase: {
                                start: string;
                                end: string;
                                value: number;
                                max: number;
                            }) => {
                                if (
                                    phase ===
                                    new Date(usagePhase.start)
                                        .valueOf()
                                        .toString() +
                                        "-" +
                                        new Date(usagePhase.end)
                                            .valueOf()
                                            .toString()
                                ) {
                                    information?.push({
                                        resourceId: entry.resource_id,
                                        value: usagePhase.value,
                                        max: usagePhase.max,
                                    });
                                }
                            }
                        );
                    }
                );
            }
        }

        return information;
    }

    React.useEffect(() => {
        _.keys(grantedElementsGrouped).forEach((computeProjectId: string) => {
            const el = leftRefs.current[computeProjectId];
            if (!el) return;

            const observer = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const newHeight = entry.contentRect.height;
                    setLeftHeights((prev) => ({
                        ...prev,
                        [computeProjectId]: newHeight,
                    }));
                }
            });

            observer.observe(el);
            observers.current[computeProjectId] = observer;
        });

        return () => {
            // Clean up observers on unmount
            Object.values(observers.current).forEach((observer) =>
                observer.disconnect()
            );
        };
    }, []);

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
                    <Card
                        variant="outlined"
                        sx={{
                            my: 2,
                            display: "flex",
                        }}
                        key={computeProjectId}
                    >
                        <TableContainer
                            sx={{ overflowX: "hidden", overflowY: "auto" }}
                        >
                            <Table
                                sx={{ width: "100%" }}
                                size="small"
                                ref={(element) =>
                                    (leftRefs.current[computeProjectId] =
                                        element)
                                }
                            >
                                <TableBody>
                                    <TableRow>
                                        <TableCell
                                            sx={{
                                                borderBottom: "none",
                                            }}
                                        >
                                            <Typography variant="h5">
                                                Compute project{" "}
                                                <i>{computeProjectId}</i>
                                            </Typography>
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                borderBottom: "none",
                                                textAlign: "right",
                                            }}
                                        >
                                            <Tooltip
                                                title="Edit"
                                                placement="top"
                                            >
                                                <Button
                                                    size="small"
                                                    sx={{
                                                        minWidth: "2.25em",
                                                        maxWidth: "2.25em",
                                                    }}
                                                    onClick={() => {
                                                        editComputeProject(
                                                            computeProjectId
                                                        );
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </Button>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>

                                    {_.keys(
                                        grantedElementsGrouped[computeProjectId]
                                    ).map((phase: string, index: number) => {
                                        const data: (
                                            | ResourceValue
                                            | LimitValue
                                        )[] = (
                                            grantedElementsGrouped[
                                                computeProjectId
                                            ] as unknown as {
                                                [key: string]: (
                                                    | ResourceValue
                                                    | LimitValue
                                                )[];
                                            }
                                        )[phase];

                                        return (
                                            <ComputeProjectPhaseRow
                                                phase={phase}
                                                grantedResources={
                                                    data.filter(
                                                        (item) =>
                                                            "resource_id" in
                                                            item
                                                    ) as ResourceValue[]
                                                }
                                                usedResources={phaseUsageInformation(
                                                    computeProjectId,
                                                    phase
                                                )}
                                                grantedLimits={
                                                    data.filter(
                                                        (item) =>
                                                            "limit_id" in item
                                                    ) as LimitValue[]
                                                }
                                                clusters={clusters}
                                                resources={resources}
                                                limits={limits}
                                                priorities={priorities}
                                                isLast={
                                                    index + 1 >=
                                                    _.keys(
                                                        grantedElementsGrouped[
                                                            computeProjectId
                                                        ]
                                                    ).length
                                                }
                                                onResourceBlock={
                                                    onResourceBlock
                                                }
                                                onResourceUnblock={
                                                    onResourceUnblock
                                                }
                                                onResourceOverwriteAdd={
                                                    onResourceOverwriteAdd
                                                }
                                                onResourceOverwriteEdit={
                                                    onResourceOverwriteEdit
                                                }
                                                onLimitOverwriteAdd={
                                                    onLimitOverwriteAdd
                                                }
                                                onLimitOverwriteEdit={
                                                    onLimitOverwriteEdit
                                                }
                                                showOverrideActions={
                                                    showOverrideActions
                                                }
                                                key={index}
                                            />
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Box
                            sx={{
                                borderLeftWidth: "1px",
                                borderLeftStyle: "solid",
                                borderLeftColor: theme.palette.divider,
                                minWidth:
                                    getRightContent(computeProjectId) !== null
                                        ? "650px"
                                        : "2.75em",
                                maxWidth:
                                    getRightContent(computeProjectId) !== null
                                        ? undefined
                                        : "2.75em",
                                minHeight:
                                    getRightContent(computeProjectId) ===
                                    "usage-chart"
                                        ? "300px"
                                        : undefined,
                                maxHeight:
                                    computeProjectId in leftHeights
                                        ? leftHeights[
                                              computeProjectId
                                          ].toString() + "px"
                                        : 0,
                                overflowY: "scroll",
                                scrollbarWidth: "none",
                            }}
                        >
                            {getRightContent(computeProjectId) === null ? (
                                <Box sx={{ textAlign: "center", mt: 1 }}>
                                    <Tooltip title="Show jobs" placement="left">
                                        <Button
                                            size="small"
                                            sx={{
                                                minWidth: "2.25em",
                                                maxWidth: "2.25em",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => {
                                                showJobList(computeProjectId);
                                            }}
                                        >
                                            <WorkIcon />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip
                                        title="Show usage chart"
                                        placement="left"
                                    >
                                        <Button
                                            size="small"
                                            sx={{
                                                minWidth: "2.25em",
                                                maxWidth: "2.25em",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => {
                                                showUsageChart(
                                                    computeProjectId
                                                );
                                            }}
                                        >
                                            <TrendingUpIcon />
                                        </Button>
                                    </Tooltip>
                                </Box>
                            ) : (
                                ""
                            )}
                            {getRightContent(computeProjectId) === "jobs" ? (
                                <TableContainer>
                                    <Table sx={{ width: "100%" }} size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell
                                                    sx={{
                                                        pl: 1,
                                                        pr: 0,
                                                    }}
                                                >
                                                    <Tooltip
                                                        title={
                                                            getRightContent(
                                                                computeProjectId
                                                            ) === "jobs"
                                                                ? "Hide jobs"
                                                                : "Show jobs"
                                                        }
                                                        placement="top"
                                                    >
                                                        <Button
                                                            size="small"
                                                            sx={{
                                                                minWidth:
                                                                    "2.25em",
                                                                maxWidth:
                                                                    "2.25em",
                                                                cursor: "pointer",
                                                            }}
                                                            onClick={() => {
                                                                hideRight(
                                                                    computeProjectId
                                                                );
                                                            }}
                                                        >
                                                            <CloseIcon fontSize="small" />
                                                        </Button>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell>Job ID</TableCell>
                                                <TableCell>Cluster</TableCell>
                                                <TableCell>User</TableCell>
                                                <TableCell>Start</TableCell>
                                                <TableCell>State</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableCell
                                                colSpan={6}
                                                sx={{ textAlign: "center" }}
                                            >
                                                <i>coming soon</i>
                                            </TableCell>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                ""
                            )}
                            {getRightContent(computeProjectId) ===
                            "usage-chart" ? (
                                <Box
                                    sx={{
                                        position: "relative",
                                        overflow: "hidden",
                                        pt: "1.5em",
                                        height:
                                            computeProjectId in leftHeights
                                                ? Math.max(
                                                      300,
                                                      leftHeights[
                                                          computeProjectId
                                                      ]
                                                  ).toString() + "px"
                                                : 0,
                                    }}
                                >
                                    <Button
                                        size="small"
                                        sx={{
                                            minWidth: "2.25em",
                                            maxWidth: "2.25em",
                                            cursor: "pointer",
                                            position: "absolute",
                                            ml: "0.5em",
                                            mt: "-1.5em",
                                            zIndex: 10,
                                        }}
                                        onClick={() => {
                                            hideRight(computeProjectId);
                                        }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </Button>
                                    <UsageChart
                                        projectId={projectId}
                                        computeProjectId={computeProjectId}
                                        resources={resources}
                                        clusters={clusters}
                                    />
                                </Box>
                            ) : (
                                ""
                            )}
                        </Box>
                    </Card>
                );
            })}
            {emptyComputeProjects.map((computeProject: ComputeProject) => {
                return (
                    <Card
                        variant="outlined"
                        sx={{ my: 2 }}
                        key={computeProject.compute_project_id}
                    >
                        <TableContainer>
                            <Table sx={{ width: "100%" }} size="small">
                                <TableBody>
                                    <TableRow>
                                        <TableCell
                                            sx={{
                                                borderBottom: "none",
                                            }}
                                        >
                                            <Typography variant="h5">
                                                Compute project{" "}
                                                <i>
                                                    {
                                                        computeProject.compute_project_id
                                                    }
                                                </i>
                                            </Typography>
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                borderBottom: "none",
                                                textAlign: "right",
                                            }}
                                        >
                                            <Tooltip
                                                title="Edit"
                                                placement="top"
                                            >
                                                <Button
                                                    size="small"
                                                    sx={{
                                                        minWidth: "2.25em",
                                                        maxWidth: "2.25em",
                                                    }}
                                                    onClick={() => {
                                                        editComputeProject(
                                                            computeProject.compute_project_id
                                                        );
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </Button>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow
                                        sx={{
                                            backgroundColor:
                                                theme.palette.action.hover,
                                        }}
                                    >
                                        <TableCell
                                            sx={{ borderBottom: "none" }}
                                            colSpan={2}
                                        >
                                            <Typography
                                                variant="caption"
                                                component="div"
                                                sx={{
                                                    opacity: 0.6,
                                                    alignSelf: "flex-start",
                                                }}
                                            >
                                                no data available
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
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
