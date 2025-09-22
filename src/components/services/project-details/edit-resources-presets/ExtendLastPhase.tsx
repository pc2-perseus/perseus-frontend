// React imports
import React from "react";

// MUI imports
import {
    Grid,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    useTheme,
} from "@mui/material";

// Custom imports
import ResourceValue from "../../../../interfaces/ResourceValue.ts";
import Resource from "../../../../interfaces/Resource.ts";
import Cluster from "../../../../interfaces/Cluster.ts";
import clusterMatch from "../../../../utils/clusterMatch.ts";
import resourceMatch from "../../../../utils/resourceMatch.ts";
import resourceValueUnitString from "../../../../utils/resourceValueUnitString.ts";

// Other imports
import sortResourceValues from "../../../../utils/sortResourceValues.ts";

// eslint-disable-next-line react-refresh/only-export-components
export function extendLastPhaseSubmitFormat(
    presetData: {
        [key: string]: unknown;
    },
    resourceValues: ResourceValue[]
): {
    resource_id: string;
    compute_project_id: string | null;
    start: string;
    end: string;
    value: number;
}[] {
    const newGrantedResources: {
        resource_id: string;
        compute_project_id: string | null;
        start: string;
        end: string;
        value: number;
    }[] = [];

    const years: number =
        "years" in presetData ? Number(presetData["years"]) : 0;
    const months: number =
        "months" in presetData ? Number(presetData["months"]) : 3;
    const days: number = "days" in presetData ? Number(presetData["days"]) : 0;

    if (years === 0 && months === 0 && days === 0) {
        return [];
    }

    let lastStart: Date | null = null;
    let lastEnd: Date | null = null;
    resourceValues.forEach((rv: ResourceValue) => {
        if (
            lastStart === null ||
            lastStart.valueOf() < new Date(rv.start).valueOf()
        ) {
            lastStart = new Date(rv.start);
            if (
                lastEnd === null ||
                lastEnd.valueOf() < new Date(rv.end).valueOf()
            ) {
                lastEnd = new Date(rv.end);
            }
        }
    });
    if (lastStart !== null && lastEnd !== null) {
        const newEnd = new Date(lastEnd);
        const originalDate: number =
            newEnd.getUTCDate() ===
            new Date(
                Date.UTC(newEnd.getUTCFullYear(), newEnd.getUTCMonth() + 1, 0)
            ).getUTCDate()
                ? 31
                : newEnd.getDate();
        newEnd.setUTCDate(1);

        newEnd.setUTCFullYear(newEnd.getUTCFullYear() + years);
        newEnd.setUTCMonth(newEnd.getUTCMonth() + months);

        const daysInMonth: number = new Date(
            Date.UTC(newEnd.getUTCFullYear(), newEnd.getUTCMonth() + 1, 0)
        ).getUTCDate();

        newEnd.setUTCDate(Math.min(originalDate, daysInMonth));
        newEnd.setUTCDate(newEnd.getUTCDate() + days);
        resourceValues.forEach((rv: ResourceValue) => {
            if (
                lastStart?.valueOf() === new Date(rv.start).valueOf() &&
                lastEnd?.valueOf() === new Date(rv.end).valueOf()
            ) {
                newGrantedResources.push({
                    resource_id: rv.resource_id,
                    compute_project_id: rv.compute_project_id,
                    start: rv.start,
                    end: newEnd.toISOString(),
                    value: rv.value,
                });
            }
        });
    }

    return newGrantedResources;
}

// eslint-disable-next-line react-refresh/only-export-components
export function extendLastPhaseNote(presetData: {
    [key: string]: unknown;
}): string {
    const years: number =
        "years" in presetData ? Number(presetData["years"]) : 0;
    const months: number =
        "months" in presetData ? Number(presetData["months"]) : 3;
    const days: number = "days" in presetData ? Number(presetData["days"]) : 0;

    const durationParts: string[] = [];
    if (years > 0) {
        durationParts.push(years.toString() + " years");
    }
    if (months > 0) {
        durationParts.push(months.toString() + " months");
    }
    if (days > 0) {
        durationParts.push(days.toString() + " days");
    }

    return "Extended the last phase by " + durationParts.join(", ");
}

export default function ExtendLastPhase({
    resourceValues,
    resources,
    clusters,
    updatePresetData,
}: {
    resourceValues: ResourceValue[];
    resources: Resource[];
    clusters: Cluster[];
    updatePresetData: (id: string, value: unknown) => void;
}): React.ReactElement {
    const [days, setDays] = React.useState<string>("0");
    const [months, setMonths] = React.useState<string>("3");
    const [years, setYears] = React.useState<string>("0");

    const theme = useTheme();

    let lastStart: Date | null = null;
    let lastEnd: Date | null = null;
    resourceValues.forEach((rv: ResourceValue) => {
        if (
            lastStart === null ||
            lastStart.valueOf() < new Date(rv.start).valueOf()
        ) {
            lastStart = new Date(rv.start);
            if (
                lastEnd === null ||
                lastEnd.valueOf() < new Date(rv.end).valueOf()
            ) {
                lastEnd = new Date(rv.end);
            }
        }
    });

    let newEnd: Date | null = null;
    if (lastEnd !== null) {
        newEnd = new Date(lastEnd);
        const originalDate: number =
            newEnd.getUTCDate() ===
            new Date(
                Date.UTC(newEnd.getUTCFullYear(), newEnd.getUTCMonth() + 1, 0)
            ).getUTCDate()
                ? 31
                : newEnd.getDate();
        newEnd.setUTCDate(1);

        newEnd.setUTCFullYear(newEnd.getUTCFullYear() + Number(years));
        newEnd.setUTCMonth(newEnd.getUTCMonth() + Number(months));

        const daysInMonth: number = new Date(
            Date.UTC(newEnd.getUTCFullYear(), newEnd.getUTCMonth() + 1, 0)
        ).getUTCDate();

        newEnd.setUTCDate(Math.min(originalDate, daysInMonth));
        newEnd.setUTCDate(newEnd.getUTCDate() + Number(days));
    }

    const filteredResourceValues: ResourceValue[] = resourceValues.filter(
        (rv: ResourceValue) => {
            return (
                lastStart?.valueOf() === new Date(rv.start).valueOf() &&
                lastEnd?.valueOf() === new Date(rv.end).valueOf()
            );
        }
    );

    return (
        <>
            <Grid container spacing={2}>
                <Grid size={4}>
                    <TextField
                        label="Years"
                        value={years}
                        onChange={(e) => {
                            setYears(e.currentTarget.value);
                            updatePresetData("years", e.currentTarget.value);
                        }}
                        fullWidth
                    />
                </Grid>
                <Grid size={4}>
                    <TextField
                        label="Months"
                        value={months}
                        onChange={(e) => {
                            setMonths(e.currentTarget.value);
                            updatePresetData("months", e.currentTarget.value);
                        }}
                        fullWidth
                    />
                </Grid>
                <Grid size={4}>
                    <TextField
                        label="Days"
                        value={days}
                        onChange={(e) => {
                            setDays(e.currentTarget.value);
                            updatePresetData("days", e.currentTarget.value);
                        }}
                        fullWidth
                    />
                </Grid>
            </Grid>

            <Table size="small" sx={{ mt: 2 }}>
                <TableHead>
                    <TableRow
                        sx={{
                            backgroundColor: theme.palette.action.hover,
                        }}
                    >
                        <TableCell colSpan={5}>
                            {lastStart === null
                                ? ""
                                : (lastStart as Date).toUTCString()}{" "}
                            -{" "}
                            <s style={{ color: theme.palette.error.main }}>
                                {lastEnd === null
                                    ? ""
                                    : (lastEnd as Date).toUTCString()}
                            </s>{" "}
                            {newEnd === null ? "" : newEnd.toUTCString()}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Resource</TableCell>
                        <TableCell>Cluster</TableCell>
                        <TableCell>Compute project</TableCell>
                        <TableCell>Value</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortResourceValues(
                        filteredResourceValues,
                        resources,
                        clusters
                    ).map((rv: ResourceValue, index: number) => {
                        const cluster: Cluster | undefined = clusterMatch(
                            rv,
                            resources,
                            clusters
                        );
                        const resource: Resource | undefined = resourceMatch(
                            rv,
                            resources
                        );

                        return (
                            <TableRow key={index}>
                                <TableCell>{resource?.name}</TableCell>
                                <TableCell>{cluster?.name}</TableCell>
                                <TableCell>
                                    {rv.compute_project_id === null
                                        ? "-"
                                        : rv.compute_project_id}
                                </TableCell>
                                <TableCell>
                                    {resourceValueUnitString(rv, resource)}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </>
    );
}
