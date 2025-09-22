// React imports
import React from "react";

// MUI imports
import { Autocomplete, TextField } from "@mui/material";

export default function StatesSelector({
    states,
    options,
    onChange,
}: {
    states: string[];
    options: string[];
    onChange: (value: string[]) => void;
}): React.ReactElement {
    const [currentValues, setCurrentValues] = React.useState<string[]>(states);

    return (
        <Autocomplete
            renderInput={(params) => <TextField {...params} label="States" />}
            multiple
            value={currentValues}
            options={options}
            onChange={(_, values: string[] | null) => {
                setCurrentValues(values === null ? [] : values);
                onChange(values === null ? [] : values);
            }}
            fullWidth
        />
    );
}
