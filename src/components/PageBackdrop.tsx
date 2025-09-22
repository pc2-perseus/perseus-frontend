// React imports
import React from "react";

// MUI imports
import { Backdrop, CircularProgress } from "@mui/material";

export default function PageBackdrop({
    open,
}: {
    open: boolean;
}): React.ReactElement {
    return (
        <Backdrop
            open={open}
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
            <CircularProgress color="primary" />
        </Backdrop>
    );
}
