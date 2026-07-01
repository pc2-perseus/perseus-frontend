// React imports
import React from "react";

// MUI imports
import { Autocomplete, TextField } from "@mui/material";
import Person from "../../../interfaces/Person.ts";

export default function PersonSelector({
    label,
    personId,
    options,
    onChange,
}: {
    label: string;
    personId: string | null;
    options: Person[];
    onChange: (value: Person | null) => void;
}): React.ReactElement {
    const [currentValue, setCurrentValue] = React.useState<Person | null>(
        options.find((p: Person) => p._id === personId) ?? null
    );

    React.useEffect(() => {
        setCurrentValue(
            options.find((p: Person) => p._id === personId) ?? null
        );
    }, [personId, options]);

    return (
        <Autocomplete
            options={options}
            value={currentValue}
            getOptionLabel={(p: Person) =>
                (p.title ? `${p.title} ` : "") + `${p.firstname} ${p.lastname}`
            }
            renderOption={(props, option) => (
                <li {...props} key={option._id}>
                    {(option.title ? `${option.title} ` : "") +
                        `${option.firstname} ${option.lastname}`}
                </li>
            )}
            isOptionEqualToValue={(p1, p2) => p1._id === p2._id}
            onChange={(_, value) => {
                setCurrentValue(value);
                onChange(value);
            }}
            renderInput={(params) => <TextField {...params} label={label} />}
            fullWidth
        />
    );
}
