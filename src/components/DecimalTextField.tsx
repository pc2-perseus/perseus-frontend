import React from "react";
import { TextField, TextFieldProps } from "@mui/material";

function cleanInput(value: string): string {
    let normalized = value.replace(",", "."); //Convert comma to dot
    normalized = normalized.replace(/[^\d.]/g, "");  // Remove anything that isn't a digit or a dot
    const parts = normalized.split(".");  // Prevent multiple dots
    if (parts.length > 2) {
        normalized = parts[0] + "." + parts.slice(1).join("");
    }
    // Fix leading zeros
    if (/^0[0-9]/.test(normalized)) {
        normalized = normalized.replace(/^0+/, "");
        if (normalized === "" || normalized.startsWith(".")) {
            normalized = "0" + normalized;
        }
    }

    return normalized;
}

type DecimalTextFieldProps = Omit<
    TextFieldProps,
    "value" | "onChange" | "inputProps"
> & {
    value: string;
    onValueChange: (value: string) => void;
};

export default function DecimalTextField({
    value,
    onValueChange,
    ...textFieldProps
}: DecimalTextFieldProps): React.ReactElement {
    const [displayValue, setDisplayValue] = React.useState<string>(value);
    const [isEditing, setIsEditing] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (!isEditing && value !== displayValue) {
            setDisplayValue(value);
        }
    }, [displayValue, isEditing, value]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = event.target.value;
        const sanitized = cleanInput(rawValue);

        setDisplayValue(sanitized);
        // Only notify the parent if it's a valid "final" number 
        if (sanitized !== "" && sanitized !== ".") {
            onValueChange(sanitized);
        } else if (sanitized === "") {
            onValueChange("");
        }
    };

    return (
        <TextField
            {...textFieldProps}
            type="text"
            value={displayValue}
            onFocus={(e) => {
                setIsEditing(true);
                textFieldProps.onFocus?.(e);
            }}
            onChange={handleChange}
            onBlur={(e) => {
                const finalValue = displayValue.endsWith(".")
                    ? displayValue.slice(0, -1)
                    : displayValue;

                setIsEditing(false);
                setDisplayValue(finalValue);
                onValueChange(finalValue);
                textFieldProps.onBlur?.(e);
            }}
            slotProps={{
                ...textFieldProps.slotProps,
                htmlInput: {
                    inputMode: "decimal",
                    pattern: "[0-9]*[.,]?[0-9]*",
                    ...textFieldProps.slotProps?.htmlInput,
                },
            }}
        />
    );
}
