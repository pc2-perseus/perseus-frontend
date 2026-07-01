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
import Limit from "../../../../interfaces/Limit.ts";
import DecimalTextField from "../../../DecimalTextField.tsx";
import {
    scaledDecimalInputToNumber,
    scaledValueToDecimalString,
} from "../../../../utils/decimalUnits.ts";

export default function EditComputeProjectLimits({
    computeProjectId,
    elements,
    limits,
    grantedLimits,
    limitChanges,
    updateLimitChanges,
}: {
    computeProjectId: string;
    elements: { [key: string]: (ResourceValue | LimitValue)[] };
    limits: Limit[];
    grantedLimits: LimitValue[];
    limitChanges: { phase: string; limitId: string; value: number }[];
    updateLimitChanges: React.Dispatch<
        React.SetStateAction<
            { phase: string; limitId: string; value: number }[]
        >
    >;
}): React.ReactElement {
    const theme: Theme = useTheme();

    function limitMatch(limitValue: LimitValue): Limit | undefined {
        try {
            return limits.filter((l) => l.id === limitValue.limit_id)[0];
        } catch {
            return undefined;
        }
    }

    function sortLimitValues(lv1: LimitValue, lv2: LimitValue) {
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
    }

    function unassignedLimits(phase: string): LimitValue[] {
        return grantedLimits
            .filter(
                (lv: LimitValue) =>
                    lv.compute_project_id !== computeProjectId &&
                    new Date(lv.start).valueOf().toString() +
                        "-" +
                        new Date(lv.end).valueOf().toString() ===
                        phase
            )
            .sort(sortLimitValues);
    }

    function assignedLimits(phase: string): LimitValue[] {
        if (!_.keys(elements).includes(phase)) {
            return [];
        }
        const result = elements[phase].filter(
            (el: ResourceValue | LimitValue) => "limit_id" in el
        ) as LimitValue[];
        result.sort(sortLimitValues);
        return result;
    }

    function totalGranted(phase: string, limitId: string): number {
        return _.sum(
            [...assignedLimits(phase), ...unassignedLimits(phase)]
                .filter((lv: LimitValue) => lv.limit_id === limitId)
                .map((lv: LimitValue) => lv.value)
        );
    }

    function totalAssignedToOthers(phase: string, limitId: string): number {
        return _.sum(
            unassignedLimits(phase)
                .filter(
                    (lv: LimitValue) =>
                        lv.compute_project_id !== null &&
                        lv.limit_id === limitId
                )
                .map((lv: LimitValue) => lv.value)
        );
    }

    function getChangedValue(
        phase: string,
        limitId: string
    ): number | undefined {
        let itemIndex = null;
        limitChanges.forEach(
            (
                item: { phase: string; limitId: string; value: number },
                index: number
            ) => {
                if (phase === item.phase && limitId === item.limitId) {
                    itemIndex = index;
                }
            }
        );
        return itemIndex === null ? undefined : limitChanges[itemIndex].value;
    }

    function changeValue(
        phase: string,
        limitId: string,
        oldValue: number,
        newValue: number
    ) {
        let itemIndex = null;
        limitChanges.forEach(
            (
                item: { phase: string; limitId: string; value: number },
                index: number
            ) => {
                if (phase === item.phase && limitId === item.limitId) {
                    itemIndex = index;
                }
            }
        );
        if (oldValue === newValue) {
            if (itemIndex !== null) {
                limitChanges.splice(itemIndex, 1);
            }
        } else {
            if (itemIndex !== null) {
                limitChanges[itemIndex].value = newValue;
            } else {
                limitChanges.push({
                    phase: phase,
                    limitId: limitId,
                    value: newValue,
                });
            }
        }
        updateLimitChanges(JSON.parse(JSON.stringify(limitChanges)));
    }

    grantedLimits.forEach((lv: LimitValue) => {
        const phase: string =
            new Date(lv.start).valueOf() + "-" + new Date(lv.end).valueOf();
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
                                ...assignedLimits(phase),
                                null,
                                ...unassignedLimits(phase).filter(
                                    (lv: LimitValue) =>
                                        !assignedLimits(phase)
                                            .map(
                                                (lv: LimitValue) => lv.limit_id
                                            )
                                            .includes(lv.limit_id)
                                ),
                            ].map(
                                (
                                    limitValue: LimitValue | null,
                                    index: number
                                ) => {
                                    if (limitValue === null) {
                                        if (
                                            unassignedLimits(phase).length === 0
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
                                            limitValue.limit_id
                                        );

                                    const currentValue: number =
                                        stateValue !== undefined
                                            ? stateValue
                                            : limitValue.compute_project_id ===
                                                computeProjectId
                                              ? limitValue.value
                                              : 0;

                                    const limit: Limit | undefined =
                                        limitMatch(limitValue);

                                    const limitName: string =
                                        limit !== undefined
                                            ? limit.name
                                            : limitValue.limit_id;

                                    const limitUnit: string =
                                        limit?.display_unit === null ||
                                        limit?.display_unit === undefined
                                            ? ""
                                            : limit?.display_unit;

                                    const helperMessage: string | undefined =
                                        totalGranted(
                                            phase,
                                            limitValue.limit_id
                                        ) -
                                            totalAssignedToOthers(
                                                phase,
                                                limitValue.limit_id
                                            ) -
                                            currentValue >
                                        0
                                            ? (
                                                  (totalGranted(
                                                      phase,
                                                      limitValue.limit_id
                                                  ) -
                                                      totalAssignedToOthers(
                                                          phase,
                                                          limitValue.limit_id
                                                      )) /
                                                  (limit === undefined
                                                      ? 1
                                                      : limit.display_unit_factor)
                                              ).toString() +
                                              " " +
                                              limitUnit +
                                              " assignable"
                                            : undefined;

                                    const errorMessage: string =
                                        "You can only assign a maximum of " +
                                        (
                                            (totalGranted(
                                                phase,
                                                limitValue.limit_id
                                            ) -
                                                totalAssignedToOthers(
                                                    phase,
                                                    limitValue.limit_id
                                                )) /
                                            (limit === undefined
                                                ? 1
                                                : limit.display_unit_factor)
                                        ).toString() +
                                        " " +
                                        limitUnit;

                                    return (
                                        <React.Fragment key={index}>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    disabled
                                                    defaultValue={limitName}
                                                    size="small"
                                                    label="Limit"
                                                    fullWidth
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <DecimalTextField
                                                    value={scaledValueToDecimalString(
                                                        currentValue,
                                                        limit === undefined
                                                            ? 1
                                                            : limit.display_unit_factor
                                                    )}
                                                    onValueChange={(
                                                        newValue: string
                                                    ) => {
                                                        changeValue(
                                                            phase,
                                                            limitValue.limit_id,
                                                            limitValue.compute_project_id ===
                                                                computeProjectId
                                                                ? limitValue.value
                                                                : 0,
                                                            scaledDecimalInputToNumber(
                                                                newValue,
                                                                limit ===
                                                                    undefined
                                                                    ? 1
                                                                    : limit.display_unit_factor
                                                            )
                                                        );
                                                    }}
                                                    size="small"
                                                    label="Assigned value"
                                                    error={
                                                        currentValue +
                                                            totalAssignedToOthers(
                                                                phase,
                                                                limitValue.limit_id
                                                            ) >
                                                        totalGranted(
                                                            phase,
                                                            limitValue.limit_id
                                                        )
                                                    }
                                                    helperText={
                                                        currentValue +
                                                            totalAssignedToOthers(
                                                                phase,
                                                                limitValue.limit_id
                                                            ) >
                                                        totalGranted(
                                                            phase,
                                                            limitValue.limit_id
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
                                                                    {limitUnit}
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
