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
    const [currentValue, setCurrentValue] = React.useState<
        Person | null | undefined
    >(options.find((p: Person) => p._id === personId));

    return (
        <Autocomplete
            renderInput={(params) => <TextField {...params} label={label} />}
            value={currentValue === undefined ? null : currentValue}
            options={options}
            getOptionLabel={(p: Person) =>
                (p.title === null ? "" : p.title + " ") +
                p.firstname +
                " " +
                p.lastname
            }
            isOptionEqualToValue={(p1: Person, p2: Person) => p1._id === p2._id}
            onChange={(_, value: Person | null) => {
                setCurrentValue(value);
                onChange(value);
            }}
            fullWidth
        />
    );
}
