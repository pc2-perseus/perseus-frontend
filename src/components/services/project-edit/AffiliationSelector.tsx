// React imports
import React from "react";

// MUI imports
import { Autocomplete, TextField } from "@mui/material";
import Institute from "../../../interfaces/Institute.ts";
import Organization from "../../../interfaces/Organization.ts";

export default function AffiliationSelector({
    affiliationId,
    institutes,
    organizations,
    onChange,
}: {
    affiliationId: string | null;
    institutes: Institute[];
    organizations: Organization[];
    onChange: (value: Institute | null) => void;
}): React.ReactElement {
    const [currentValue, setCurrentValue] = React.useState<
        Institute | null | undefined
    >(institutes.find((ins: Institute) => ins._id === affiliationId));

    return (
        <Autocomplete
            renderInput={(params) => (
                <TextField {...params} label="Affiliation" />
            )}
            value={currentValue === undefined ? null : currentValue}
            options={institutes}
            getOptionLabel={(ins: Institute) =>
                organizations.find(
                    (organization) =>
                        organization._id === currentValue?.organization_id
                )?.name +
                ", " +
                ins.name
            }
            isOptionEqualToValue={(ins1: Institute, ins2: Institute) =>
                ins1._id === ins2._id
            }
            onChange={(_, value: Institute | null) => {
                setCurrentValue(value);
                onChange(value);
            }}
            fullWidth
        />
    );
}
