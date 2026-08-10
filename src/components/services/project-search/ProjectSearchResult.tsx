// React imports
import React from "react";
import { useNavigate } from "react-router-dom";

// MUI imports
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Theme,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";

// Other imports
import _ from "lodash";

// Custom imports
import { projectTypeColor } from "../../../utils/projectTypeColor.ts";
import Project from "../../../interfaces/Project.ts";
import ConfigContext from "../../../contexts/ConfigContext.ts";
import FrontendConfiguration from "../../../interfaces/FrontendConfiguration.ts";
import { stateTypeColor } from "../../../utils/stateTypeColor.ts";
import { stateTypeName } from "../../../utils/stateTypeName.ts";
import isProjectArchived from "../../../utils/isProjectArchived.ts";

export default function ProjectSearchResult({
    project,
    isEdge,
    isSelected = false,
}: {
    project: Project;
    isEdge?: "top" | "bottom" | "both";
    isSelected?: boolean;
}): React.ReactElement {
    const theme: Theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const navigate = useNavigate();

    const frontendConfig: FrontendConfiguration | null =
        React.useContext(ConfigContext);

    const isArchived: boolean = isProjectArchived(project);

    const stateBackgroundColors: (string | undefined)[] = Array(
        project.state_machine.current_states.length
    ).fill(undefined);
    const stateNames: string[] = JSON.parse(
        JSON.stringify(project.state_machine.current_states)
    );
    project.state_machine.current_states.forEach(
        (stateId: string, index: number) => {
            _.keys(frontendConfig?.state_event_names).forEach(
                (state: string) => {
                    if (state === stateId) {
                        stateBackgroundColors[index] = stateTypeColor(
                            state,
                            frontendConfig
                        );
                        stateNames[index] = stateTypeName(
                            state,
                            frontendConfig
                        );
                    }
                }
            );
        }
    );

    return (
        <Card
            variant="outlined"
            sx={{
                background: isSelected
                    ? theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.08)"
                    : isArchived && theme.palette.mode === "dark"
                      ? theme.palette.grey["800"]
                      : undefined,
                opacity: isSelected ? undefined : isArchived ? 0.5 : undefined,
                borderTopRightRadius:
                    isEdge === "top" || isEdge === "both" ? undefined : "0px",
                borderBottomRightRadius:
                    isEdge === "bottom" || isEdge === "both"
                        ? undefined
                        : "0px",
                borderBottom:
                    isEdge === "bottom" ||
                    isEdge === "both" ||
                    (isArchived && theme.palette.mode === "light" && isSelected)
                        ? undefined
                        : "none",
            }}
        >
            <CardActionArea
                onClick={() => {
                    navigate("/ProjectSearch/" + project._id);
                }}
            >
                <CardContent sx={{ p: 0 }}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: isSmallScreen ? "column" : "row",
                        }}
                    >
                        <Box
                            sx={{
                                writingMode: isSmallScreen
                                    ? "horizontal-tb"
                                    : "vertical-lr",
                                transform: isSmallScreen
                                    ? "none"
                                    : "scale(-1, -1)",
                                textAlign: "center",
                                fontSize: isSmallScreen ? "0.8rem" : "19px",
                                px: 1,
                                py: isSmallScreen ? 0.5 : 1,
                                background: projectTypeColor(
                                    project.project_type,
                                    frontendConfig
                                ),
                            }}
                        >
                            {project.project_type === null
                                ? "unknown"
                                : project.project_type}
                        </Box>
                        <Box
                            sx={{
                                py: 1,
                                ml: 1,
                                flexGrow: 2,
                                minWidth: 0,
                            }}
                        >
                            <Typography
                                sx={{ fontSize: 14 }}
                                color="text.secondary"
                                gutterBottom
                            >
                                {project.source === null ? (
                                    "source information unavailable"
                                ) : (
                                    <>
                                        #{project.source.foreign_id} (
                                        {project.source.name})
                                    </>
                                )}
                            </Typography>
                            <Typography
                                variant={isSmallScreen ? "h6" : "h5"}
                                component="div"
                            >
                                {project.abbreviation === null &&
                                project.title === null
                                    ? "no title or abbreviation available"
                                    : ""}
                                {project.abbreviation
                                    ? project.abbreviation
                                    : project.title}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                pt: isSmallScreen ? 0 : "8px",
                                pr: "6px",
                                pb: isSmallScreen ? 1 : 0,
                                pl: isSmallScreen ? 1 : 0,
                                display: "flex",
                                flexDirection: isSmallScreen ? "row" : "column",
                                flexWrap: "wrap",
                                gap: "5px",
                            }}
                        >
                            {project.state_machine.current_states.map(
                                (stateId: string, index: number) => {
                                    return (
                                        <Chip
                                            key={stateId}
                                            label={stateNames[index]}
                                            size="small"
                                            sx={{
                                                background:
                                                    stateBackgroundColors[
                                                        index
                                                    ],
                                            }}
                                        />
                                    );
                                }
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
