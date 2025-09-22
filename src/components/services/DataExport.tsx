// React imports
import React from "react";

// MUI imports
import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    Theme,
    Typography,
    useTheme,
} from "@mui/material";

// Custom imports
import CONFIG from "../../config.ts";
import getDataExportOptions from "../../api/getDataExportOptions.ts";

export interface OptionsResponse {
    project_types: string[];
    calls: string[];
    states: string[];
}

export interface ExportFilter {
    project_types: string[];
    calls: string[];
    states: string[];
}

export default function DataExport() {
    const [options, updateOptions] = React.useState<OptionsResponse | null>(
        null
    );
    const [filters, updateFilters] = React.useState<ExportFilter>({
        project_types: [],
        calls: [],
        states: [],
    });
    const [showElements, updateShowElements] = React.useState<string[]>([]);

    const ref = React.useRef(null);

    const theme: Theme = useTheme();

    React.useEffect(() => {
        getDataExportOptions().then((result: OptionsResponse | null) => {
            updateOptions(result);
            filters.project_types = JSON.parse(
                JSON.stringify(result?.project_types)
            );
            filters.calls = JSON.parse(JSON.stringify(result?.calls));
            filters.states = JSON.parse(JSON.stringify(result?.states));
            updateFilters(filters);
        });
    }, []);

    function download() {
        fetch(CONFIG.CORE_URL + "/service/DataExport/export", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                project_types: filters.project_types,
                calls: filters.calls,
            }),
        })
            .then((response) => {
                return response.blob();
            })
            .then((blob) => {
                const a = ref.current;
                if (a !== null) {
                    // @ts-expect-error For download functionality
                    a.href = window.URL.createObjectURL(blob);
                    // @ts-expect-error For download functionality
                    a.click();
                }
            });
    }

    return (
        <Box>
            This feature is still experimental and sometimes does not work as
            expected. It will be improved in future versions.
            <Box>
                <FormControlLabel
                    control={
                        <Checkbox
                            size="small"
                            checked={
                                options?.project_types.length ===
                                filters.project_types.length
                            }
                            indeterminate={
                                filters.project_types.length > 0 &&
                                filters.project_types.length !==
                                    options?.project_types.length
                            }
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                if (event.target.checked) {
                                    filters.project_types = JSON.parse(
                                        JSON.stringify(options?.project_types)
                                    );
                                } else {
                                    filters.project_types = [];
                                }
                                updateFilters(
                                    JSON.parse(JSON.stringify(filters))
                                );
                            }}
                        />
                    }
                    label={<>All project types</>}
                />
                <Typography
                    variant="caption"
                    sx={{
                        color: theme.palette.primary.main,
                        cursor: "pointer",
                    }}
                    onClick={() => {
                        if (showElements.includes("project_types")) {
                            updateShowElements(
                                showElements.filter(
                                    (item) => item !== "project_types"
                                )
                            );
                        } else {
                            showElements.push("project_types");
                            updateShowElements(
                                JSON.parse(JSON.stringify(showElements))
                            );
                        }
                    }}
                >
                    {showElements.includes("project_types") ? "hide" : "show"}
                </Typography>
            </Box>
            <Box
                sx={{
                    display: showElements.includes("project_types")
                        ? "flex"
                        : "none",
                    flexDirection: "column",
                    ml: 3,
                }}
            >
                {options?.project_types.map((project_type: string) => {
                    const handleChange = (
                        event: React.ChangeEvent<HTMLInputElement>
                    ) => {
                        if (event.target.checked) {
                            filters.project_types.push(project_type);
                        } else {
                            filters.project_types =
                                filters.project_types.filter(
                                    (ptype) => ptype !== project_type
                                );
                        }
                        updateFilters(JSON.parse(JSON.stringify(filters)));
                    };
                    return (
                        <FormControlLabel
                            key={project_type}
                            control={
                                <Checkbox
                                    size="small"
                                    checked={filters.project_types.includes(
                                        project_type
                                    )}
                                    onChange={handleChange}
                                />
                            }
                            label={project_type}
                        />
                    );
                })}
            </Box>
            <Box>
                <FormControlLabel
                    control={
                        <Checkbox
                            size="small"
                            checked={
                                options?.calls.length === filters.calls.length
                            }
                            indeterminate={
                                filters.calls.length > 0 &&
                                filters.calls.length !== options?.calls.length
                            }
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                if (event.target.checked) {
                                    filters.calls = JSON.parse(
                                        JSON.stringify(options?.calls)
                                    );
                                } else {
                                    filters.calls = [];
                                }
                                updateFilters(
                                    JSON.parse(JSON.stringify(filters))
                                );
                            }}
                        />
                    }
                    label={<>All calls</>}
                />
                <Typography
                    variant="caption"
                    sx={{
                        color: theme.palette.primary.main,
                        cursor: "pointer",
                    }}
                    onClick={() => {
                        if (showElements.includes("calls")) {
                            updateShowElements(
                                showElements.filter((item) => item !== "calls")
                            );
                        } else {
                            showElements.push("calls");
                            updateShowElements(
                                JSON.parse(JSON.stringify(showElements))
                            );
                        }
                    }}
                >
                    {showElements.includes("calls") ? "hide" : "show"}
                </Typography>
            </Box>
            <Box
                sx={{
                    display: showElements.includes("calls") ? "flex" : "none",
                    flexDirection: "column",
                    ml: 3,
                }}
            >
                {options?.calls.map((call: string) => {
                    const handleChange = (
                        event: React.ChangeEvent<HTMLInputElement>
                    ) => {
                        if (event.target.checked) {
                            filters.calls.push(call);
                        } else {
                            filters.calls = filters.calls.filter(
                                (c) => c !== call
                            );
                        }
                        updateFilters(JSON.parse(JSON.stringify(filters)));
                    };
                    return (
                        <FormControlLabel
                            key={call}
                            control={
                                <Checkbox
                                    size="small"
                                    checked={filters.calls.includes(call)}
                                    onChange={handleChange}
                                />
                            }
                            label={call}
                        />
                    );
                })}
            </Box>
            <Box sx={{ display: "none" }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            size="small"
                            checked={
                                options?.states.length === filters.states.length
                            }
                            indeterminate={
                                filters.states.length > 0 &&
                                filters.states.length !== options?.states.length
                            }
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                if (event.target.checked) {
                                    filters.states = JSON.parse(
                                        JSON.stringify(options?.states)
                                    );
                                } else {
                                    filters.states = [];
                                }
                                updateFilters(
                                    JSON.parse(JSON.stringify(filters))
                                );
                            }}
                        />
                    }
                    label={<>All states</>}
                />
                <Typography
                    variant="caption"
                    sx={{
                        color: theme.palette.primary.main,
                        cursor: "pointer",
                    }}
                    onClick={() => {
                        if (showElements.includes("states")) {
                            updateShowElements(
                                showElements.filter((item) => item !== "states")
                            );
                        } else {
                            showElements.push("states");
                            updateShowElements(
                                JSON.parse(JSON.stringify(showElements))
                            );
                        }
                    }}
                >
                    {showElements.includes("states") ? "hide" : "show"}
                </Typography>
            </Box>
            <Box
                sx={{
                    display: showElements.includes("states") ? "flex" : "none",
                    flexDirection: "column",
                    ml: 3,
                }}
            >
                {options?.states.map((state: string) => {
                    const handleChange = (
                        event: React.ChangeEvent<HTMLInputElement>
                    ) => {
                        if (event.target.checked) {
                            filters.states.push(state);
                        } else {
                            filters.states = filters.states.filter(
                                (c) => c !== state
                            );
                        }
                        updateFilters(JSON.parse(JSON.stringify(filters)));
                    };
                    return (
                        <FormControlLabel
                            key={state}
                            control={
                                <Checkbox
                                    size="small"
                                    checked={filters.states.includes(state)}
                                    onChange={handleChange}
                                />
                            }
                            label={state}
                        />
                    );
                })}
            </Box>
            <Box sx={{ mt: 3 }}>
                <Button
                    variant="contained"
                    onClick={download}
                    sx={{ float: "right" }}
                >
                    Download now
                </Button>
            </Box>
            <a ref={ref} download="perseus-export.json" />
        </Box>
    );
}
