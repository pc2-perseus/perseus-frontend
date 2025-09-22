// React imports
import { ChangeEvent } from "react";

// MUI imports
import { TextField } from "@mui/material";

// Custom imports
import PhoneInput from "../../../interfaces/inputs/PhoneInput";

export default function MaterialUIPhoneInput({
    config,
    error,
    onChange,
}: {
    config: PhoneInput;
    error: null | string;
    onChange: (id: string, value: unknown) => void;
}) {
    return (
        <TextField
            type="tel"
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
            value={config.value === undefined ? null : config.value}
            required={config.required}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                onChange(config.id, event.currentTarget.value);
            }}
            error={error !== null}
        />
    );
}
