// React imports
import React from "react";

// MUI imports
import { Autocomplete, TextField } from "@mui/material";
import ScientificField from "../../../interfaces/ScientificField.ts";

export default function ScientificFieldsSelector({
    scientificFields,
    options,
    onChange,
}: {
    scientificFields: ScientificField[];
    options: ScientificField[];
    onChange: (value: ScientificField[]) => void;
}): React.ReactElement {
    const [currentValues, setCurrentValues] =
        React.useState<ScientificField[]>(scientificFields);

    return (
        <Autocomplete
            renderInput={(params) => (
                <TextField {...params} label="Scientific fields" />
            )}
            multiple
            value={currentValues}
            options={options}
            getOptionLabel={(field: ScientificField) =>
                field.version +
                "/" +
                field.subject_id +
                (field.name !== null ? " (" + field.name + ")" : "")
            }
            isOptionEqualToValue={(o: ScientificField, v: ScientificField) =>
                o.version === v.version && o.subject_id === v.subject_id
            }
            onChange={(_, values: ScientificField[] | null) => {
                setCurrentValues(values === null ? [] : values);
                onChange(values === null ? [] : values);
            }}
            fullWidth
        />
    );
}
