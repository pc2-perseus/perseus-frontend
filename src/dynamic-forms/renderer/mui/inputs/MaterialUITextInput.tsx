// React imports
import { ChangeEvent } from "react";

// MUI imports
import { TextField } from "@mui/material";

// Custom imports
import TextInput from "../../../interfaces/inputs/TextInput";

export default function MaterialUITextInput({
    config,
    error,
    onChange,
}: {
    config: TextInput;
    error: null | string;
    onChange: (id: string, value: unknown) => void;
}) {
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
            value={config.value === undefined ? "" : config.value}
            required={config.required}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                onChange(config.id, event.currentTarget.value);
            }}
            error={error !== null}
        />
    );
}
