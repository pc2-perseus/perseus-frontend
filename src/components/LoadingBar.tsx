// React imports
import React from "react";

// MUI imports
import { Box, LinearProgress } from "@mui/material";

export default function LoadingBar(): React.ReactElement {
    return (
        <Box sx={{ width: "100%" }}>
            <LinearProgress color="primary" />
        </Box>
    );
}
