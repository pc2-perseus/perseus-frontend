// React imports
import React from "react";

// MUI imports
import { IconButton, InputAdornment, TextField } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

export default function ExpandableText({
    content,
}: {
    content: string | null | undefined;
}): React.ReactElement {
    const [showAll, setShowAll] = React.useState<boolean>(false);

    return (
        <TextField
            variant="standard"
            sx={{
                border: "none",
                padding: 0,
                "&::after": {
                    display: "none",
                },
                textarea: {
                    overflow: "hidden",
                },
            }}
            slotProps={{
                htmlInput: {
                    style: {
                        scrollbarWidth: "none",
                    },
                },
                input: {
                    readOnly: true,
                    disableUnderline: true,
                    style: {
                        fontSize: "0.875rem",
                        padding: 0,
                    },
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setShowAll((prev) => !prev);
                                }}
                                sx={{ backgroundColor: "transparent" }}
                            >
                                <MoreHorizIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                },
            }}
            size="small"
            value={content}
            multiline
            rows={showAll ? undefined : 1}
            fullWidth
        />
    );
}
