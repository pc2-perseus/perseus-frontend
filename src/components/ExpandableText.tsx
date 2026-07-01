// React imports
import React from "react";

// MUI imports
import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import { grey } from "@mui/material/colors";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

export default function ExpandableText({
    content,
    isHtml = false,
}: {
    content: string | null | undefined;
    isHtml?: boolean;
}): React.ReactElement {
    const [showAll, setShowAll] = React.useState<boolean>(false);

    if (isHtml === true) {
        return (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    fontSize: "0.875rem",
                    width: "100%",
                    padding: 0,
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: showAll ? "block" : "-webkit-box",
                        WebkitLineClamp: showAll ? "none" : 1,
                        WebkitBoxOrient: "vertical",
                        a: {
                            color: "inherit",
                            textDecoration: "underline",
                        },
                        "a:hover": {
                            color: grey.A700,
                        },
                    }}
                    dangerouslySetInnerHTML={{ __html: content || "" }}
                />
                <IconButton
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowAll((prev) => !prev);
                    }}
                    sx={{
                        backgroundColor: "transparent",
                        my: -1,
                        alignSelf: "center",
                    }}
                >
                    <MoreHorizIcon />
                </IconButton>
            </Box>
        );
    }

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
            value={content || ""}
            multiline
            rows={showAll ? undefined : 1}
            fullWidth
        />
    );
}
