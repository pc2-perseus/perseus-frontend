// React imports
import React from "react";

// MUI imports
import { Box, LinearProgress } from "@mui/material";

// Custom imports
import Icon from "../assets/perseus.svg";

export default function LoadingAnimation({
    message,
}: {
    message?: string;
}): React.ReactElement {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mt: 5,
            }}
        >
            <Box sx={{ width: 600, maxWidth: "95%" }}>
                <Box sx={{ width: "100%", mt: 5 }}>
                    <img
                        src={Icon}
                        alt="Perseus Icon"
                        style={{ width: "100%" }}
                    />
                </Box>
                <Box sx={{ width: "100%", color: "primary.main" }}>
                    <LinearProgress color="inherit" />
                </Box>
                <Box sx={{ width: "100%", textAlign: "center", mt: 1 }}>
                    {message}
                </Box>
            </Box>
        </Box>
    );
}
