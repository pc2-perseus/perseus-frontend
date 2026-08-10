// React imports
import React from "react";
import { useNavigate } from "react-router-dom";

// MUI imports
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Theme,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";

// Custom imports
import Person from "../../../interfaces/Person.ts";

export default function PersonSearchResult({
    person,
    isEdge,
    isSelected = false,
}: {
    person: Person;
    isEdge?: "top" | "bottom" | "both";
    isSelected?: boolean;
}): React.ReactElement {
    const theme: Theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const navigate = useNavigate();

    return (
        <Card
            variant="outlined"
            sx={{
                background: isSelected
                    ? theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.08)"
                    : undefined,
                borderTopRightRadius:
                    isEdge === "top" || isEdge === "both" ? undefined : "0px",
                borderBottomRightRadius:
                    isEdge === "bottom" || isEdge === "both"
                        ? undefined
                        : "0px",
                borderBottom:
                    isEdge === "bottom" || isEdge === "both"
                        ? undefined
                        : "none",
            }}
        >
            <CardActionArea
                onClick={() => {
                    navigate("/PersonSearch/" + person._id);
                }}
                sx={{ minHeight: 80 }}
            >
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: "flex" }}>
                        <Box sx={{ py: 1.25, px: 1.5, minWidth: 0 }}>
                            <Typography
                                sx={{ fontSize: 14 }}
                                color="text.secondary"
                                gutterBottom
                            >
                                {person.username === null ? (
                                    <>&nbsp;</>
                                ) : (
                                    person.username
                                )}
                            </Typography>
                            <Typography
                                variant={isSmallScreen ? "h6" : "h5"}
                                component="div"
                            >
                                {person.firstname} {person.lastname}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
