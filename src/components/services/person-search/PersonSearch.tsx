// React imports
import React, { ChangeEvent } from "react";

// MUI imports
import { Box, InputAdornment, TextField } from "@mui/material";

// Icon imports
import SearchIcon from "@mui/icons-material/Search";

// Custom imports
import PersonDetails from "../person-details/PersonDetails.tsx";
import PersonSearchResultList from "./PersonSearchResultList.tsx";
import searchPersons from "../../../api/person-search/searchPersons.ts";
import Person from "../../../interfaces/Person.ts";
import LoadingBar from "../../LoadingBar.tsx";

export interface PersonSearchResult {
    id: string;
    title: string;
    firstname: string;
    lastname: string;
}

export default function PersonSearch({
    personId,
}: {
    personId?: string;
}): React.ReactElement {
    const [searchString, setSearchString] = React.useState<string>("");
    const [searchResults, updateSearchResults] = React.useState<Person[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [executeSearch, setExecuteSearch] = React.useState<boolean>(false);

    function search(event: ChangeEvent<HTMLInputElement>) {
        setSearchString(event.currentTarget.value);
        if (event.currentTarget.value.trim().length === 0) {
            updateSearchResults([]);
            return;
        } else {
            setLoading(true);
            setExecuteSearch(false);
            window.setTimeout(() => {
                setExecuteSearch(true);
            }, 500);
        }
    }

    React.useEffect(() => {
        if (executeSearch) {
            //window.location.hash = "#" + searchString;
            searchPersons(searchString).then((response) => {
                updateSearchResults(response);
                setLoading(false);
            });
        }
    }, [executeSearch]);

    if (personId !== undefined) {
        return <PersonDetails personId={personId} />;
    }

    return (
        <>
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
                fullWidth
                value={searchString}
                sx={{
                    "& .MuiInputBase-root": {
                        minHeight: 56,
                    },
                }}
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
                <PersonSearchResultList
                    searchResults={searchResults}
                    isSearchActive={searchString.length > 0}
                />
            </Box>
        </>
    );
}
