// React imports
import React from "react";

// MUI imports
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";

// Custom imports
import EmailTemplate from "../../../interfaces/EmailTemplate.ts";

export default function DeleteDialog({
    onHide,
    onDelete,
    template,
}: {
    onHide: () => void;
    onDelete: () => void;
    template: EmailTemplate | null;
}): React.ReactElement {
    return (
        <Dialog
            open={template !== null}
            onClose={onHide}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>Email template: {template?.name}</DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to delete the email template?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onHide}>Back</Button>
                <Button onClick={onDelete} variant="contained" color="primary">
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
