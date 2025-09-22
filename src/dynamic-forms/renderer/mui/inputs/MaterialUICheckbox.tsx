// React imports
import { ChangeEvent } from "react";

// MUI imports
import { Checkbox, FormControlLabel, FormHelperText } from "@mui/material";
import { red } from "@mui/material/colors";

// Custom imports
import CheckboxInput from "../../../interfaces/inputs/CheckboxInput";

export default function MaterialUICheckbox({
    config,
    error,
    onChange,
}: {
    config: CheckboxInput;
    error: null | string;
    onChange: (id: string, value: unknown) => void;
}) {
    return (
        <>
            <FormControlLabel
                control={
                    <Checkbox
                        required={config.required}
                        checked={
                            config.value == undefined ? false : config.value
                        }
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            onChange(config.id, event.currentTarget.checked);
                        }}
                        sx={{
                            color: error !== null ? red[500] : undefined,
                            "&.Mui-checked": {
                                color: error !== null ? red[500] : undefined,
                            },
                        }}
                    />
                }
                label={config.label}
            />
            <FormHelperText
                sx={{
                    ml: 4,
                    mt: -1,
                    color: error !== null ? red[500] : undefined,
                }}
            >
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
            </FormHelperText>
        </>
    );
}
