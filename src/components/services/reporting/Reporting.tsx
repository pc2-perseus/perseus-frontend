// React imports
import React from "react";

// MUI imports
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Paper,
    Radio,
    RadioGroup,
    Stack,
    Typography,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Custom imports
import ReportingItem from "../../../interfaces/ReportingItem.ts";
import getReportingItems from "../../../api/reporting/getReportingItems.ts";

// Other imports
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/de";
import Report from "./Report.tsx";
import { useNavigate } from "react-router-dom";
import LoadingBar from "../../LoadingBar.tsx";

export default function Reporting({
    report,
}: {
    report?: string;
}): React.ReactElement {
    const [loading, setLoading] = React.useState<boolean>(true);
    const [reportingItems, setReportingItems] = React.useState<ReportingItem[]>(
        []
    );
    const [showDialog, setShowDialog] = React.useState<boolean>(false);
    const [timeFrameStart, setTimeFrameStart] = React.useState<Dayjs>(dayjs());
    const [useTimeFrame, setUseTimeFrame] = React.useState<"all" | "custom">(
        "all"
    );
    const [timeFrameEnd, setTimeFrameEnd] = React.useState<Dayjs>(
        dayjs().add(1, "year")
    );
    const [selectedReportingItem, setSelectedReportingItem] =
        React.useState<ReportingItem | null>(null);

    const navigate = useNavigate();

    function closeDialog() {
        setShowDialog(false);
        setUseTimeFrame("all");
        setTimeFrameStart(dayjs());
        setTimeFrameEnd(dayjs().add(1, "year"));
        setSelectedReportingItem(null);
    }

    function gotoReport() {
        closeDialog();
        if (selectedReportingItem !== null) {
            if (
                selectedReportingItem.allow_time_frame &&
                useTimeFrame === "custom" &&
                (timeFrameStart !== null || timeFrameEnd !== null)
            ) {
                const start: string =
                    timeFrameStart === null
                        ? ""
                        : timeFrameStart.toDate().toISOString();
                const end: string =
                    timeFrameEnd === null
                        ? ""
                        : timeFrameEnd.toDate().toISOString();
                navigate(
                    "/Reporting/" +
                        selectedReportingItem._id +
                        "#start=" +
                        start +
                        ";end=" +
                        end
                );
            } else {
                navigate("/Reporting/" + selectedReportingItem._id);
            }
        }
    }

    React.useEffect(() => {
        if (selectedReportingItem !== null) {
            if (selectedReportingItem.allow_time_frame) {
                setUseTimeFrame("all");
                setShowDialog(true);
            } else {
                gotoReport();
            }
        }
    }, [selectedReportingItem]);

    React.useEffect(() => {
        getReportingItems().then((result: ReportingItem[]) => {
            setReportingItems(result);
            setLoading(false);
        });
    }, []);

    if (report !== undefined) {
        return <Report reportId={report} />;
    }

    if (loading) {
        return <LoadingBar />;
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            {reportingItems.map((reportingItem: ReportingItem) => {
                return (
                    <Paper
                        elevation={16}
                        sx={{ p: 2, my: 1, pb: "50px" }}
                        key={reportingItem._id}
                    >
                        <Typography variant="h6">
                            {reportingItem.name}
                        </Typography>
                        <Typography
                            sx={{ fontSize: 14 }}
                            color="text.secondary"
                            gutterBottom
                        >
                            {reportingItem.description}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ float: "right" }}
                            onClick={() => {
                                setSelectedReportingItem(reportingItem);
                            }}
                        >
                            Create report
                        </Button>
                    </Paper>
                );
            })}
            <Dialog
                open={showDialog}
                onClose={closeDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Select time frame</DialogTitle>
                <DialogContent>
                    <RadioGroup
                        value={useTimeFrame}
                        onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                            setUseTimeFrame(
                                event.currentTarget.value as "all" | "custom"
                            );
                        }}
                    >
                        <FormControlLabel
                            control={<Radio />}
                            value="all"
                            label="Use largest time frame"
                        />
                        <FormControlLabel
                            control={<Radio />}
                            value="custom"
                            label="Use custom time frame"
                        />
                    </RadioGroup>
                    <Stack
                        spacing={2}
                        sx={{
                            mt: 2,
                            display:
                                useTimeFrame === "all" ? "none" : undefined,
                        }}
                    >
                        <DateTimePicker
                            value={timeFrameStart}
                            onChange={(value: Dayjs | null) => {
                                setTimeFrameStart(
                                    value === null ? dayjs() : value
                                );
                            }}
                            label="Time frame start"
                            slotProps={{
                                textField: {
                                    size: "small",
                                    fullWidth: true,
                                },
                            }}
                        />
                        <DateTimePicker
                            value={timeFrameEnd}
                            onChange={(value: Dayjs | null) => {
                                setTimeFrameEnd(
                                    value === null
                                        ? dayjs().add(1, "year")
                                        : value
                                );
                            }}
                            label="Time frame end"
                            slotProps={{
                                textField: {
                                    size: "small",
                                    fullWidth: true,
                                    placeholder: "End",
                                },
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Cancel</Button>
                    <Button variant="contained" onClick={gotoReport}>
                        Create report
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}
