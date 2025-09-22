// React imports
import React, { ChangeEvent } from "react";
import { useLocation } from "react-router-dom";

// MUI imports
import {
    Badge,
    Box,
    Button,
    Collapse,
    InputAdornment,
    TextField,
    Theme,
    useTheme,
} from "@mui/material";

// Icon imports
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

// Custom imports
import ProjectDetails from "../project-details/ProjectDetails.tsx";
import FilterBox from "./FilterBox.tsx";
import Project from "../../../interfaces/Project.ts";
import searchProjects from "../../../api/project-search/searchProjects.ts";
import isValueNumeric from "../../../utils/isValueNumeric.ts";

// Other imports
import _ from "lodash";
import ProjectSearchResultList from "./ProjectSearchResultList.tsx";
import LoadingBar from "../../LoadingBar.tsx";

export default function ProjectSearch({
    projectId,
}: {
    projectId?: string;
}): React.ReactElement {
    const [searchString, setSearchString] = React.useState<string>("");
    const [searchResults, updateSearchResults] = React.useState<Project[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [executeSearch, setExecuteSearch] = React.useState<boolean>(false);
    const [showFilters, setShowFilters] = React.useState<boolean>(false);
    const [showHelper, setShowHelper] = React.useState<boolean>(false);
    const [showButtonEnd, setShowButtonEnd] = React.useState<boolean>(true);
    const [filterItems, setFilterItems] = React.useState<{
        [key: string]: (boolean | string | number)[];
    }>({});
    const [activeFilters, setActiveFilters] = React.useState<number>(0);

    const location = useLocation();
    const theme: Theme = useTheme();

    function search(event: ChangeEvent<HTMLInputElement>) {
        setSearchString(event.currentTarget.value);
        setLoading(true);
        setExecuteSearch(false);
        window.setTimeout(() => {
            setExecuteSearch(true);
        }, 500);
    }

    function setHash() {
        if (searchString.length === 0 && _.keys(filterItems).length === 0) {
            history.replaceState(
                "",
                document.title,
                window.location.pathname + window.location.search
            );
            return;
        }
        window.location.hash = "#" + searchString;
        if (_.keys(filterItems).length > 0) {
            window.location.hash =
                searchString +
                ";" +
                _.keys(filterItems)
                    .map((key) => key + "=" + filterItems[key].join(","))
                    .join(";");
        }
    }

    function execute(
        search: string,
        filters: {
            [key: string]: (boolean | string | number)[];
        },
        force: boolean = false
    ) {
        setActiveFilters(_.keys(filters).length);
        setHash();
        if (
            !force &&
            searchString.length === 0 &&
            _.keys(filterItems).length === 0
        ) {
            updateSearchResults([]);
            setLoading(false);
            return;
        }
        searchProjects(search, filters).then((response: Project[]) => {
            updateSearchResults(response);
            setLoading(false);
        });
    }

    function applyFilters() {
        setLoading(true);
        execute(searchString, filterItems);
    }

    React.useEffect(() => {
        const [hashVal, ...setFilters] = location.hash
            .replace("#", "")
            .split(";");
        setSearchString(hashVal);
        setFilters.forEach((item: string) => {
            const [key, valueString] = item.split("=");
            filterItems[key] = valueString.split(",").map((value: string) => {
                if (value === "true") {
                    return true;
                } else if (value === "false") {
                    return false;
                } else if (isValueNumeric(value)) {
                    return Number(value);
                }
                return value;
            });
        });
        setFilterItems(JSON.parse(JSON.stringify(filterItems)));
        setActiveFilters(_.keys(filterItems).length);

        if (hashVal.trim().length === 0 && _.keys(filterItems).length === 0) {
            updateSearchResults([]);
            return;
        } else {
            setLoading(true);
            execute(hashVal, filterItems, true);
        }
    }, []);

    React.useEffect(() => {
        if (executeSearch) {
            execute(searchString, filterItems);
        }
    }, [executeSearch]);

    React.useEffect(() => {
        setHash();
    }, [searchString]);

    if (projectId !== undefined) {
        return <ProjectDetails projectId={projectId} />;
    }
    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    gap: "5px",
                }}
            >
                <TextField
                    label="Search"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    variant="outlined"
                    onChange={search}
                    value={searchString}
                    sx={{ flexGrow: 1 }}
                />
                <Box sx={{ position: "relative" }}>
                    <Badge
                        badgeContent={activeFilters}
                        color="primary"
                        sx={{ height: "100%", width: "100%" }}
                    >
                        <Button
                            variant="contained"
                            onClick={() => {
                                if (showHelper) {
                                    setShowFilters(false);
                                } else {
                                    setShowButtonEnd(false);
                                    setShowHelper(true);
                                }
                            }}
                            sx={{
                                borderColor:
                                    theme.palette.mode === "light"
                                        ? "rgba(0, 0, 0, 0.23)"
                                        : undefined,
                                borderWidth:
                                    theme.palette.mode === "light"
                                        ? "1px"
                                        : undefined,
                                borderStyle:
                                    theme.palette.mode === "light"
                                        ? "solid"
                                        : undefined,
                                borderBottom: !showButtonEnd
                                    ? "none"
                                    : undefined,
                                backgroundColor:
                                    theme.palette.mode === "light"
                                        ? theme.palette.background.default
                                        : "rgba(144, 202, 249, 0.16)",
                                color: theme.palette.text.secondary,
                                boxShadow: "none",
                                borderBottomLeftRadius: !showButtonEnd
                                    ? "0px"
                                    : undefined,
                                borderBottomRightRadius: !showButtonEnd
                                    ? "0px"
                                    : undefined,
                                height: "100%",
                                ":hover": {
                                    backgroundColor:
                                        "rgba(144, 202, 249, 0.16)",
                                    boxShadow: "none",
                                },
                                ":active": {
                                    boxShadow: "none",
                                },
                            }}
                            disableRipple
                        >
                            <FilterAltIcon />
                        </Button>
                    </Badge>

                    <Collapse
                        in={showHelper}
                        addEndListener={() => {
                            setShowFilters(showHelper);
                            if (!showHelper) {
                                window.setTimeout(() => {
                                    setShowButtonEnd(true);
                                }, 200);
                            }
                        }}
                        timeout={220}
                    >
                        <Box
                            sx={{
                                backgroundColor:
                                    theme.palette.mode === "light"
                                        ? theme.palette.background.default
                                        : "rgba(144, 202, 249, 0.16)",
                                position: "absolute",
                                mt: "0px",
                                height:
                                    theme.palette.mode === "light"
                                        ? "6px"
                                        : "5px",
                                width: "100%",
                                borderColor:
                                    theme.palette.mode === "light"
                                        ? "rgba(0, 0, 0, 0.23)"
                                        : undefined,
                                borderWidth:
                                    theme.palette.mode === "light"
                                        ? "1px"
                                        : undefined,
                                borderStyle:
                                    theme.palette.mode === "light"
                                        ? "solid"
                                        : undefined,
                                borderTop: "none",
                                borderBottomColor:
                                    theme.palette.mode === "light"
                                        ? theme.palette.background.default
                                        : undefined,
                                //borderBottomWidth: "5px",
                            }}
                        />
                    </Collapse>
                </Box>
            </Box>

            <FilterBox
                open={showFilters}
                filters={filterItems}
                setFilters={setFilterItems}
                applyFilters={applyFilters}
                onTransitionEnd={() => {
                    setShowHelper(showFilters);
                }}
                disabled={
                    (searchString.length === 0 &&
                        _.keys(filterItems).length === 0) ||
                    (_.keys(filterItems).length === 0 && activeFilters === 0)
                }
            />

            <Box
                sx={{
                    display: loading ? "block" : "none",
                    width: "100%",
                    mt: 1,
                }}
            >
                <LoadingBar />
            </Box>
            <Box sx={{ display: loading ? "none" : "block" }}>
                <ProjectSearchResultList
                    searchResults={searchResults}
                    isSearchActive={
                        searchString.length > 0 || activeFilters > 0
                    }
                />
            </Box>
        </>
    );
}
