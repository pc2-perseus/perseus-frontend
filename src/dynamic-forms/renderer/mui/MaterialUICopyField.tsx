// React imports
import React from "react";

// MUI imports
import { Box, TextField, Tooltip } from "@mui/material";
import IconButton from "@mui/material/IconButton";

// Icon imports
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

// Custom imports
import CopyItem from "../../interfaces/CopyItem";

export default function MaterialUICopyField({ config }: { config: CopyItem }) {
    const [showTooltip, updateShowTooltip] = React.useState<boolean>(false);
    return (
        <TextField
            type="text"
            multiline
            fullWidth
            label={config.label}
            helperText={config.helperText}
            value={config.value === undefined ? null : config.value}
            InputProps={{
                readOnly: true,
                endAdornment: (
                    <Box
                        sx={{
                            position: "absolute",
                            right: "10px",
                            top: "10px",
                            fontSize: "1em",
                        }}
                    >
                        <Tooltip
                            PopperProps={{
                                disablePortal: true,
                            }}
                            onClose={() => {
                                updateShowTooltip(false);
                            }}
                            open={showTooltip}
                            disableFocusListener
                            disableHoverListener
                            disableTouchListener
                            placement="left"
                            title="Copied"
                        >
                            <IconButton
                                onClick={() => {
                                    navigator.clipboard
                                        .writeText(config.value)
                                        .then(() => {
                                            updateShowTooltip(true);
                                            window.setTimeout(() => {
                                                updateShowTooltip(false);
                                            }, 3000);
                                        });
                                }}
                            >
                                <ContentCopyIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                ),
            }}
        />
    );
}
