// MUI imports
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Custom imports
import DateTimeInput from "../../../interfaces/inputs/DateTimeInput";

// Other imports
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/de";
import utc from "dayjs/plugin/utc";
import updateLocale from "dayjs/plugin/updateLocale";

dayjs.extend(utc);
dayjs.extend(updateLocale);
dayjs.updateLocale("de", {
    weekStart: 1,
});

export default function MaterialUIDateTimePicker({
    config,
    error,
    onChange,
}: {
    config: DateTimeInput;
    error: null | string;
    onChange: (id: string, value: unknown) => void;
}) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
            <DateTimePicker
                label={config.label}
                value={
                    config.value === undefined
                        ? null
                        : dayjs(
                              new Date(
                                  dayjs(config.value).utc().year(),
                                  dayjs(config.value).utc().month(),
                                  dayjs(config.value).utc().date(),
                                  dayjs(config.value).utc().hour(),
                                  dayjs(config.value).utc().minute(),
                                  dayjs(config.value).utc().second(),
                                  dayjs(config.value).utc().millisecond()
                              )
                          )
                }
                onChange={(value: Dayjs | null) => {
                    onChange(
                        config.id,
                        value === null
                            ? null
                            : new Date(
                                  Date.UTC(
                                      value.year(),
                                      value.month(),
                                      value.date(),
                                      value.hour(),
                                      value.minute(),
                                      value.second(),
                                      value.millisecond()
                                  )
                              ).toISOString()
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
