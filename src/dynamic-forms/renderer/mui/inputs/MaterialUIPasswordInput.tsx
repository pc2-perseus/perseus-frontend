// React imports
import { ChangeEvent } from "react";

// MUI imports
import { TextField } from "@mui/material";

// Custom imports
import PasswordInput from "../../../interfaces/inputs/PasswordInput";

export default function MaterialUIPasswordInput({
    config,
    error,
    onChange,
}: {
    config: PasswordInput;
    error: null | string;
    onChange: (id: string, value: unknown) => void;
}) {
    return (
        <TextField
            type="password"
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
