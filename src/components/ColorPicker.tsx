// React imports
import React from "react";

// MUI imports
import { Box, FormControlLabel, Radio, RadioGroup } from "@mui/material";

interface ColorPickerProps {
    value: string | null;
    onChange: (color: string | null) => void;
}

export default function ColorPicker({
    value,
    onChange,
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
        >
            <FormControlLabel
                control={<Radio />}
                label="no color"
                value="false"
            />
            <FormControlLabel
                control={<Radio />}
                label="color"
                value="true"
            />
            <Box sx={{ display: "flex", alignItems: "center" }}>
                <input
                    type="color"
                    disabled={value === null}
                    style={{ opacity: value === null ? "0.25" : undefined }}
                    value={value === null ? "#ffffff" : value}
                    onChange={(e) => onChange(e.currentTarget.value)}
                />
            </Box>
        </RadioGroup>
    );
}
