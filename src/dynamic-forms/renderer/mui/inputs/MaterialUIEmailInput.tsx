// MUI imports
import { TextField } from "@mui/material";

// Custom imports
import EmailInput from "../../../interfaces/inputs/EmailInput";
import { ChangeEvent } from "react";

export default function MaterialUIEmailInput({
    config,
    error,
    onChange,
}: {
    config: EmailInput;
    error: null | string;
    onChange: (id: string, value: unknown) => void;
}) {
    return (
        <TextField
            type="email"
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
