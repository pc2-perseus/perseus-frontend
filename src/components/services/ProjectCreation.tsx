// React imports
import React from "react";

// MUI imports
import { Autocomplete, Button, Stack, TextField } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

// Other imports
import dayjs, { Dayjs } from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import "dayjs/locale/de";
import utc from "dayjs/plugin/utc";
import postProjectCreate from "../../api/postProjectCreate.ts";
import getProjectCreateOptions from "../../api/getProjectCreateOptions.ts";

dayjs.extend(utc);
dayjs.extend(updateLocale);
dayjs.updateLocale("de", {
    weekStart: 1,
});

export default function ProjectCreation(): React.ReactElement {
    const [title, setTitle] = React.useState<string>("");
    const [abbreviation, setAbbreviation] = React.useState<string>("");
    const [start, setStart] = React.useState<Dayjs | null>(null);
    const [end, setEnd] = React.useState<Dayjs | null>(null);
    const [type, setType] = React.useState<string>("");
    const [call, setCall] = React.useState<string>("");

    const [availableTypes, setAvailableTypes] = React.useState<string[]>([]);
    const [availableCalls, setAvailableCalls] = React.useState<string[]>([]);

    function createProject() {
        if (start !== null && end !== null) {
            postProjectCreate(
                title,
                abbreviation,
                start.toISOString(),
                end.add(1, "d").subtract(1, "s").toISOString(),
                type,
                call
            ).then((oid) => {
                if (oid !== null) {
                    window.location.href = `${import.meta.env.BASE_URL}ProjectEdit/${oid}`;
                }
            });
        }
    }

    React.useEffect(() => {
        getProjectCreateOptions().then((result) => {
            setAvailableCalls(result.calls);
            setAvailableTypes(result.types);
        });
    }, []);

    return (
        <>
            <Stack spacing={2}>
                <TextField
                    variant="outlined"
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.currentTarget.value)}
                    fullWidth
                />
                <TextField
                    variant="outlined"
                    label="Abbreviation"
                    value={abbreviation}
                    onChange={(e) => setAbbreviation(e.currentTarget.value)}
                    fullWidth
                />
                <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale="de"
                >
                    <DatePicker
                        label="Start"
                        slotProps={{ textField: { fullWidth: true } }}
                        sx={{ mt: 2 }}
                        value={start}
                        timezone="UTC"
                        onChange={(newValue) => {
                            setStart(newValue);
                            if (newValue !== null) {
                                setEnd(newValue.add(1, "y").subtract(1, "d"));
                            }
                            return;
                        }}
                    />
                </LocalizationProvider>
                <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale="de"
                >
                    <DatePicker
                        label="End"
                        slotProps={{ textField: { fullWidth: true } }}
                        sx={{ mt: 2 }}
                        value={end}
                        timezone="UTC"
                        onChange={(newValue) => setEnd(newValue)}
                    />
                </LocalizationProvider>
                <Autocomplete
                    renderInput={(params) => (
                        <TextField {...params} label="Type" />
                    )}
                    options={availableTypes}
                    value={type}
                    freeSolo
                    fullWidth
                    onChange={(_, value) => {
                        if (value !== null) {
                            setType(value);
                        }
                    }}
                />
                <Autocomplete
                    renderInput={(params) => (
                        <TextField {...params} label="Call" />
                    )}
                    options={availableCalls}
                    freeSolo
                    value={call}
                    fullWidth
                    onChange={(_, value) => {
                        if (value !== null) {
                            setCall(value);
                        }
                    }}
                />
            </Stack>
            <Button
                variant="contained"
                onClick={createProject}
                sx={{ float: "right", mt: 2 }}
            >
                Add project
            </Button>
        </>
    );
}
