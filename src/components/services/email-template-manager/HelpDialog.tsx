// React imports
import React from "react";

// MUI imports
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

export default function HelpDialog({
    show,
    onHide,
}: {
    show: boolean;
    onHide: () => void;
}): React.ReactElement {
    const helpItems: {
        attribute: string;
        example: string | React.ReactElement;
        note?: string;
    }[] = [
        {
            attribute: "oid",
            example: "67af092f16acaef502c903ce",
        },
        {
            attribute: "greeting",
            example:
                "Dear Prof. Dr. Erika Musterfrau and Max Mustermann / Dear Dr. Max Mustermann",
            note: "will display only the PI if PI and PC are the same",
        },
        {
            attribute: "start",
            example: "01.08.2025",
            note: "Format: DD.MM.YYYY",
        },
        {
            attribute: "end",
            example: "31.07.2026",
            note: "Format: DD.MM.YYYY",
        },
        {
            attribute: "requested_resource_list",
            example: (
                <>
                    01.04.2023 - 31.03.2024
                    <br />
                    Isilon, PC2DATA: 20000 GB
                    <br />
                    Noctua 2, CPU core hours: 14.9 million
                    <br />
                    Noctua 2, PC2PFS: 20000 GB
                    <br />
                    <br />
                    01.04.2024 - 31.03.2025
                    <br />
                    Isilon, PC2DATA: 20000 GB
                    <br />
                    Noctua 2, CPU core hours: 14.9 million
                    <br />
                    Noctua 2, PC2PFS: 20000 GB
                </>
            ),
        },
        {
            attribute: "granted_resource_list",
            example: "see {requested_resource_list}",
        },
        {
            attribute: "project.abbreviation",
            example: "hpc-prf-abc",
        },
        {
            attribute: "project.title",
            example: "Calculation of the Mandelbrot",
        },
        {
            attribute: "project.description",
            example: "My project has to do with a lot of HPC.",
        },
        {
            attribute: "project.project_type",
            example: "large",
        },
        {
            attribute: "project.call",
            example: "2025-02",
        },
        {
            attribute: "pi.title",
            example: "Prof. Dr.",
        },
        {
            attribute: "pi.firstname",
            example: "Erika",
        },
        {
            attribute: "pi.lastname",
            example: "Musterfrau",
        },
        {
            attribute: "pi.email",
            example: "example@mail.com",
        },
        {
            attribute: "pi.phone",
            example: "+495251604524",
        },
        {
            attribute: "pi.homepage",
            example: "https://www.uni-paderborn.de/person/69976",
        },
        {
            attribute: "pi.title",
            example: "Dr.",
        },
        {
            attribute: "pi.firstname",
            example: "Max",
        },
        {
            attribute: "pi.lastname",
            example: "Mustermann",
        },
        {
            attribute: "pi.email",
            example: "example@mail.com",
        },
        {
            attribute: "pi.phone",
            example: "+495251604524",
        },
        {
            attribute: "pi.homepage",
            example: "https://www.uni-paderborn.de/person/69976",
        },
    ];

    return (
        <Dialog open={show} onClose={onHide} maxWidth="md" fullWidth>
            <DialogTitle>Help</DialogTitle>
            <DialogContent>
                <Typography variant="h5" sx={{ my: 2 }}>
                    Available template attributes
                </Typography>
                <TableContainer component={Paper}>
                    <Table
                        sx={{ width: "100%" }}
                        size="small"
                        aria-label="available template attributes"
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell>Template attribute</TableCell>
                                <TableCell>Example</TableCell>
                                <TableCell>Note</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {helpItems.map(
                                (
                                    item: {
                                        attribute: string;
                                        example: string | React.ReactElement;
                                        note?: string;
                                    },
                                    index: number
                                ) => {
                                    const borderStyle: string | undefined =
                                        index + 1 === helpItems.length
                                            ? "none"
                                            : undefined;
                                    return (
                                        <TableRow key={item.attribute}>
                                            <TableCell
                                                sx={{
                                                    borderBottom: borderStyle,
                                                }}
                                            >
                                                <code>
                                                    {`{${item.attribute}}`}
                                                </code>
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    borderBottom: borderStyle,
                                                }}
                                            >
                                                {item.example}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    borderBottom: borderStyle,
                                                }}
                                            >
                                                {item.note}
                                            </TableCell>
                                        </TableRow>
                                    );
                                }
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onHide}>Back</Button>
            </DialogActions>
        </Dialog>
    );
}
