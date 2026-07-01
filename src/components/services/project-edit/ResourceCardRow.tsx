// React imports
import React from "react";

// MUI imports
import {
    Autocomplete,
    Button,
    InputAdornment,
    MenuItem,
    Select,
    TableCell,
    TableRow,
    TextField,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";

// Icon imports
import DeleteIcon from "@mui/icons-material/Delete";

// Custom imports
import ResourceValue from "../../../interfaces/ResourceValue.ts";
import Resource from "../../../interfaces/Resource.ts";
import resourceMatch from "../../../utils/resourceMatch.ts";
import Cluster from "../../../interfaces/Cluster.ts";
import clusterMatch from "../../../utils/clusterMatch.ts";

// Other imports
import dayjs, { Dayjs } from "dayjs";
import ResourcePriority from "../../../interfaces/ResourcePriority.ts";
import DecimalTextField from "../../DecimalTextField.tsx";
import {
    decimalInputToNumber,
    scaledDecimalInputToNumber,
    scaledValueToDecimalString,
} from "../../../utils/decimalUnits.ts";

export default function ResourceCardRow({
    value,
    index,
    resources,
    clusters,
    priorities,
    onChange,
    onDelete,
}: {
    value: ResourceValue;
    index: number;
    resources: Resource[];
    clusters: Cluster[];
    priorities: ResourcePriority[];
    onChange: (value: ResourceValue, index: number) => void;
    onDelete: (index: number) => void;
}): React.ReactElement {
    const resource: Resource | undefined = resourceMatch(value, resources);
    const cluster: Cluster | undefined = clusterMatch(
        value,
        resources,
        clusters
    );
    return (
        <TableRow>
            <TableCell>{resource?.name}</TableCell>
            <TableCell>{cluster?.name}</TableCell>
            <TableCell>
                {value.compute_project_id === null
                    ? "-"
                    : value.compute_project_id}
            </TableCell>
            <TableCell sx={{ maxWidth: "17em" }}>
                <DateTimePicker
                    label=""
                    value={dayjs(value.start)}
                    timezone="UTC"
                    slotProps={{
                        textField: { size: "small", fullWidth: true },
                    }}
                    onChange={(newValue: Dayjs | null) => {
                        if (newValue !== null) {
                            value.start = newValue.toDate().toISOString();
                            onChange(value, index);
                        }
                    }}
                />
            </TableCell>
            <TableCell sx={{ maxWidth: "17em" }}>
                <DateTimePicker
                    label=""
                    value={dayjs(value.end)}
                    timezone="UTC"
                    slotProps={{
                        textField: { size: "small", fullWidth: true },
                    }}
                    onChange={(newValue: Dayjs | null) => {
                        if (newValue !== null) {
                            value.end = newValue.toDate().toISOString();
                            onChange(value, index);
                        }
                    }}
                />
            </TableCell>
            <TableCell>
                <Autocomplete
                    renderInput={(params) => (
                        <TextField {...params} label="" size="small" />
                    )}
                    size="small"
                    multiple
                    value={value.partitions}
                    options={[]}
                    onChange={(_, values: string[] | null) => {
                        if (values === null) {
                            values = [];
                        }
                        value.partitions = values;
                        onChange(value, index);
                    }}
                    freeSolo
                    fullWidth
                />
            </TableCell>
            <TableCell>
                <Select
                    variant="outlined"
                    size="small"
                    value={value.priority}
                    onChange={(e) => {
                        value.priority = Number(e.target.value);
                        onChange(value, index);
                    }}
                    fullWidth
                >
                    {priorities.filter((p) => p.value === value.priority)
                        .length === 0 && (
                        <MenuItem value={value.priority}>unknown</MenuItem>
                    )}

                    {priorities.map((priority: ResourcePriority) => {
                        return (
                            <MenuItem key={priority._id} value={priority.value}>
                                {priority.priority_id}
                            </MenuItem>
                        );
                    })}
                </Select>
            </TableCell>
            <TableCell>
                <DecimalTextField
                    label=""
                    value={
                        resource !== undefined
                            ? scaledValueToDecimalString(
                                  value.value,
                                  resource.display_unit_factor
                              )
                            : value.value.toString()
                    }
                    size="small"
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    {resource?.display_unit}
                                </InputAdornment>
                            ),
                        },
                    }}
                    onValueChange={(newValue: string) => {
                        value.value =
                            resource === undefined
                                ? decimalInputToNumber(newValue)
                                : scaledDecimalInputToNumber(
                                      newValue,
                                      resource.display_unit_factor
                                  );
                        onChange(value, index);
                    }}
                    fullWidth
                />
            </TableCell>
            <TableCell>
                <Button
                    size="small"
                    color="error"
                    onClick={() => {
                        onDelete(index);
                    }}
                >
                    <DeleteIcon />
                </Button>
            </TableCell>
        </TableRow>
    );
}
