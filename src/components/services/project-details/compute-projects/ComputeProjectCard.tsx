import React from "react";
import {
    Box,
    Button,
    Card,
    Fab,
    Fade,
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
import EditIcon from "@mui/icons-material/Edit";
import _ from "lodash";
import ResourceValue from "../../../../interfaces/ResourceValue.ts";
import LimitValue from "../../../../interfaces/LimitValue.ts";
import ComputeProjectPhaseRow from "./ComputeProjectPhaseRow.tsx";
import ComputeProjectRightBar from "./ComputeProjectRightBar.tsx";
import Resource from "../../../../interfaces/Resource.ts";
import Cluster from "../../../../interfaces/Cluster.ts";
import Limit from "../../../../interfaces/Limit.ts";
import ResourcePriority from "../../../../interfaces/ResourcePriority.ts";
import ResourceValueOverwrite from "../../../../interfaces/ResourceValueOverwrite.ts";
import LimitValueOverwrite from "../../../../interfaces/LimitValueOverwrite.ts";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function ComputeProjectCard({
    projectId,
    computeProjectId,
    clusters,
    resources,
    limits,
    priorities,
    grantedResources,
    grantedLimits,
    usageInformation,
    onResourceBlock,
    onResourceUnblock,
    onResourceOverwriteAdd,
    onResourceOverwriteEdit,
    onLimitOverwriteAdd,
    onLimitOverwriteEdit,
    showOverrideActions,
    onEdit,
}: {
    projectId: string;
    computeProjectId: string;
    clusters: Cluster[];
    resources: Resource[];
    limits: Limit[];
    priorities: ResourcePriority[];
    grantedResources: ResourceValue[];
    grantedLimits: LimitValue[];
    usageInformation: {
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
    };
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
    showOverrideActions: boolean;
    onEdit: () => void;
}): React.ReactElement {
    const [showScrollButton, setShowScrollButton] =
        React.useState<boolean>(false);
    const scrollRef = React.useRef<HTMLDivElement | null>(null);

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

    const checkScrollState = () => {
        const el = scrollRef.current;
        if (!el) return;

        const canScroll = el.scrollHeight > el.clientHeight;
        const isAtBottom =
            el.scrollHeight - el.scrollTop <= el.clientHeight + 10;

        setShowScrollButton(canScroll && !isAtBottom);
    };

    function scrollToBottom() {
        const el = scrollRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }

    React.useEffect(() => {
        checkScrollState();
        const el = scrollRef.current;
        if (!el) return;

        el.addEventListener("scroll", checkScrollState);
        const resizeObserver = new ResizeObserver(checkScrollState);
        resizeObserver.observe(el);

        return () => {
            el.removeEventListener("scroll", checkScrollState);
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <Card
            variant="outlined"
            sx={{
                my: 2,
                maxHeight: "600px",
                display: "flex",
                alignItems: "stretch",
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    position: "relative",
                    maxHeight: "600px",
                    flexGrow: 1,
                    flexShrink: 1,
                    minWidth: 0,
                }}
            >
                <TableContainer
                    ref={scrollRef}
                    sx={{
                        position: "relative",
                        maxHeight: "600px",
                        overflowX: "hidden",
                        overflowY: "scroll",
                        scrollbarWidth: "none",
                    }}
                >
                    <Table
                        sx={{
                            width: "100%",
                            maxHeight: "100%",
                        }}
                        size="small"
                        stickyHeader
                    >
                        <TableHead>
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
                                    <Tooltip title="Edit" placement="top">
                                        <Button
                                            size="small"
                                            sx={{
                                                minWidth: "2.25em",
                                                maxWidth: "2.25em",
                                            }}
                                            onClick={onEdit}
                                        >
                                            <EditIcon fontSize="small" />
                                        </Button>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {_.keys(grantedElementsGrouped[computeProjectId])
                                .length === 0 && (
                                <TableRow
                                    sx={{
                                        backgroundColor:
                                            theme.palette.action.hover,
                                    }}
                                >
                                    <TableCell
                                        sx={{
                                            borderBottom: "none",
                                            height: "110px",
                                        }}
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
                            )}

                            {_.keys(
                                grantedElementsGrouped[computeProjectId]
                            ).map((phase: string, index: number) => {
                                const data: (ResourceValue | LimitValue)[] = (
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
                                                (item) => "resource_id" in item
                                            ) as ResourceValue[]
                                        }
                                        usedResources={phaseUsageInformation(
                                            computeProjectId,
                                            phase
                                        )}
                                        grantedLimits={
                                            data.filter(
                                                (item) => "limit_id" in item
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
                                        onResourceBlock={onResourceBlock}
                                        onResourceUnblock={onResourceUnblock}
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
                <Fade in={showScrollButton}>
                    <Fab
                        size="small"
                        onClick={scrollToBottom}
                        sx={{
                            position: "absolute",
                            bottom: "10px",
                            right: "10px",
                            boxShadow: 3,
                            backgroundColor:
                                theme.palette.mode === "dark"
                                    ? theme.palette.grey[500]
                                    : theme.palette.grey[300],
                        }}
                    >
                        <KeyboardArrowDownIcon />
                    </Fab>
                </Fade>
            </Box>

            <ComputeProjectRightBar
                projectId={projectId}
                computeProjectId={computeProjectId}
                clusters={clusters}
                resources={resources}
                grantedResources={grantedResources}
            />
        </Card>
    );
}
