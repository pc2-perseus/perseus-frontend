import React from "react";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import SystemStatusEntry from "../../../interfaces/SystemStatusEntry.ts";
import SystemStatusCategory from "../../../interfaces/SystemStatusCategory.ts";
import { SYSTEM_STATUS_CATEGORY_ORDER } from "./systemStatusDefaults.ts";
import { SystemStatusServiceOption } from "./systemStatusUtils.ts";

export default function SystemStatusEntryDialog({
    open,
    entry,
    services,
    error,
    submitting,
    onClose,
    onSubmit,
    onDelete,
}: {
    open: boolean;
    entry: SystemStatusEntry | null;
    services: SystemStatusServiceOption[];
    error: string;
    submitting: boolean;
    onClose: () => void;
    onSubmit: (entry: SystemStatusEntry) => void;
    onDelete: (() => void) | null;
}): React.ReactElement {
    const [currentEntry, setCurrentEntry] =
        React.useState<SystemStatusEntry | null>(null);

    React.useEffect(() => {
        if (entry === null) {
            setCurrentEntry(null);
            return;
        }

        setCurrentEntry(structuredClone(entry));
    }, [entry, open]);

    const selectedServices: SystemStatusServiceOption[] =
        currentEntry === null
            ? []
            : services.filter((service: SystemStatusServiceOption) =>
                  currentEntry.service_oids.includes(service.id)
              );

    function updateDate(field: "start" | "end", value: Dayjs | null) {
        if (currentEntry === null) {
            return;
        }

        setCurrentEntry({
            ...currentEntry,
            [field]: value === null ? null : value.toDate().toISOString(),
        });
    }

    const validationError: string =
        currentEntry === null
            ? ""
            : currentEntry.title.trim().length === 0
              ? "Title is required."
              : currentEntry.status_type.trim().length === 0
                ? "Status type is required."
                : currentEntry.start !== null &&
                    currentEntry.end !== null &&
                    Date.parse(currentEntry.start) >
                        Date.parse(currentEntry.end)
                  ? "Start must be before end."
                  : "";

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {currentEntry?._id === null ? "Add entry" : "Update entry"}
            </DialogTitle>
            <DialogContent>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {(error.length > 0 || validationError.length > 0) && (
                            <Alert severity="error">
                                {validationError.length > 0
                                    ? validationError
                                    : error}
                            </Alert>
                        )}
                        <TextField
                            label="Title*"
                            value={currentEntry?.title ?? ""}
                            onChange={(event) => {
                                if (currentEntry === null) {
                                    return;
                                }

                                setCurrentEntry({
                                    ...currentEntry,
                                    title: event.currentTarget.value,
                                });
                            }}
                            fullWidth
                            autoComplete="off"
                        />
                        <Autocomplete
                            multiple
                            options={services}
                            disableCloseOnSelect
                            getOptionLabel={(option) => option.label}
                            value={selectedServices}
                            onChange={(_, value) => {
                                if (currentEntry === null) {
                                    return;
                                }

                                setCurrentEntry({
                                    ...currentEntry,
                                    service_oids: value.map(
                                        (service: SystemStatusServiceOption) =>
                                            service.id
                                    ),
                                });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Affected services"
                                />
                            )}
                        />
                        <FormControl fullWidth>
                            <InputLabel id="system-status-category-label">
                                Category
                            </InputLabel>
                            <Select
                                labelId="system-status-category-label"
                                label="Category"
                                value={currentEntry?.category ?? ""}
                                onChange={(event) => {
                                    if (currentEntry === null) {
                                        return;
                                    }

                                    setCurrentEntry({
                                        ...currentEntry,
                                        category: event.target
                                            .value as SystemStatusCategory,
                                    });
                                }}
                            >
                                {SYSTEM_STATUS_CATEGORY_ORDER.map(
                                    (category: SystemStatusCategory) => (
                                        <MenuItem
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </MenuItem>
                                    )
                                )}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Status type*"
                            value={currentEntry?.status_type ?? ""}
                            onChange={(event) => {
                                if (currentEntry === null) {
                                    return;
                                }

                                setCurrentEntry({
                                    ...currentEntry,
                                    status_type: event.currentTarget.value,
                                });
                            }}
                            fullWidth
                            autoComplete="off"
                        />
                        <Box>
                            <DateTimePicker
                                label="Start"
                                ampm={false}
                                format="DD/MM/YYYY HH:mm"
                                value={
                                    currentEntry?.start === null ||
                                    currentEntry?.start === undefined
                                        ? null
                                        : dayjs(currentEntry.start)
                                }
                                onChange={(value: Dayjs | null) =>
                                    updateDate("start", value)
                                }
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                    },
                                }}
                            />
                        </Box>
                        <Box>
                            <DateTimePicker
                                label="End"
                                ampm={false}
                                format="DD/MM/YYYY HH:mm"
                                value={
                                    currentEntry?.end === null ||
                                    currentEntry?.end === undefined
                                        ? null
                                        : dayjs(currentEntry.end)
                                }
                                onChange={(value: Dayjs | null) =>
                                    updateDate("end", value)
                                }
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                    },
                                }}
                            />
                        </Box>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={
                                        currentEntry?.global_alert ?? false
                                    }
                                    onChange={(event) => {
                                        if (currentEntry === null) {
                                            return;
                                        }

                                        setCurrentEntry({
                                            ...currentEntry,
                                            global_alert:
                                                event.currentTarget.checked,
                                        });
                                    }}
                                />
                            }
                            label="Global alert"
                        />
                        <TextField
                            label="Description"
                            value={currentEntry?.description ?? ""}
                            onChange={(event) => {
                                if (currentEntry === null) {
                                    return;
                                }

                                setCurrentEntry({
                                    ...currentEntry,
                                    description: event.currentTarget.value,
                                });
                            }}
                            helperText="Markdown is supported."
                            multiline
                            minRows={6}
                            fullWidth
                        />
                    </Stack>
                </LocalizationProvider>
            </DialogContent>
            <DialogActions
                sx={{ justifyContent: "space-between", px: 3, pb: 3 }}
            >
                <Box>
                    {onDelete !== null && (
                        <Button color="error" onClick={onDelete}>
                            Delete entry
                        </Button>
                    )}
                </Box>
                <Box>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        variant="contained"
                        disabled={
                            currentEntry === null ||
                            validationError.length > 0 ||
                            submitting
                        }
                        onClick={() => {
                            if (currentEntry !== null) {
                                onSubmit(currentEntry);
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
