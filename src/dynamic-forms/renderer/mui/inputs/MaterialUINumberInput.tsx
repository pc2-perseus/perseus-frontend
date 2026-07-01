// Custom imports
import NumberInput from "../../../interfaces/inputs/NumberInput";
import DecimalTextField from "../../../../components/DecimalTextField.tsx";
import { decimalInputToNumber } from "../../../../utils/decimalUnits.ts";

export default function MaterialUINumberInput({
    config,
    error,
    onChange,
}: {
    config: NumberInput;
    error: null | string;
    onChange: (id: string, value: unknown) => void;
}) {
    return (
        <DecimalTextField
            fullWidth
            label={config.label}
            helperText={
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
            }
            value={String(config.value ?? "")}
            required={config.required}
            onValueChange={(value: string) => {
                onChange(
                    config.id,
                    value === "" ? "" : decimalInputToNumber(value)
                );
            }}
            error={error !== null}
        />
    );
}
