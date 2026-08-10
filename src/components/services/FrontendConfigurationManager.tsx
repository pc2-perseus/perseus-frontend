// React imports
import React from "react";

// MUI imports
import {
    Box,
    Button,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";

// Other imports
import _ from "lodash";

// Custom imports
import FrontendConfiguration from "../../interfaces/FrontendConfiguration.ts";
import LoadingBar from "../LoadingBar.tsx";
import getFrontendConfig from "../../api/frontend-configuration/getFrontendConfig.ts";
import updateFrontendConfig from "../../api/frontend-configuration/updateFrontendConfig.ts";
import ColorPicker from "../ColorPicker.tsx";

export default function FrontendConfigurationManager(): React.ReactElement {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const [configuration, setConfiguration] =
        React.useState<FrontendConfiguration | null>(null);

    function changeProjectTypeColor(type: string, color: string | null) {
        if (configuration !== null) {
            configuration.project_type_colors[type] = color;
            setConfiguration(JSON.parse(JSON.stringify(configuration)));
        }
    }

    function changeStateColor(state: string, color: string | null) {
        if (configuration !== null) {
            configuration.state_event_colors[state] = color;
            setConfiguration(JSON.parse(JSON.stringify(configuration)));
        }
    }

    function changeStateName(state: string, name: string) {
        if (configuration !== null) {
            configuration.state_event_names[state] =
                name.trim().length === 0 ? null : name;
            setConfiguration(JSON.parse(JSON.stringify(configuration)));
        }
    }

    function update() {
        if (configuration !== null) {
            updateFrontendConfig(configuration).then((result: boolean) => {
                if (result) {
                    setConfiguration(null);
                    getFrontendConfig().then(
                        (config: FrontendConfiguration) => {
                            setConfiguration(config);
                        }
                    );
                }
            });
        }
    }

    React.useEffect(() => {
        getFrontendConfig().then((config: FrontendConfiguration) => {
            setConfiguration(config);
        });
    }, []);

    if (configuration === null) {
        return <LoadingBar />;
    }
    return (
        <>
            <Typography variant="h4" sx={{ mb: 3 }}>
                Project type colors
            </Typography>
            <Card>
                <TableContainer
                    sx={{
                        overflowX: "auto",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    <Table
                        sx={{ minWidth: isSmallScreen ? 320 : 420 }}
                        size="small"
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell>Project type</TableCell>
                                <TableCell>Color</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {_.keys(configuration.project_type_colors).map(
                                (type: string) => (
                                    <TableRow key={type}>
                                        <TableCell
                                            sx={{
                                                minWidth: isSmallScreen
                                                    ? 160
                                                    : 220,
                                                py: isSmallScreen ? 1 : 2,
                                            }}
                                        >
                                            {type}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                minWidth: isSmallScreen
                                                    ? 120
                                                    : 160,
                                                py: isSmallScreen ? 1 : 2,
                                            }}
                                        >
                                            <ColorPicker
                                                value={
                                                    configuration
                                                        .project_type_colors[
                                                        type
                                                    ]
                                                }
                                                onChange={(color) =>
                                                    changeProjectTypeColor(
                                                        type,
                                                        color
                                                    )
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                )
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            <Typography variant="h4" sx={{ my: 3 }}>
                State events
            </Typography>
            <Card>
                <TableContainer
                    sx={{
                        overflowX: "auto",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    <Table
                        sx={{
                            minWidth: isSmallScreen ? 520 : 620,
                            width: "100%",
                        }}
                        size="small"
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ py: isSmallScreen ? 1 : 2 }}>
                                    State / Event
                                </TableCell>
                                <TableCell sx={{ py: isSmallScreen ? 1 : 2 }}>
                                    Name
                                </TableCell>
                                <TableCell sx={{ py: isSmallScreen ? 1 : 2 }}>
                                    Color
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {_.keys(configuration.state_event_names).map(
                                (state: string) => (
                                    <TableRow key={state}>
                                        <TableCell
                                            sx={{
                                                minWidth: isSmallScreen
                                                    ? 130
                                                    : 180,
                                                py: isSmallScreen ? 0.9 : 2,
                                                px: isSmallScreen ? 1 : 2,
                                                fontSize: isSmallScreen
                                                    ? "0.8rem"
                                                    : undefined,
                                                whiteSpace: "normal",
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {state}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                minWidth: isSmallScreen
                                                    ? 180
                                                    : 260,
                                                py: isSmallScreen ? 0.9 : 2,
                                                px: isSmallScreen ? 1 : 2,
                                            }}
                                        >
                                            <TextField
                                                value={
                                                    configuration
                                                        .state_event_names[
                                                        state
                                                    ] === null
                                                        ? ""
                                                        : configuration
                                                              .state_event_names[
                                                              state
                                                          ]
                                                }
                                                onChange={(e) => {
                                                    changeStateName(
                                                        state,
                                                        e.currentTarget.value
                                                    );
                                                }}
                                                size="small"
                                                fullWidth
                                                sx={{
                                                    minWidth: 0,
                                                    "& .MuiInputBase-input": {
                                                        py: isSmallScreen
                                                            ? 0.85
                                                            : undefined,
                                                        fontSize: isSmallScreen
                                                            ? "0.8rem"
                                                            : undefined,
                                                    },
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                minWidth: isSmallScreen
                                                    ? 150
                                                    : 160,
                                                py: isSmallScreen ? 0.9 : 2,
                                                px: isSmallScreen ? 0.75 : 2,
                                                whiteSpace: "normal",
                                            }}
                                        >
                                            <ColorPicker
                                                value={
                                                    configuration
                                                        .state_event_colors[
                                                        state
                                                    ]
                                                }
                                                onChange={(color) =>
                                                    changeStateColor(
                                                        state,
                                                        color
                                                    )
                                                }
                                                compact={isSmallScreen}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" onClick={update}>
                    Save changes
                </Button>
            </Box>
        </>
    );
}
