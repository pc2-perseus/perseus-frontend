// React imports
import React from "react";

// MUI imports
import {
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Theme,
    useTheme,
} from "@mui/material";

// Custom imports
import getDataDeletionEntries from "../../api/getDataDeletionEntries.ts";
import deleteDataDeletionEntry from "../../api/deleteDataDeletionEntry.ts";
import LoadingBar from "../LoadingBar.tsx";

export interface DataDeletionEntry {
    _id: string;
    project_oid: string;
    key: string;
    deletion_date: string;
}

export default function DataDeletionManager(): React.ReactElement {
    const [loading, setLoading] = React.useState<boolean>(true);
    const [entries, setEntries] = React.useState<DataDeletionEntry[]>([]);
    const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
    const [deletionEntry, setDeletionEntry] =
        React.useState<DataDeletionEntry | null>(null);

    const theme: Theme = useTheme();

    function deleteEntry(entry: DataDeletionEntry | null) {
        if (entry !== null) {
            deleteDataDeletionEntry(entry._id).then((result) => {
                if (result) {
                    getDataDeletionEntries().then((result) => {
                        setEntries(result);
                    });
                }
            });
        }
    }

    React.useEffect(() => {
        getDataDeletionEntries().then((result) => {
            setLoading(false);
            setEntries(result);
        });
    }, []);

    if (loading) {
        return <LoadingBar />;
    }

    return (
        <>
            <Card variant="outlined" sx={{ width: "100%" }}>
                <TableContainer>
                    <Table size="small" sx={{ width: "100%" }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Project</TableCell>
                                <TableCell>Deletion Key</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {entries.map(
                                (entry: DataDeletionEntry, index: number) => {
                                    const borderStyle =
                                        index + 1 === entries.length
                                            ? {
                                                  borderBottomWidth: "0px",
                                              }
                                            : {};
                                    return (
                                        <TableRow key={index}>
                                            <TableCell sx={borderStyle}>
                                                <a
                                                    href={
                                                        "ProjectSearch/" +
                                                        entry.project_oid
                                                    }
                                                    target="_blank"
                                                    style={{
                                                        textDecoration: "none",
                                                        color: theme.palette
                                                            .primary.main,
                                                    }}
                                                >
                                                    {entry.project_oid}
                                                </a>
                                            </TableCell>
                                            <TableCell sx={borderStyle}>
                                                {entry.key}
                                            </TableCell>
                                            <TableCell sx={borderStyle}>
                                                {new Date(
                                                    entry.deletion_date
                                                ).toUTCString()}
                                            </TableCell>
                                            <TableCell sx={borderStyle}>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="error"
                                                    sx={{ float: "right" }}
                                                    onClick={() => {
                                                        setDeletionEntry(entry);
                                                        setDialogOpen(true);
                                                    }}
                                                >
                                                    Keep data beyond that
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                }
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
            <Dialog
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setDeletionEntry(null);
                }}
            >
                <DialogTitle>Please confirm</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure to keep this data? This action may result
                        in breaches of data protection.
                    </DialogContentText>
                    <DialogActions>
                        <Button
                            variant="contained"
                            onClick={() => {
                                setDialogOpen(false);
                                setDeletionEntry(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => {
                                deleteEntry(deletionEntry);
                                setDialogOpen(false);
                                setDeletionEntry(null);
                            }}
                        >
                            Keep data
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        </>
    );
}
