import React from "react";
import _ from "lodash";
import {
    Box,
    Divider,
    Grid,
    InputAdornment,
    TextField,
    Theme,
    Typography,
    useTheme,
} from "@mui/material";
import ResourceValue from "../../../../interfaces/ResourceValue.ts";
import LimitValue from "../../../../interfaces/LimitValue.ts";
import Resource from "../../../../interfaces/Resource.ts";
import Cluster from "../../../../interfaces/Cluster.ts";
import DecimalTextField from "../../../DecimalTextField.tsx";
import {
    scaledDecimalInputToNumber,
    scaledValueToDecimalString,
} from "../../../../utils/decimalUnits.ts";

export default function EditComputeProjectResources({
    computeProjectId,
    elements,
    clusters,
    resources,
    grantedResources,
    resourceChanges,
    updateResourceChanges,
}: {
    computeProjectId: string;
    elements: { [key: string]: (ResourceValue | LimitValue)[] };
    clusters: Cluster[];
    resources: Resource[];
    grantedResources: ResourceValue[];
    resourceChanges: { phase: string; resourceId: string; value: number }[];
    updateResourceChanges: React.Dispatch<
        React.SetStateAction<
            { phase: string; resourceId: string; value: number }[]
        >
    >;
}): React.ReactElement {
    const theme: Theme = useTheme();

    function sortResourceValues(
        rv1: ResourceValue,
        rv2: ResourceValue
    ): number {
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

    function resourceMatch(resourceValue: ResourceValue): Resource | undefined {
        try {
            return resources.filter(
                (r) => r.id === resourceValue.resource_id
            )[0];
        } catch {
            return undefined;
        }
    }

    function unassignedResources(phase: string): ResourceValue[] {
        return grantedResources
            .filter(
                (rv: ResourceValue) =>
                    rv.compute_project_id !== computeProjectId &&
                    new Date(rv.start).valueOf().toString() +
                        "-" +
                        new Date(rv.end).valueOf().toString() ===
                        phase
            )
            .sort(sortResourceValues);
    }

    function assignedResources(phase: string): ResourceValue[] {
        if (!_.keys(elements).includes(phase)) {
            return [];
        }
        const result = elements[phase].filter(
            (el: ResourceValue | LimitValue) => "resource_id" in el
        ) as ResourceValue[];
        result.sort(sortResourceValues);
        return result;
    }

    function totalGranted(phase: string, resourceId: string): number {
        return _.sum(
            [...assignedResources(phase), ...unassignedResources(phase)]
                .filter((rv: ResourceValue) => rv.resource_id === resourceId)
                .map((rv: ResourceValue) => rv.value)
        );
    }

    function totalAssignedToOthers(phase: string, resourceId: string): number {
        return _.sum(
            unassignedResources(phase)
                .filter(
                    (rv: ResourceValue) =>
                        rv.compute_project_id !== null &&
                        rv.resource_id === resourceId
                )
                .map((rv: ResourceValue) => rv.value)
        );
    }

    function getChangedValue(
        phase: string,
        resourceId: string
    ): number | undefined {
        let itemIndex = null;
        resourceChanges.forEach(
            (
                item: { phase: string; resourceId: string; value: number },
                index: number
            ) => {
                if (phase === item.phase && resourceId === item.resourceId) {
                    itemIndex = index;
                }
            }
        );
        return itemIndex === null
            ? undefined
            : resourceChanges[itemIndex].value;
    }

    function changeValue(
        phase: string,
        resourceId: string,
        oldValue: number,
        newValue: number
    ) {
        let itemIndex = null;
        resourceChanges.forEach(
            (
                item: { phase: string; resourceId: string; value: number },
                index: number
            ) => {
                if (phase === item.phase && resourceId === item.resourceId) {
                    itemIndex = index;
                }
            }
        );
        if (oldValue === newValue) {
            if (itemIndex !== null) {
                resourceChanges.splice(itemIndex, 1);
            }
        } else {
            if (itemIndex !== null) {
                resourceChanges[itemIndex].value = newValue;
            } else {
                resourceChanges.push({
                    phase: phase,
                    resourceId: resourceId,
                    value: newValue,
                });
            }
        }
        updateResourceChanges(JSON.parse(JSON.stringify(resourceChanges)));
    }

    grantedResources.forEach((rv: ResourceValue) => {
        const phase: string =
            new Date(rv.start).valueOf() + "-" + new Date(rv.end).valueOf();
        if (!(phase in elements)) {
            elements[phase] = [];
        }
    });

    return (
        <>
            {_.keys(elements).map((phase: string, index: number) => {
                const phaseSplit: string[] = phase.split("-");

                return (
                    <React.Fragment key={phase}>
                        <Box
                            sx={{
                                backgroundColor: theme.palette.action.hover,
                                mb: 2,
                                mt: index === 0 ? 0 : 2,
                            }}
                        >
                            <Typography
                                variant="caption"
                                component="div"
                                sx={{
                                    opacity: 0.6,
                                    py: 0.5,
                                    pl: 0.5,
                                    alignSelf: "flex-start",
                                }}
                            >
                                {new Date(Number(phaseSplit[0])).toUTCString()}{" "}
                                -{" "}
                                {new Date(Number(phaseSplit[1])).toUTCString()}
                            </Typography>
                        </Box>
                        <Grid container spacing={2}>
                            {[
                                ...assignedResources(phase),
                                null,
                                ..._.uniqBy(
                                    unassignedResources(phase).filter(
                                        (rv: ResourceValue) =>
                                            !assignedResources(phase)
                                                .map(
                                                    (rv: ResourceValue) =>
                                                        rv.resource_id
                                                )
                                                .includes(rv.resource_id)
                                    ),
                                    "resource_id"
                                ),
                            ].map(
                                (
                                    resourceValue: ResourceValue | null,
                                    index: number
                                ) => {
                                    if (resourceValue === null) {
                                        if (
                                            unassignedResources(phase)
                                                .length === 0
                                        ) {
                                            return (
                                                <React.Fragment key={index} />
                                            );
                                        }
                                        return (
                                            <Grid size={12} key={index}>
                                                <Divider />
                                            </Grid>
                                        );
                                    }

                                    const stateValue: number | undefined =
                                        getChangedValue(
                                            phase,
                                            resourceValue.resource_id
                                        );

                                    const currentValue: number =
                                        stateValue !== undefined
                                            ? stateValue
                                            : resourceValue.compute_project_id ===
                                                computeProjectId
                                              ? resourceValue.value
                                              : 0;

                                    const resource: Resource | undefined =
                                        resourceMatch(resourceValue);

                                    const resourceName: string =
                                        resource !== undefined
                                            ? resource.name
                                            : resourceValue.resource_id;

                                    const resourceUnit: string =
                                        resource?.display_unit === null ||
                                        resource?.display_unit === undefined
                                            ? ""
                                            : resource?.display_unit;

                                    const helperMessage: string | undefined =
                                        totalGranted(
                                            phase,
                                            resourceValue.resource_id
                                        ) -
                                            totalAssignedToOthers(
                                                phase,
                                                resourceValue.resource_id
                                            ) -
                                            currentValue >
                                        0
                                            ? (
                                                  (totalGranted(
                                                      phase,
                                                      resourceValue.resource_id
                                                  ) -
                                                      totalAssignedToOthers(
                                                          phase,
                                                          resourceValue.resource_id
                                                      )) /
                                                  (resource === undefined
                                                      ? 1
                                                      : resource.display_unit_factor)
                                              ).toString() +
                                              " " +
                                              resourceUnit +
                                              " assignable"
                                            : undefined;

                                    const errorMessage: string =
                                        "You can only assign a maximum of " +
                                        (
                                            (totalGranted(
                                                phase,
                                                resourceValue.resource_id
                                            ) -
                                                totalAssignedToOthers(
                                                    phase,
                                                    resourceValue.resource_id
                                                )) /
                                            (resource === undefined
                                                ? 1
                                                : resource.display_unit_factor)
                                        ).toString() +
                                        " " +
                                        resourceUnit;

                                    return (
                                        <React.Fragment key={index}>
                                            <Grid size={{ xs: 12, md: 4 }}>
                                                <TextField
                                                    disabled
                                                    defaultValue={resourceName}
                                                    size="small"
                                                    label="Resource"
                                                    fullWidth
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 3 }}>
                                                <TextField
                                                    disabled
                                                    defaultValue={
                                                        clusterMatch(
                                                            resourceValue
                                                        )?.name
                                                    }
                                                    size="small"
                                                    label="Cluster"
                                                    fullWidth
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 5 }}>
                                                <DecimalTextField
                                                    value={scaledValueToDecimalString(
                                                        currentValue,
                                                        resource === undefined
                                                            ? 1
                                                            : resource.display_unit_factor
                                                    )}
                                                    onValueChange={(
                                                        newValue: string
                                                    ) => {
                                                        changeValue(
                                                            phase,
                                                            resourceValue.resource_id,
                                                            resourceValue.compute_project_id ===
                                                                computeProjectId
                                                                ? resourceValue.value
                                                                : 0,
                                                            scaledDecimalInputToNumber(
                                                                newValue,
                                                                resource ===
                                                                    undefined
                                                                    ? 1
                                                                    : resource.display_unit_factor
                                                            )
                                                        );
                                                    }}
                                                    size="small"
                                                    label="Assigned value"
                                                    error={
                                                        currentValue +
                                                            totalAssignedToOthers(
                                                                phase,
                                                                resourceValue.resource_id
                                                            ) >
                                                        totalGranted(
                                                            phase,
                                                            resourceValue.resource_id
                                                        )
                                                    }
                                                    helperText={
                                                        currentValue +
                                                            totalAssignedToOthers(
                                                                phase,
                                                                resourceValue.resource_id
                                                            ) >
                                                        totalGranted(
                                                            phase,
                                                            resourceValue.resource_id
                                                        )
                                                            ? errorMessage
                                                            : helperMessage
                                                    }
                                                    color={
                                                        stateValue !== undefined
                                                            ? "info"
                                                            : undefined
                                                    }
                                                    focused={
                                                        stateValue !== undefined
                                                    }
                                                    slotProps={{
                                                        input: {
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    {
                                                                        resourceUnit
                                                                    }
                                                                </InputAdornment>
                                                            ),
                                                        },
                                                    }}
                                                    fullWidth
                                                />
                                            </Grid>
                                        </React.Fragment>
                                    );
                                }
                            )}
                        </Grid>
                    </React.Fragment>
                );
            })}
        </>
    );
}
