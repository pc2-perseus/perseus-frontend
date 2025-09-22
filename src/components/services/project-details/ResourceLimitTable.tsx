// React imports
import React from "react";

// MUI imports
import {
    Card,
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

// Other imports
import _ from "lodash";
import Cluster from "../../../interfaces/Cluster.ts";
import Resource from "../../../interfaces/Resource.ts";
import Limit from "../../../interfaces/Limit.ts";
import formatNumber from "../../../utils/formatNumber.ts";
import EditResources from "./EditResources.tsx";
import checkServicePermission from "../../../api/checkServicePermission.ts";

function ResourceRow({
    resource,
    cluster,
    requestedResourceValue,
    grantedResourceValue,
}: {
    resource: Resource | undefined;
    cluster: Cluster | undefined;
    requestedResourceValue: ResourceValue | undefined;
    grantedResourceValue: ResourceValue | undefined;
}): React.ReactElement {
    let resourceName: string = "";
    if (resource !== undefined) {
        resourceName = resource.name;
    } else if (requestedResourceValue !== undefined) {
        resourceName = requestedResourceValue.resource_id;
    } else if (grantedResourceValue !== undefined) {
        resourceName = grantedResourceValue.resource_id;
    }

    const requestedValue: string = formatNumber(
        (requestedResourceValue !== undefined
            ? requestedResourceValue.value
            : 0) /
            (resource?.display_unit_factor !== undefined
                ? resource?.display_unit_factor
                : 1)
    );

    const grantedValue: string = formatNumber(
        (grantedResourceValue !== undefined ? grantedResourceValue.value : 0) /
            (resource?.display_unit_factor !== undefined
                ? resource?.display_unit_factor
                : 1)
    );

    const unit: string =
        resource?.display_unit === null || resource?.display_unit === undefined
            ? ""
            : " " + resource?.display_unit;

    return (
        <TableRow
            sx={{
                "&:last-child td": {
                    borderBottom: 0,
                },
            }}
        >
            <TableCell>{resourceName}</TableCell>
            <TableCell>
                {cluster !== undefined ? cluster.name : <i>unknown</i>}
            </TableCell>
            <TableCell>
                {requestedValue}
                {unit}
            </TableCell>
            <TableCell>
                {grantedValue}
                {unit}
            </TableCell>
        </TableRow>
    );
}

function LimitRow({
    limit,
    requestedLimitValue,
    grantedLimitValue,
}: {
    limit: Limit | undefined;
    requestedLimitValue: LimitValue;
    grantedLimitValue: LimitValue;
}): React.ReactElement {
    let limitName: string = "";
    if (limit !== undefined) {
        limitName = limit.name;
    } else if (requestedLimitValue !== undefined) {
        limitName = requestedLimitValue.limit_id;
    } else if (grantedLimitValue !== undefined) {
        limitName = grantedLimitValue.limit_id;
    }

    const requestedValue: string = formatNumber(
        (requestedLimitValue !== undefined ? requestedLimitValue.value : 0) /
            (limit?.display_unit_factor !== undefined
                ? limit?.display_unit_factor
                : 1)
    );

    const grantedValue: string = formatNumber(
        (grantedLimitValue !== undefined ? grantedLimitValue.value : 0) /
            (limit?.display_unit_factor !== undefined
                ? limit?.display_unit_factor
                : 1)
    );

    const unit: string =
        limit?.display_unit === null || limit?.display_unit === undefined
            ? ""
            : " " + limit?.display_unit;

    return (
        <TableRow
            sx={{
                "&:last-child td": {
                    borderBottom: 0,
                },
            }}
        >
            <TableCell>{limitName}</TableCell>
            <TableCell />
            <TableCell>
                {requestedValue}
                {unit}
            </TableCell>
            <TableCell>
                {grantedValue}
                {unit}
            </TableCell>
        </TableRow>
    );
}

function PhaseRow({
    phase,
    requestedResources,
    grantedResources,
    requestedLimits,
    grantedLimits,
    isLast,
    clusters,
    resources,
    limits,
}: {
    phase: string;
    requestedResources: ResourceValue[];
    grantedResources: ResourceValue[];
    requestedLimits: LimitValue[];
    grantedLimits: LimitValue[];
    isLast: boolean;
    clusters: Cluster[];
    resources: Resource[];
    limits: Limit[];
}): React.ReactElement {
    const phaseSplit: string[] = phase.split("-");
    const [showPhase, setShowPhase] = React.useState<boolean>(false);

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

    resources.sort((r1: Resource, r2: Resource): number => {
        let c1: Cluster | undefined = undefined;
        let c2: Cluster | undefined = undefined;

        try {
            c1 = clusters.filter((c) => c.id === r1.cluster_id)[0];
        } catch {
            /* empty */
        }
        try {
            c2 = clusters.filter((c) => c.id === r2.cluster_id)[0];
        } catch {
            /* empty */
        }

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
            return r1.name.localeCompare(r2.name);
        }
    });

    limits.sort((l1: Limit, l2: Limit) => l1.name.localeCompare(l2.name));

    const resourceRowData: {
        requested: ResourceValue;
        granted: ResourceValue;
    }[] = [];

    const limitRowData: {
        requested: LimitValue;
        granted: LimitValue;
    }[] = [];

    resources.forEach((resource: Resource) => {
        const requested: ResourceValue = {
            _id: null,
            files: {},
            file_tags: {},
            resource_id: resource.id,
            value: 0,
            start: "",
            end: "",
            compute_project_id: null,
            partitions: [],
            blocked: false,
            priority: 0,
            overwrites: [],
        };
        const granted: ResourceValue = {
            _id: null,
            files: {},
            file_tags: {},
            resource_id: resource.id,
            value: 0,
            start: "",
            end: "",
            compute_project_id: null,
            partitions: [],
            blocked: false,
            priority: 0,
            overwrites: [],
        };

        requestedResources
            .filter((rv) => rv.resource_id === resource.id)
            .forEach((rv: ResourceValue) => {
                requested.value += rv.value;
            });

        grantedResources
            .filter((rv) => rv.resource_id === resource.id)
            .forEach((rv: ResourceValue) => {
                granted.value += rv.value;
            });

        if (requested.value !== 0 || granted.value !== 0) {
            resourceRowData.push({
                requested: requested,
                granted: granted,
            });
        }
    });

    limits.forEach((limit: Limit) => {
        const requested: LimitValue = {
            _id: null,
            files: {},
            file_tags: {},
            limit_id: limit.id,
            value: 0,
            start: "",
            end: "",
            compute_project_id: null,
            affected_users: null,
            overwrites: [],
        };
        const granted: LimitValue = {
            _id: null,
            files: {},
            file_tags: {},
            limit_id: limit.id,
            value: 0,
            start: "",
            end: "",
            compute_project_id: null,
            affected_users: null,
            overwrites: [],
        };

        requestedLimits
            .filter((lv) => lv.limit_id === limit.id)
            .forEach((lv: LimitValue) => {
                requested.value += lv.value;
            });

        grantedLimits
            .filter((lv) => lv.limit_id === limit.id)
            .forEach((lv: LimitValue) => {
                granted.value += lv.value;
            });

        if (requested.value !== 0 || granted.value !== 0) {
            limitRowData.push({
                requested: requested,
                granted: granted,
            });
        }
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
                                        <TableCell>Resource / Limit</TableCell>
                                        <TableCell>Cluster</TableCell>
                                        <TableCell>Requested</TableCell>
                                        <TableCell>Granted</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {resourceRowData.map(
                                        (
                                            item: {
                                                requested: ResourceValue;
                                                granted: ResourceValue;
                                            },
                                            index2: number
                                        ) => {
                                            return (
                                                <ResourceRow
                                                    resource={resourceMatch(
                                                        item.requested
                                                    )}
                                                    cluster={clusterMatch(
                                                        item.requested
                                                    )}
                                                    requestedResourceValue={
                                                        item.requested
                                                    }
                                                    grantedResourceValue={
                                                        item.granted
                                                    }
                                                    key={index2}
                                                />
                                            );
                                        }
                                    )}
                                    {resourceRowData.length > 0 &&
                                    limitRowData.length > 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} />
                                        </TableRow>
                                    ) : (
                                        ""
                                    )}
                                    {limitRowData.map(
                                        (
                                            item: {
                                                requested: LimitValue;
                                                granted: LimitValue;
                                            },
                                            index2: number
                                        ) => {
                                            return (
                                                <LimitRow
                                                    limit={limitMatch(
                                                        item.requested
                                                    )}
                                                    requestedLimitValue={
                                                        item.requested
                                                    }
                                                    grantedLimitValue={
                                                        item.granted
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

export default function ResourceLimitTable({
    projectId,
    requestedResources,
    grantedResources,
    requestedLimits,
    grantedLimits,
    clusters,
    resources,
    limits,
}: {
    projectId: string;
    requestedResources: ResourceValue[];
    grantedResources: ResourceValue[];
    requestedLimits: LimitValue[];
    grantedLimits: LimitValue[];
    clusters: Cluster[];
    resources: Resource[];
    limits: Limit[];
}): React.ReactElement {
    const [showResourceEditAction, setShowResourceEditAction] =
        React.useState<boolean>(false);
    const phases: {
        [key: string]: {
            requestedResources: ResourceValue[];
            grantedResources: ResourceValue[];
            requestedLimits: LimitValue[];
            grantedLimits: LimitValue[];
        };
    } = {};

    [...requestedResources, ...requestedLimits].forEach(
        (item: ResourceValue | LimitValue) => {
            const phase =
                new Date(item.start).valueOf().toString() +
                "-" +
                new Date(item.end).valueOf().toString();
            if (!(phase in phases)) {
                phases[phase] = {
                    requestedResources: [],
                    grantedResources: [],
                    requestedLimits: [],
                    grantedLimits: [],
                };
            }
            if ("resource_id" in item) {
                phases[phase].requestedResources.push(item);
            } else if ("limit_id" in item) {
                phases[phase].requestedLimits.push(item);
            }
        }
    );

    [...grantedResources, ...grantedLimits].forEach(
        (item: ResourceValue | LimitValue) => {
            const phase =
                new Date(item.start).valueOf().toString() +
                "-" +
                new Date(item.end).valueOf().toString();
            if (!(phase in phases)) {
                phases[phase] = {
                    requestedResources: [],
                    grantedResources: [],
                    requestedLimits: [],
                    grantedLimits: [],
                };
            }
            if ("resource_id" in item) {
                phases[phase].grantedResources.push(item);
            } else if ("limit_id" in item) {
                phases[phase].grantedLimits.push(item);
            }
        }
    );

    React.useEffect(() => {
        checkServicePermission("GrantedResourceChanges").then(
            (result: boolean) => {
                setShowResourceEditAction(result);
            }
        );
    });

    return (
        <Card variant="outlined" sx={{ my: 2 }}>
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
                                    All resources & limits
                                </Typography>
                            </TableCell>
                            <TableCell
                                sx={{
                                    borderBottom: "none",
                                    textAlign: "right",
                                }}
                            >
                                {showResourceEditAction &&
                                grantedResources.length > 0 ? (
                                    <EditResources
                                        projectId={projectId}
                                        resourceValues={grantedResources}
                                        resources={resources}
                                        clusters={clusters}
                                    />
                                ) : (
                                    ""
                                )}
                            </TableCell>
                        </TableRow>

                        {_.keys(phases).map((phase: string, index: number) => {
                            return (
                                <PhaseRow
                                    phase={phase}
                                    requestedResources={
                                        phases[phase].requestedResources
                                    }
                                    grantedResources={
                                        phases[phase].grantedResources
                                    }
                                    requestedLimits={
                                        phases[phase].requestedLimits
                                    }
                                    grantedLimits={phases[phase].grantedLimits}
                                    clusters={clusters}
                                    resources={resources}
                                    limits={limits}
                                    isLast={index + 1 >= _.keys(phases).length}
                                    key={index}
                                />
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    );
}
