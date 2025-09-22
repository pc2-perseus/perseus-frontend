// React imports
import React from "react";

// MUI imports
import { Box } from "@mui/material";

// Other imports
import { FileIcon, defaultStyles, FileIconProps } from "react-file-icon";

export default function FileTypeIcon({
    filename,
    size = "2em",
}: {
    filename: string;
    size?: string;
}): React.ReactElement {
    const parts: string[] = filename.split(".");
    const extension: string = parts[parts.length - 1];

    let styles: FileIconProps = {};

    if (Object.keys(defaultStyles).includes(extension)) {
        // @ts-expect-error extension will always be a key of defaultStyles
        styles = { ...defaultStyles[extension] };
    }

    return (
        <Box
            sx={{
                width: size,
                height: "100%",
                lineHeight: "100%",
                verticalAlign: "middle",
            }}
        >
            <FileIcon extension={extension} {...styles} />
        </Box>
    );
}
