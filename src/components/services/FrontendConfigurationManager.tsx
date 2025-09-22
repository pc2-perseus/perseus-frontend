// React imports
import React from "react";

// MUI imports
import {
    Box,
    Button,
    Card,
    FormControlLabel,
    Radio,
    RadioGroup,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";

// Other imports
import _ from "lodash";

// Custom imports
import FrontendConfiguration from "../../interfaces/FrontendConfiguration.ts";
import LoadingBar from "../LoadingBar.tsx";
import getFrontendConfig from "../../api/frontend-configuration/getFrontendConfig.ts";
import updateFrontendConfig from "../../api/frontend-configuration/updateFrontendConfig.ts";

export default function FrontendConfigurationManager(): React.ReactElement {
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
                <Table size="small">
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
                                    <TableCell>{type}</TableCell>
                                    <TableCell>
                                        <RadioGroup
                                            row
                                            value={
                                                configuration
                                                    .project_type_colors[
                                                    type
                                                ] === null
                                                    ? "false"
                                                    : "true"
                                            }
                                            onChange={(e) => {
                                                if (
                                                    (
                                                        e.target as HTMLInputElement
                                                    ).value === "false"
                                                ) {
                                                    changeProjectTypeColor(
                                                        type,
                                                        null
                                                    );
                                                } else {
                                                    changeProjectTypeColor(
                                                        type,
                                                        "#ffffff"
                                                    );
                                                }
                                            }}
                                        >
                                            <FormControlLabel
                                                control={<Radio />}
                                                label="no color"
                                                value="false"
                                            />
                                            <FormControlLabel
                                                control={<Radio />}
                                                label="color"
                                                value="true"
                                            />
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <input
                                                    type="color"
                                                    disabled={
                                                        configuration
                                                            .project_type_colors[
                                                            type
                                                        ] === null
                                                    }
                                                    style={{
                                                        opacity:
                                                            configuration
                                                                .project_type_colors[
                                                                type
                                                            ] === null
                                                                ? "0.25"
                                                                : undefined,
                                                    }}
                                                    value={
                                                        configuration
                                                            .project_type_colors[
                                                            type
                                                        ] === null
                                                            ? "#ffffff"
                                                            : configuration
                                                                  .project_type_colors[
                                                                  type
                                                              ]
                                                    }
                                                    onChange={(e) => {
                                                        changeProjectTypeColor(
                                                            type,
                                                            e.currentTarget
                                                                .value
                                                        );
                                                    }}
                                                />
                                            </Box>
                                        </RadioGroup>
                                    </TableCell>
                                </TableRow>
                            )
                        )}
                    </TableBody>
                </Table>
            </Card>

            <Typography variant="h4" sx={{ my: 3 }}>
                State events
            </Typography>
            <Card>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>State / Event</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Color</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {_.keys(configuration.state_event_names).map(
                            (state: string) => (
                                <TableRow key={state}>
                                    <TableCell>{state}</TableCell>
                                    <TableCell>
                                        <TextField
                                            value={
                                                configuration.state_event_names[
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
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <RadioGroup
                                            row
                                            value={
                                                configuration
                                                    .state_event_colors[
                                                    state
                                                ] === null
                                                    ? "false"
                                                    : "true"
                                            }
                                            onChange={(e) => {
                                                if (
                                                    (
                                                        e.target as HTMLInputElement
                                                    ).value === "false"
                                                ) {
                                                    changeStateColor(
                                                        state,
                                                        null
                                                    );
                                                } else {
                                                    changeStateColor(
                                                        state,
                                                        "#ffffff"
                                                    );
                                                }
                                            }}
                                        >
                                            <FormControlLabel
                                                control={<Radio />}
                                                label="no color"
                                                value="false"
                                            />
                                            <FormControlLabel
                                                control={<Radio />}
                                                label="color"
                                                value="true"
                                            />
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <input
                                                    type="color"
                                                    disabled={
                                                        configuration
                                                            .state_event_colors[
                                                            state
                                                        ] === null
                                                    }
                                                    style={{
                                                        opacity:
                                                            configuration
                                                                .state_event_colors[
                                                                state
                                                            ] === null
                                                                ? "0.25"
                                                                : undefined,
                                                    }}
                                                    value={
                                                        configuration
                                                            .state_event_colors[
                                                            state
                                                        ] === null
                                                            ? "#ffffff"
                                                            : configuration
                                                                  .state_event_colors[
                                                                  state
                                                              ]
                                                    }
                                                    onChange={(e) => {
                                                        changeStateColor(
                                                            state,
                                                            e.currentTarget
                                                                .value
                                                        );
                                                    }}
                                                />
                                            </Box>
                                        </RadioGroup>
                                    </TableCell>
                                </TableRow>
                            )
                        )}
                    </TableBody>
                </Table>
            </Card>

            <Button
                variant="contained"
                onClick={update}
                sx={{ mt: 2, float: "right" }}
            >
                Save changes
            </Button>
        </>
    );
}
