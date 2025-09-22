// React imports
import React from "react";

// MUI imports
import {
    FormControl,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
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
import _ from "lodash";
import sortResourceValues from "../../../../utils/sortResourceValues.ts";

// eslint-disable-next-line react-refresh/only-export-components
export function increasePercentCumulativeSubmitFormat(
    presetData: {
        [key: string]: unknown;
    },
    resourceValues: ResourceValue[],
    resources: Resource[]
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

    const [start, end] =
        !("phase" in presetData) || presetData["phase"] === "all"
            ? [null, null]
            : (presetData["phase"] as string).split("$");
    const percent: number =
        "percent" in presetData
            ? Number((presetData["percent"] as string).replace(",", "."))
            : 25;

    resourceValues.forEach((rv: ResourceValue) => {
        const resource = resourceMatch(rv, resources);
        if (
            ((start === null && end === null) ||
                (start === rv.start && end === rv.end)) &&
            resource !== undefined &&
            resource.resource_type === "cumulative"
        ) {
            newGrantedResources.push({
                resource_id: rv.resource_id,
                compute_project_id: rv.compute_project_id,
                start: rv.start,
                end: rv.end,
                value: rv.value * (1 + percent / 100),
            });
        }
    });

    return newGrantedResources;
}

// eslint-disable-next-line react-refresh/only-export-components
export function increasePercentCumulativeNote(presetData: {
    [key: string]: unknown;
}): string {
    return (
        "Increased cumulative resources by " +
        ("percent" in presetData ? presetData["percent"] : "25") +
        "%"
    );
}

export default function IncreasePercentCumulative({
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
    const [phase, setPhase] = React.useState<string>("all");
    const [percent, setPercent] = React.useState<string>("25");

    const theme = useTheme();

    resourceValues = resourceValues.filter((rv: ResourceValue) =>
        resources
            .filter((r: Resource) => r.resource_type === "cumulative")
            .map((r: Resource) => r.id)
            .includes(rv.resource_id)
    );

    const allPhases: string[] = [
        ...new Set(
            resourceValues.map((rv: ResourceValue) => rv.start + "$" + rv.end)
        ),
    ];
    allPhases.sort();

    const filteredResourceValues: ResourceValue[] = resourceValues.filter(
        (rv: ResourceValue) =>
            phase === "all" ||
            (phase.split("$")[0] === rv.start && phase.split("$")[1] === rv.end)
    );

    const groupedResourceValues: { [key: string]: ResourceValue[] } = _.groupBy(
        filteredResourceValues,
        (rv: ResourceValue) => rv.start + "$" + rv.end
    );

    return (
        <>
            <Grid container spacing={2}>
                <Grid size={9}>
                    <FormControl fullWidth>
                        <InputLabel>Phase</InputLabel>
                        <Select
                            variant="outlined"
                            label="Phase"
                            value={phase}
                            onChange={(e) => {
                                setPhase(e.target.value);
                                updatePresetData("phase", e.target.value);
                            }}
                        >
                            <MenuItem value="all">All phases</MenuItem>
                            {allPhases.map((phase: string) => {
                                const [startStr, endStr] = phase.split("$");
                                return (
                                    <MenuItem key={phase} value={phase}>
                                        {new Date(startStr).toUTCString()} -{" "}
                                        {new Date(endStr).toUTCString()}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={3}>
                    <TextField
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        %
                                    </InputAdornment>
                                ),
                            },
                        }}
                        value={percent}
                        onChange={(e) => {
                            setPercent(e.currentTarget.value);
                            updatePresetData("percent", e.currentTarget.value);
                        }}
                        fullWidth
                    />
                </Grid>
            </Grid>
            {_.keys(groupedResourceValues).map(
                (phaseStr: string, index: number) => {
                    const [startStr, endStr] = phaseStr.split("$");
                    return (
                        <Table
                            size="small"
                            sx={{ mt: index === 0 ? 2 : 0 }}
                            key={phaseStr}
                        >
                            <TableHead>
                                <TableRow
                                    sx={{
                                        backgroundColor:
                                            theme.palette.action.hover,
                                    }}
                                >
                                    <TableCell colSpan={5}>
                                        {new Date(startStr).toUTCString()} -{" "}
                                        {new Date(endStr).toUTCString()}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Resource</TableCell>
                                    <TableCell>Cluster</TableCell>
                                    <TableCell>Compute project</TableCell>
                                    <TableCell>Old</TableCell>
                                    <TableCell>New</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortResourceValues(
                                    groupedResourceValues[phaseStr],
                                    resources,
                                    clusters
                                ).map((rv: ResourceValue, index: number) => {
                                    const cluster: Cluster | undefined =
                                        clusterMatch(rv, resources, clusters);
                                    const resource: Resource | undefined =
                                        resourceMatch(rv, resources);

                                    const newRv: ResourceValue = JSON.parse(
                                        JSON.stringify(rv)
                                    );
                                    newRv.value =
                                        rv.value *
                                        (1 +
                                            Number(percent.replace(",", ".")) /
                                                100);

                                    return (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {resource?.name}
                                            </TableCell>
                                            <TableCell>
                                                {cluster?.name}
                                            </TableCell>
                                            <TableCell>
                                                {rv.compute_project_id === null
                                                    ? "-"
                                                    : rv.compute_project_id}
                                            </TableCell>
                                            <TableCell>
                                                {resourceValueUnitString(
                                                    rv,
                                                    resource
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {resourceValueUnitString(
                                                    newRv,
                                                    resource
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    );
                }
            )}
        </>
    );
}
