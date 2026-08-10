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
    function getAffiliationLabel(ins: Institute): string {
        return `${
            organizations.find(
                (organization) => organization._id === ins.organization_id
            )?.name ?? ""
        }, ${ins.name}`;
    }

    const [currentValue, setCurrentValue] = React.useState<
        Institute | null | undefined
    >(institutes.find((ins: Institute) => ins._id === affiliationId));

    const sortedInstitutes = React.useMemo(
        () =>
            [...institutes].sort((a: Institute, b: Institute) =>
                getAffiliationLabel(a).localeCompare(getAffiliationLabel(b))
            ),
        [institutes, organizations]
    );

    React.useEffect(() => {
        setCurrentValue(
            institutes.find((ins: Institute) => ins._id === affiliationId)
        );
    }, [affiliationId, institutes]);

    return (
        <Autocomplete
            renderInput={(params) => (
                <TextField {...params} label="Affiliation" />
            )}
            value={currentValue === undefined ? null : currentValue}
            options={sortedInstitutes}
            getOptionLabel={getAffiliationLabel}
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
