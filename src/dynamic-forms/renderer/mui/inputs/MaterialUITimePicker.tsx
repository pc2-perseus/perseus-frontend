// MUI imports
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Custom imports
import TimeInput from "../../../interfaces/inputs/TimeInput";

// Other imports
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/de";

export default function MaterialUITimePicker({
    config,
    error,
    onChange,
}: {
    config: TimeInput;
    error: null | string;
    onChange: (id: string, value: unknown) => void;
}) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
                label={config.label}
                value={
                    config.value === undefined
                        ? null
                        : dayjs(config.value, "HH:mm:ss")
                }
                onChange={(value: Dayjs | null) => {
                    onChange(
                        config.id,
                        value === null ? value : value.toDate()
                    );
                }}
                slotProps={{
                    textField: {
                        required: config.required,
                        helperText: (
                            <>
                                {error !== null && error.length > 0 ? (
                                    <>
                                        {error}
                                        <br />
                                    </>
                                ) : (
                                    ""
                                )}
                                {config.helperText}
                            </>
                        ),
                        error: error !== null,
                    },
                }}
            />
        </LocalizationProvider>
    );
}
