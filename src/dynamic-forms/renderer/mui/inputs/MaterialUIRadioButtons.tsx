// React imports
import { ChangeEvent } from "react";

// MUI imports
import {
    FormControl,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    Radio,
    RadioGroup,
} from "@mui/material";
import { red } from "@mui/material/colors";

// Custom imports
import RadioInput from "../../../interfaces/inputs/RadioInput";

export default function MaterialUIRadioButtons({
    config,
    error,
    onChange,
}: {
    config: RadioInput;
    error: null | string;
    onChange: (id: string, value: unknown) => void;
}) {
    return (
        <FormControl variant="standard">
            <FormLabel>{config.label}</FormLabel>
            <RadioGroup
                value={config.value === undefined ? null : config.value}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    onChange(config.id, event.currentTarget.value);
                }}
            >
                {config.options.map(
                    (option: { label: string; value: string }) => {
                        return (
                            <FormControlLabel
                                key={option.value}
                                value={option.value}
                                control={
                                    <Radio
                                        required={config.required}
                                        sx={{
                                            color:
                                                error !== null
                                                    ? red[500]
                                                    : undefined,
                                            "&.Mui-checked": {
                                                color:
                                                    error !== null
                                                        ? red[500]
                                                        : undefined,
                                            },
                                        }}
                                    />
                                }
                                label={option.label}
                            />
                        );
                    }
                )}
            </RadioGroup>
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
        </FormControl>
    );
}
