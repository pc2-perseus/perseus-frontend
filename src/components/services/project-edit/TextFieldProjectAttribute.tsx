// React imports
import React from "react";

// MUI imports
import { Autocomplete, TextField } from "@mui/material";

export default function TextFieldProjectAttribute({
    label,
    value,
    options,
    onChange,
    freeSolo = false,
}: {
    label: string;
    value: string | null | undefined;
    options?: string[];
    onChange: (value: string | null) => void;
    freeSolo?: boolean;
}): React.ReactElement {
    const [currentValue, setCurrentValue] = React.useState<string>(
        value === undefined || value === null ? "" : value
    );

    if (options === undefined) {
        return (
            <TextField
                label={label}
                value={currentValue}
                onChange={(e) => {
                    setCurrentValue(e.currentTarget.value);
                    onChange(e.currentTarget.value);
                }}
                fullWidth
            />
        );
    }

    return (
        <Autocomplete
            renderInput={(params) => <TextField label={label} {...params} />}
            options={options}
            freeSolo={freeSolo}
            value={currentValue}
            onChange={(_, value: string | null) => {
                setCurrentValue(value === null ? "" : value);
                onChange(value);
            }}
            fullWidth
        />
    );
}
