// React imports
import React from "react";

// MUI imports
import dayjs, { Dayjs } from "dayjs";
import { DateTimePicker } from "@mui/x-date-pickers";

export default function RuntimeSelector({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string | null;
    onChange: (value: Dayjs | null) => void;
}): React.ReactElement {
    const [currentValue, setCurrentValue] = React.useState<Dayjs | null>(
        dayjs(value)
    );

    return (
        <DateTimePicker
            label={label}
            value={currentValue}
            timezone="UTC"
            slotProps={{
                textField: { fullWidth: true },
            }}
            onChange={(newValue: Dayjs | null) => {
                setCurrentValue(newValue);
                onChange(newValue);
            }}
        />
    );
}
