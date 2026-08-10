// React imports
import React from "react";

// MUI imports
import {
    Box,
    Button,
    CircularProgress,
    Collapse,
    Grid,
    Theme,
    Tooltip,
    useTheme,
} from "@mui/material";

// Custom imports
import ProjectSearchFilter from "./ProjectSearchFilter.tsx";
import getSearchFilters from "../../../api/project-search/getSearchFilters.ts";
import SearchFilter from "../../../interfaces/SearchFilter.ts";

export default function FilterBox({
    open,
    filters,
    setFilters,
    applyFilters,
    onTransitionEnd,
    isSmallScreen,
    disabled,
}: {
    open: boolean;
    filters: {
        [key: string]: (boolean | string | number)[];
    };
    setFilters: (filters: {
        [key: string]: (boolean | string | number)[];
    }) => void;
    applyFilters: () => void;
    onTransitionEnd: () => void;
    isSmallScreen: boolean;
    disabled: boolean;
}): React.ReactElement {
    const [searchFilters, setSearchFilters] = React.useState<SearchFilter[]>(
        []
    );
    const [executeReset, setExecuteReset] = React.useState<boolean>(false);

    const theme: Theme = useTheme();

    function reset() {
        setFilters({});
        setExecuteReset(true);
    }

    React.useEffect(() => {
        getSearchFilters().then((result: SearchFilter[]) => {
            setSearchFilters(result);
        });
    }, []);

    React.useEffect(() => {
        if (executeReset) {
            applyFilters();
            setExecuteReset(false);
        }
    }, [executeReset]);

    return (
        <Collapse
            in={open}
            sx={{
                borderColor:
                    theme.palette.mode === "light"
                        ? "rgba(0, 0, 0, 0.23)"
                        : undefined,
                borderWidth: theme.palette.mode === "light" ? "1px" : undefined,
                borderStyle:
                    theme.palette.mode === "light" ? "solid" : undefined,
                borderTopLeftRadius: "4px",
                borderBottomLeftRadius: "4px",
                borderBottomRightRadius: "4px",
                mt: "5px",
                backgroundColor:
                    theme.palette.mode === "light"
                        ? theme.palette.background.default
                        : "rgba(144, 202, 249, 0.16)",
            }}
            addEndListener={onTransitionEnd}
        >
            <Box sx={{ p: 1.5 }}>
                {searchFilters.length === 0 ? (
                    <Box sx={{ textAlign: "center", width: "100%" }}>
                        <CircularProgress color="inherit" />
                    </Box>
                ) : (
                    <>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            {searchFilters.map((filter: SearchFilter) => {
                                return (
                                    <Grid
                                        size={{ xs: 12, md: 6, lg: 4, xl: 3 }}
                                        key={filter.filter_id}
                                    >
                                        <ProjectSearchFilter
                                            name={filter.name}
                                            options={filter.options}
                                            preset={
                                                filter.filter_id in filters
                                                    ? filters[filter.filter_id]
                                                    : undefined
                                            }
                                            updateFilter={(
                                                values:
                                                    | (
                                                          | boolean
                                                          | string
                                                          | number
                                                      )[]
                                                    | undefined
                                            ) => {
                                                if (values === undefined) {
                                                    delete filters[
                                                        filter.filter_id
                                                    ];
                                                } else {
                                                    filters[filter.filter_id] =
                                                        values;
                                                }
                                                setFilters(
                                                    JSON.parse(
                                                        JSON.stringify(filters)
                                                    )
                                                );
                                            }}
                                            executeReset={executeReset}
                                        />
                                    </Grid>
                                );
                            })}
                        </Grid>
                        <Box
                            sx={{
                                mt: 1.5,
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                gap: "8px",
                                justifyContent: "flex-end",
                            }}
                        >
                            <Button onClick={reset} size="small">
                                Reset
                            </Button>
                            {disabled ? (
                                <Tooltip
                                    title="Please add a filter"
                                    placement="top"
                                >
                                    <span>
                                        <Button
                                            variant="contained"
                                            onClick={applyFilters}
                                            size="small"
                                            disabled={disabled}
                                            fullWidth={isSmallScreen}
                                        >
                                            Apply
                                        </Button>
                                    </span>
                                </Tooltip>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={applyFilters}
                                    size="small"
                                    disabled={disabled}
                                    fullWidth={isSmallScreen}
                                >
                                    Apply
                                </Button>
                            )}
                        </Box>
                    </>
                )}
            </Box>
        </Collapse>
    );
}
