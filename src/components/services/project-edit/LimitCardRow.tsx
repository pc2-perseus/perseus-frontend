// React imports
import React from "react";

// MUI imports
import {
    Button,
    InputAdornment,
    TableCell,
    TableRow,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";

// Icon imports
import DeleteIcon from "@mui/icons-material/Delete";

// Custom imports
import LimitValue from "../../../interfaces/LimitValue.ts";
import Limit from "../../../interfaces/Limit.ts";
import limitMatch from "../../../utils/limitMatch.ts";

// Other imports
import dayjs, { Dayjs } from "dayjs";
import DecimalTextField from "../../DecimalTextField.tsx";
import {
    decimalInputToNumber,
    scaledDecimalInputToNumber,
    scaledValueToDecimalString,
} from "../../../utils/decimalUnits.ts";

export default function LimitCardRow({
    value,
    index,
    limits,
    onChange,
    onDelete,
}: {
    value: LimitValue;
    index: number;
    limits: Limit[];
    onChange: (value: LimitValue, index: number) => void;
    onDelete: (index: number) => void;
}): React.ReactElement {
    const limit: Limit | undefined = limitMatch(value, limits);

    return (
        <TableRow>
            <TableCell sx={{ whiteSpace: "nowrap" }}>{limit?.name}</TableCell>
            <TableCell>
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
            <TableCell>
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
                <DecimalTextField
                    label=""
                    value={
                        limit !== undefined
                            ? scaledValueToDecimalString(
                                  value.value,
                                  limit.display_unit_factor
                              )
                            : value.value.toString()
                    }
                    size="small"
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    {limit?.display_unit}
                                </InputAdornment>
                            ),
                        },
                    }}
                    onValueChange={(newValue: string) => {
                        value.value =
                            limit === undefined
                                ? decimalInputToNumber(newValue)
                                : scaledDecimalInputToNumber(
                                      newValue,
                                      limit.display_unit_factor
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
