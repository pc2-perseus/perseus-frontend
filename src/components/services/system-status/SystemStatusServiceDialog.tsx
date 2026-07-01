import React from "react";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import SystemStatusService from "../../../interfaces/SystemStatusService.ts";
import { SystemStatusResourceOption } from "./systemStatusUtils.ts";

export default function SystemStatusServiceDialog({
    open,
    title,
    service,
    resourceOptions,
    error,
    submitting,
    onClose,
    onSubmit,
    onDeactivate,
}: {
    open: boolean;
    title: string;
    service: SystemStatusService | null;
    resourceOptions: SystemStatusResourceOption[];
    error: string;
    submitting: boolean;
    onClose: () => void;
    onSubmit: (service: SystemStatusService) => void;
    onDeactivate: (() => void) | null;
}): React.ReactElement {
    const [currentService, setCurrentService] =
        React.useState<SystemStatusService | null>(null);
    const [displayRankInput, setDisplayRankInput] = React.useState<string>("0");

    React.useEffect(() => {
        if (service === null) {
            setCurrentService(null);
            setDisplayRankInput("0");
            return;
        }

        setCurrentService(structuredClone(service));
        setDisplayRankInput(service.display_rank.toString());
    }, [service, open]);

    const validationError: string =
        currentService === null
            ? ""
            : currentService.name.trim().length === 0
              ? "Name is required."
              : displayRankInput.trim().length === 0 ||
                  Number.isNaN(Number(displayRankInput))
                ? "Display rank must be a valid integer."
                : !Number.isInteger(Number(displayRankInput))
                  ? "Display rank must be a valid integer."
                  : "";

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {currentService?._id === null
                    ? "Add service"
                    : "Update service"}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        {title}
                    </Typography>
                    {(error.length > 0 || validationError.length > 0) && (
                        <Alert severity="error">
                            {validationError.length > 0
                                ? validationError
                                : error}
                        </Alert>
                    )}
                    <TextField
                        label="Name"
                        value={currentService?.name ?? ""}
                        onChange={(event) => {
                            if (currentService === null) {
                                return;
                            }

                            setCurrentService({
                                ...currentService,
                                name: event.currentTarget.value,
                            });
                        }}
                        fullWidth
                        autoComplete="off"
                    />
                    <FormControl fullWidth>
                        <InputLabel id="system-status-linked-resource-label">
                            Linked resource
                        </InputLabel>
                        <Select
                            labelId="system-status-linked-resource-label"
                            label="Linked resource"
                            value={currentService?.linked_resource_id ?? ""}
                            onChange={(event) => {
                                if (currentService === null) {
                                    return;
                                }

                                setCurrentService({
                                    ...currentService,
                                    linked_resource_id:
                                        event.target.value === ""
                                            ? null
                                            : event.target.value,
                                });
                            }}
                        >
                            <MenuItem value="">None</MenuItem>
                            {resourceOptions.map(
                                (resource: SystemStatusResourceOption) => (
                                    <MenuItem
                                        key={resource.id}
                                        value={resource.id}
                                    >
                                        {resource.label}
                                    </MenuItem>
                                )
                            )}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Display rank"
                        value={displayRankInput}
                        onChange={(event) => {
                            setDisplayRankInput(event.currentTarget.value);
                            if (currentService === null) {
                                return;
                            }

                            setCurrentService({
                                ...currentService,
                                display_rank: Number(event.currentTarget.value),
                            });
                        }}
                        fullWidth
                        autoComplete="off"
                    />
                </Stack>
            </DialogContent>
            <DialogActions
                sx={{ justifyContent: "space-between", px: 3, pb: 3 }}
            >
                <Box>
                    {onDeactivate !== null && (
                        <Button color="error" onClick={onDeactivate}>
                            Mark inactive
                        </Button>
                    )}
                </Box>
                <Box>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        variant="contained"
                        disabled={
                            currentService === null ||
                            validationError.length > 0 ||
                            submitting
                        }
                        onClick={() => {
                            if (currentService !== null) {
                                onSubmit({
                                    ...currentService,
                                    display_rank: Number(displayRankInput),
                                });
                            }
                        }}
                    >
                        Save
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}
