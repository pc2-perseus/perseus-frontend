// React imports
import React from "react";

// MUI imports
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export default function ActiveSelector({
    value,
    onChange,
}: {
    value: boolean;
    onChange: (value: boolean) => void;
}): React.ReactElement {
    const [currentValue, setCurrentValue] = React.useState<0 | 1>(
        value ? 1 : 0
    );

    return (
        <FormControl fullWidth>
            <InputLabel>Active</InputLabel>
            <Select
                label="Active"
                value={currentValue}
                onChange={(e) => {
                    setCurrentValue(e.target.value as 0 | 1);
                    onChange(e.target.value === 1);
                }}
            >
                <MenuItem value={1}>Yes</MenuItem>
                <MenuItem value={0}>No</MenuItem>
            </Select>
        </FormControl>
    );
}
