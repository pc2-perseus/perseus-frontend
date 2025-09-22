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
            >
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: "flex" }}>
                        <Box sx={{ py: 1, ml: 1 }}>
                            <Typography
                                sx={{ fontSize: 14 }}
                                color="text.secondary"
                                gutterBottom
                            >
                                {person.title === null ? (
                                    <>&nbsp;</>
                                ) : (
                                    person.title
                                )}
                            </Typography>
                            <Typography variant="h5" component="div">
                                {person.firstname} {person.lastname}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
