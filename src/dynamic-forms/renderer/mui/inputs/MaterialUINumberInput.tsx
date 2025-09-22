// React imports
import React, { ChangeEvent } from "react";

// MUI imports
import { TextField } from "@mui/material";

// Custom imports
import NumberInput from "../../../interfaces/inputs/NumberInput";

export default function MaterialUINumberInput({
    config,
    error,
    onChange,
}: {
    config: NumberInput;
    error: null | string;
    onChange: (id: string, value: unknown) => void;
}) {
    const [decimalHelperOn, setDecimalHelperOn] =
        React.useState<boolean>(false);

    return (
        <TextField
            type="text"
            fullWidth
            label={config.label}
            helperText={
                <>
                    {error !== null && error.length > 0 ? (
                        <>
                            {error}
                            <br />
                        </>
                    ) : (
                        ""
                    )}
                    {config.helperText}
                </>
            }
            value={
                config.value === undefined
                    ? null
                    : config.value.toString() + (decimalHelperOn ? "." : "")
            }
            required={config.required}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setDecimalHelperOn(
                    event.target.value.slice(-1) === "." ||
                        event.target.value.slice(-1) === ","
                );
                onChange(
                    config.id,
                    Number(event.currentTarget.value.replace(",", "."))
                );
            }}
            inputProps={{
                inputMode: "decimal",
                pattern: "[0-9]*[.,]?[0-9]*",
            }}
            error={error !== null}
        />
    );
}
