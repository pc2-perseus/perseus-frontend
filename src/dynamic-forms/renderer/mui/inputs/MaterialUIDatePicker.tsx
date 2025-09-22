// MUI imports
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Custom imports
import DateInput from "../../../interfaces/inputs/DateInput";

// Other imports
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/de";

export default function MaterialUIDatePicker({
    config,
    error,
    onChange,
}: {
    config: DateInput;
    error: null | string;
    onChange: (id: string, value: unknown) => void;
}) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                label={config.label}
                value={
                    config.value === undefined
                        ? null
                        : dayjs(config.value, "YYYY-MM-DD")
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
