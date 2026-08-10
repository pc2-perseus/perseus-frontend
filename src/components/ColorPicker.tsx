// React imports
import React from "react";

// MUI imports
import { Box, FormControlLabel, Radio, RadioGroup } from "@mui/material";

interface ColorPickerProps {
    value: string | null;
    onChange: (color: string | null) => void;
    compact?: boolean;
}

export default function ColorPicker({
    value,
    onChange,
    compact = false,
}: ColorPickerProps): React.ReactElement {
    return (
        <RadioGroup
            row
            value={value === null ? "false" : "true"}
            onChange={(e) => {
                onChange(
                    (e.target as HTMLInputElement).value === "false"
                        ? null
                        : "#ffffff"
                );
            }}
            sx={{
                flexWrap: compact ? "wrap" : undefined,
                alignItems: "center",
                gap: compact ? 0.5 : 1,
            }}
        >
            <FormControlLabel
                control={<Radio size={compact ? "small" : "medium"} />}
                label={compact ? "None" : "no color"}
                value="false"
                sx={{
                    mr: compact ? 0.5 : 1,
                    ".MuiFormControlLabel-label": {
                        fontSize: compact ? "0.75rem" : undefined,
                    },
                }}
            />
            <FormControlLabel
                control={<Radio size={compact ? "small" : "medium"} />}
                label={compact ? "Set" : "color"}
                value="true"
                sx={{
                    mr: compact ? 0.5 : 1,
                    ".MuiFormControlLabel-label": {
                        fontSize: compact ? "0.75rem" : undefined,
                    },
                }}
            />
            <Box sx={{ display: "flex", alignItems: "center" }}>
                <input
                    type="color"
                    disabled={value === null}
                    style={{ opacity: value === null ? "0.25" : undefined }}
                    value={value === null ? "#ffffff" : value}
                    onChange={(e) => onChange(e.currentTarget.value)}
                    width={compact ? 28 : undefined}
                />
            </Box>
        </RadioGroup>
    );
}
