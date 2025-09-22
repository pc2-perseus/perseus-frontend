// React imports
import { ChangeEvent } from "react";

// MUI imports
import { TextField } from "@mui/material";

// Custom imports
import TextAreaInput from "../../../interfaces/inputs/TextAreaInput";

export default function MaterialUITextArea({
    config,
    error,
    onChange,
}: {
    config: TextAreaInput;
    error: null | string;
    onChange: (id: string, value: unknown) => void;
}) {
    return (
        <TextField
            type="text"
            multiline
            rows={
                4 +
                (config.value === undefined
                    ? 0
                    : (config.value.match(/\n/g) || []).length - 2)
            }
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
