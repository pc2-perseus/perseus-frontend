import React from "react";
import {
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SystemStatusEntry from "../../../interfaces/SystemStatusEntry.ts";
import { formatSystemStatusDate } from "./systemStatusUtils.ts";

export default function SystemStatusEntriesTable({
    entries,
    onAdd,
    onSelect,
}: {
    entries: SystemStatusEntry[];
    onAdd: () => void;
    onSelect: (entry: SystemStatusEntry) => void;
}): React.ReactElement {
    return (
        <Paper elevation={16} sx={{ p: 2 }}>
            <Typography variant="h5" component="span" gutterBottom>
                Entries
            </Typography>
            <Button
                variant="contained"
                sx={{ float: "right" }}
                startIcon={<AddIcon />}
                onClick={onAdd}
            >
                Add entry
            </Button>
            <TableContainer sx={{ mt: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Status type</TableCell>
                            <TableCell>Start</TableCell>
                            <TableCell>End</TableCell>
                            <TableCell>Global alert</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {entries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6}>
                                    No active system status entries found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            entries.map((entry: SystemStatusEntry) => (
                                <TableRow
                                    key={entry._id ?? entry.title}
                                    hover
                                    sx={{ cursor: "pointer" }}
                                    onClick={() => onSelect(entry)}
                                >
                                    <TableCell>{entry.title}</TableCell>
                                    <TableCell>{entry.category}</TableCell>
                                    <TableCell>{entry.status_type}</TableCell>
                                    <TableCell>
                                        {formatSystemStatusDate(entry.start)}
                                    </TableCell>
                                    <TableCell>
                                        {formatSystemStatusDate(entry.end)}
                                    </TableCell>
                                    <TableCell>
                                        {entry.global_alert ? "Yes" : "No"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}
