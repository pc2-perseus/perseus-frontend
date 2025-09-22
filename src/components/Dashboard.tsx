// React imports
import React from "react";
import { Typography } from "@mui/material";

// MUI imports

export default function Dashboard(): React.ReactElement {
    return (
        <>
            <Typography variant="h3" component="h1" sx={{ mb: 2 }}>
                Welcome to PERSEUS.
            </Typography>
            Dashboard functionality will be added in one of the upcoming
            versions.
        </>
    );
}
