// React imports
import React from "react";

// MUI imports
import {
    Collapse,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Theme,
    Typography,
    useTheme,
} from "@mui/material";

// Icon imports
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

// Custom imports
import ResourceValue from "../../../interfaces/ResourceValue.ts";
import LimitValue from "../../../interfaces/LimitValue.ts";
import Cluster from "../../../interfaces/Cluster.ts";
import Resource from "../../../interfaces/Resource.ts";
import Limit from "../../../interfaces/Limit.ts";
import ComputeProjectResourceRow from "./ComputeProjectResourceRow.tsx";
import ComputeProjectLimitRow from "./ComputeProjectLimitRow.tsx";
import ResourceValueOverwrite from "../../../interfaces/ResourceValueOverwrite.ts";
import LimitValueOverwrite from "../../../interfaces/LimitValueOverwrite.ts";
import ResourcePriority from "../../../interfaces/ResourcePriority.ts";

export default function ComputeProjectPhaseRow({
    phase,
    grantedResources,
    usedResources,
    grantedLimits,
    isLast,
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
    showOverrideActions,
}: {
    phase: string;
    grantedResources: ResourceValue[];
    usedResources:
        | { resourceId: string; value: number; max: number }[]
        | null
        | undefined;
    grantedLimits: LimitValue[];
    isLast: boolean;
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
    showOverrideActions: boolean;
}): React.ReactElement {
    const phaseSplit: string[] = phase.split("-");
    const [showPhase, setShowPhase] = React.useState<boolean>(
        new Date(Number(phaseSplit[0])).valueOf() <= Date.now() &&
            Date.now() <= new Date(Number(phaseSplit[1])).valueOf()
    );

    const theme: Theme = useTheme();

    function resourceMatch(resourceValue: ResourceValue): Resource | undefined {
        try {
            return resources.filter(
                (r) => r.id === resourceValue.resource_id
            )[0];
        } catch {
            return undefined;
        }
    }

    function clusterMatch(resourceValue: ResourceValue): Cluster | undefined {
        try {
            const r = resourceMatch(resourceValue);
            if (r === undefined) {
                return undefined;
            }
            return clusters.filter((c) => c.id === r.cluster_id)[0];
        } catch {
            return undefined;
        }
    }

    function limitMatch(limitValue: LimitValue): Limit | undefined {
        try {
            return limits.filter((l) => l.id === limitValue.limit_id)[0];
        } catch {
            return undefined;
        }
    }

    function displayResourceUsage(
        resourceId: string
    ): number | null | undefined {
        if (usedResources === undefined) {
            return undefined;
        } else if (usedResources === null) {
            return null;
        } else {
            let val: number | null = null;
            usedResources.forEach(
                (entry: { resourceId: string; value: number; max: number }) => {
                    if (resourceId === entry.resourceId) {
                        val = entry.value;
                    }
                }
            );
            return val;
        }
    }

    function displayMaxUsage(resourceId: string): number | null | undefined {
        if (usedResources === undefined) {
            return undefined;
        } else if (usedResources === null) {
            return null;
        } else {
            let val: number | null = null;
            usedResources.forEach(
                (entry: { resourceId: string; value: number; max: number }) => {
                    if (resourceId === entry.resourceId) {
                        val = entry.max;
                    }
                }
            );
            return val;
        }
    }

    grantedResources.sort((rv1: ResourceValue, rv2: ResourceValue): number => {
        const r1: Resource | undefined = resourceMatch(rv1);
        const r2: Resource | undefined = resourceMatch(rv2);
        const c1: Cluster | undefined = clusterMatch(rv1);
        const c2: Cluster | undefined = clusterMatch(rv2);
        if (c1 === undefined && c2 !== undefined) {
            return -1;
        } else if (c1 !== undefined && c2 === undefined) {
            return 1;
        } else {
            if (c1 !== undefined && c2 !== undefined) {
                const comp: number = c1.name.localeCompare(c2.name);
                if (comp !== 0) {
                    return comp;
                }
            }
            if (r1 === undefined && r2 !== undefined) {
                return -1;
            } else if (r1 !== undefined && r2 === undefined) {
                return 1;
            } else if (r1 !== undefined && r2 !== undefined) {
                return r1.name.localeCompare(r2.name);
            }
            return rv1.resource_id.localeCompare(rv2.resource_id);
        }
    });

    grantedLimits.sort((lv1: LimitValue, lv2: LimitValue): number => {
        const l1: Limit | undefined = limitMatch(lv1);
        const l2: Limit | undefined = limitMatch(lv2);

        if (l1 === undefined && l2 !== undefined) {
            return -1;
        } else if (l1 !== undefined && l2 === undefined) {
            return 1;
        } else if (l1 !== undefined && l2 !== undefined) {
            return l1.name.localeCompare(l2.name);
        }
        return lv1.limit_id.localeCompare(lv2.limit_id);
    });

    return (
        <>
            <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                <TableCell
                    sx={{
                        borderBottom: "none",
                    }}
                >
                    <Typography
                        variant="caption"
                        component="div"
                        sx={{
                            opacity: 0.6,
                            alignSelf: "flex-start",
                        }}
                    >
                        {new Date(Number(phaseSplit[0])).toUTCString()} -{" "}
                        {new Date(Number(phaseSplit[1])).toUTCString()}
                    </Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: "none" }}>
                    <IconButton
                        size="small"
                        onClick={() => setShowPhase(!showPhase)}
                        sx={{
                            float: "right",
                            height: "24px",
                            width: "24px",
                        }}
                    >
                        {showPhase ? (
                            <KeyboardArrowUpIcon />
                        ) : (
                            <KeyboardArrowDownIcon />
                        )}
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell
                    colSpan={2}
                    sx={{ p: 0, borderBottom: isLast ? "none" : undefined }}
                >
                    <Collapse in={showPhase}>
                        <TableContainer sx={{ width: "100%" }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell />
                                        <TableCell>Resource / Limit</TableCell>
                                        <TableCell>Cluster</TableCell>
                                        <TableCell>Priority</TableCell>
                                        <TableCell>Granted</TableCell>
                                        <TableCell>Used</TableCell>
                                        <TableCell />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {grantedResources.map(
                                        (
                                            resourceValue: ResourceValue,
                                            index2: number
                                        ) => {
                                            return (
                                                <ComputeProjectResourceRow
                                                    resource={resourceMatch(
                                                        resourceValue
                                                    )}
                                                    cluster={clusterMatch(
                                                        resourceValue
                                                    )}
                                                    priorities={priorities}
                                                    grantedResourceValue={
                                                        resourceValue
                                                    }
                                                    used={displayResourceUsage(
                                                        resourceValue.resource_id
                                                    )}
                                                    maxUsed={displayMaxUsage(
                                                        resourceValue.resource_id
                                                    )}
                                                    isLast={
                                                        index2 + 1 >=
                                                            grantedResources.length &&
                                                        grantedLimits.length ===
                                                            0
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
                                                    showOverrideActions={
                                                        showOverrideActions
                                                    }
                                                    key={index2}
                                                />
                                            );
                                        }
                                    )}
                                    {grantedResources.length > 0 &&
                                    grantedLimits.length > 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} />
                                        </TableRow>
                                    ) : (
                                        ""
                                    )}
                                    {grantedLimits.map(
                                        (
                                            limitValue: LimitValue,
                                            index2: number
                                        ) => {
                                            return (
                                                <ComputeProjectLimitRow
                                                    limit={limitMatch(
                                                        limitValue
                                                    )}
                                                    grantedLimitValue={
                                                        limitValue
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
                                                    isLast={
                                                        index2 + 1 >=
                                                        grantedLimits.length
                                                    }
                                                    key={index2}
                                                />
                                            );
                                        }
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}
