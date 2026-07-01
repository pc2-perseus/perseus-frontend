import React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";

export default function SystemStatusConfirmDialog({
    open,
    title,
    description,
    actionLabel,
    onClose,
    onConfirm,
}: {
    open: boolean;
    title: string;
    description: string;
    actionLabel: string;
    onClose: () => void;
    onConfirm: () => void;
}): React.ReactElement {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{description}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" color="error" onClick={onConfirm}>
                    {actionLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
