// React imports
import { ChangeEvent } from "react";

// MUI imports
import { Button, FormHelperText } from "@mui/material";
import { red } from "@mui/material/colors";

// Icon imports
import UploadFileIcon from "@mui/icons-material/UploadFile";

// Custom imports
import FileInput from "../../../interfaces/inputs/FileInput";

export default function MaterialUIFileUpload({
    config,
    error,
    onChange,
}: {
    config: FileInput;
    error: null | string;
    onChange: (id: string, value: unknown) => void;
}) {
    return (
        <>
            <Button
                component="label"
                variant="outlined"
                color={error !== null ? "error" : undefined}
                startIcon={<UploadFileIcon />}
            >
                {config.label}
                <input
                    type="file"
                    accept={
                        Array.isArray(config.accept)
                            ? config.accept.join(",")
                            : config.accept
                    }
                    hidden
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        onChange(config.id, event.currentTarget.files);
                    }}
                />
            </Button>
            <FormHelperText
                sx={{ ml: 2, color: error !== null ? red[500] : undefined }}
            >
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
            </FormHelperText>
        </>
    );
}
