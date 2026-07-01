// React imports
import React from "react";

// MUI imports
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    MenuItem,
    Select,
    TableCell,
    TableRow,
    TextField,
} from "@mui/material";

// Custom imports
import { LoadingAction } from "./utils.ts";

export default function AndromedaModuleRow({
    moduleName,
    enabled,
    loadingAction,
    draft,
    error,
    success,
    onToggle,
    onDraftChange,
    onUpdateConfiguration,
}: {
    moduleName: string;
    enabled: boolean;
    loadingAction: LoadingAction;
    draft: string;
    error: string;
    success: string;
    onToggle: (enabled: boolean) => void;
    onDraftChange: (value: string) => void;
    onUpdateConfiguration: () => void;
}): React.ReactElement {
    const isLoading = loadingAction !== null;

    return (
        <TableRow
            sx={{
                verticalAlign: "top",
            }}
        >
            <TableCell>{moduleName}</TableCell>
            <TableCell>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    <Select
                        size="small"
                        value={enabled ? "enabled" : "disabled"}
                        disabled={isLoading}
                        onChange={(e) => onToggle(e.target.value === "enabled")}
                    >
                        <MenuItem value="enabled">enabled</MenuItem>
                        <MenuItem value="disabled">disabled</MenuItem>
                    </Select>
                    {loadingAction === "toggle" && (
                        <CircularProgress size={20} />
                    )}
                </Box>
            </TableCell>
            <TableCell>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                    }}
                >
                    <TextField
                        fullWidth
                        multiline
                        minRows={6}
                        maxRows={16}
                        value={draft}
                        disabled={isLoading}
                        error={error.length > 0}
                        helperText={
                            error.length > 0
                                ? error
                                : "Edit the raw JSON object for this module."
                        }
                        onChange={(e) => onDraftChange(e.target.value)}
                    />
                    {success.length > 0 && (
                        <Alert severity="success" variant="outlined">
                            {success}
                        </Alert>
                    )}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        <Button
                            variant="contained"
                            disabled={isLoading}
                            onClick={onUpdateConfiguration}
                        >
                            Update configuration
                        </Button>
                        {loadingAction === "config" && (
                            <CircularProgress size={20} />
                        )}
                    </Box>
                </Box>
            </TableCell>
        </TableRow>
    );
}
