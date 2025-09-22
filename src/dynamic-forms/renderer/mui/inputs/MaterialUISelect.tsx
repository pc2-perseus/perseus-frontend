// React imports
import { SyntheticEvent } from "react";

// MUI imports
import {
    Autocomplete,
    AutocompleteRenderInputParams,
    FormHelperText,
    TextField,
} from "@mui/material";
import { red } from "@mui/material/colors";

// Custom imports
import SelectInput from "../../../interfaces/inputs/SelectInput";

export default function MaterialUISelect({
    config,
    error,
    onChange,
}: {
    config: SelectInput;
    error: null | string;
    onChange: (id: string, value: unknown) => void;
}) {
    return (
        <>
            <Autocomplete
                disablePortal
                renderInput={(params: AutocompleteRenderInputParams) => {
                    return (
                        <TextField
                            {...params}
                            label={config.label}
                            inputProps={{
                                ...params.inputProps,
                                autoComplete: "off",
                            }}
                            required={config.required}
                            error={error !== null}
                        />
                    );
                }}
                options={config.options}
                onChange={(
                    _event: SyntheticEvent,
                    value: { label: string; value: string } | null
                ) => {
                    onChange(config.id, value !== null ? value.value : null);
                }}
                value={
                    config.value === undefined
                        ? null
                        : config.options.filter(
                              (option: { label: string; value: string }) => {
                                  return option.value === config.value;
                              }
                          )[0]
                }
                isOptionEqualToValue={(
                    option: { label: string; value: string },
                    value: { label: string; value: string }
                ): boolean => {
                    return value.value === option.value;
                }}
            />
            <FormHelperText
                sx={{ ml: 2, color: error !== null ? red[500] : undefined }}
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
