// React imports
import React, { useState } from "react";

// MUI imports
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from "@mui/material";

// Icon imports
import AddIcon from "@mui/icons-material/Add";

export default function AddNote({
    onSubmit,
}: {
    onSubmit: (note: string) => void;
}): React.ReactElement {
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [note, setNote] = React.useState<string>("");
    return (
        <>
            <Button
                variant="contained"
                onClick={() => {
                    setNote("");
                    setShowDialog(true);
                }}
            >
                <AddIcon />
                Add note
            </Button>
            <Dialog
                open={showDialog}
                onClose={() => {
                    setNote("");
                    setShowDialog(false);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Add note</DialogTitle>
                <DialogContent>
                    <TextField
                        multiline={true}
                        placeholder="Add note here..."
                        value={note}
                        onChange={(e) => setNote(e.currentTarget.value)}
                        rows={4}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setNote("");
                            setShowDialog(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            onSubmit(note);
                            setShowDialog(false);
                        }}
                    >
                        Add note
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
