// React imports
import React from "react";
import { useNavigate } from "react-router-dom";

// MUI imports
import { Box, Button } from "@mui/material";

// Custom imports
import PersonSearchResult from "./PersonSearchResult.tsx";
import Person from "../../../interfaces/Person.ts";

export default function PersonSearchResultList({
    searchResults,
    isSearchActive = true,
}: {
    searchResults: Person[];
    isSearchActive?: boolean;
}): React.ReactElement {
    const [displayedResults, setDisplayedResults] = React.useState<number>(25);
    const [selectedResult, setSelectedResult] = React.useState<number | null>(
        null
    );
    const selectedResultRef = React.useRef(null);
    const [executeNavigation, setExecuteNavigation] =
        React.useState<boolean>(false);

    const navigate = useNavigate();

    React.useEffect(() => {
        setSelectedResult(null);
    }, [searchResults]);

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowUp") {
                event.preventDefault();
                setSelectedResult((prevIndex) => {
                    if (prevIndex === null || prevIndex === 0) {
                        return -1;
                    } else {
                        return prevIndex - 1;
                    }
                });
            } else if (event.key === "ArrowDown" || event.key === "Tab") {
                event.preventDefault();
                setSelectedResult((prevIndex) => {
                    if (
                        prevIndex === null ||
                        prevIndex ===
                            Math.min(
                                displayedResults - 1,
                                searchResults.length - 1
                            )
                    ) {
                        return 0;
                    } else {
                        return prevIndex + 1;
                    }
                });
            } else if (event.key === "Enter") {
                event.preventDefault();
                setExecuteNavigation(true);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    React.useEffect(() => {
        if (selectedResult === -1) {
            setSelectedResult(
                Math.min(displayedResults - 1, searchResults.length - 1)
            );
        } else if (
            selectedResult !== null &&
            selectedResult >= Math.min(displayedResults, searchResults.length)
        ) {
            setSelectedResult(0);
        } else if (
            selectedResultRef !== null &&
            selectedResultRef.current !== null
        ) {
            // @ts-expect-error does exist in this case
            selectedResultRef.current.scrollIntoView({ block: "nearest" });
            const currentY: number =
                // @ts-expect-error does exist in this case
                selectedResultRef.current.getBoundingClientRect()["y"];
            if (currentY < 70) {
                window.scrollBy({
                    top: (70 - currentY) * -1,
                    behavior: "instant",
                });
            }
        }
    }, [selectedResult]);

    React.useEffect(() => {
        if (executeNavigation) {
            setExecuteNavigation(false);
            if (selectedResult !== null) {
                navigate("/PersonSearch/" + searchResults[selectedResult]._id);
            }
        }
    }, [executeNavigation]);

    return (
        <>
            <Box sx={{ mt: 4 }}>
                {searchResults.length === 0 && isSearchActive ? (
                    <i>No results found</i>
                ) : (
                    ""
                )}
                {searchResults
                    .slice(0, displayedResults)
                    .map((result: Person, index: number) => {
                        const isSelected: boolean = index === selectedResult;
                        return (
                            <React.Fragment key={result._id}>
                                {isSelected ? (
                                    <div ref={selectedResultRef}>
                                        <PersonSearchResult
                                            person={result}
                                            isSelected={isSelected}
                                            isEdge={
                                                index === 0 &&
                                                searchResults.length === 1
                                                    ? "both"
                                                    : index === 0
                                                      ? "top"
                                                      : index + 1 >=
                                                              displayedResults ||
                                                          index + 1 >=
                                                              searchResults.length
                                                        ? "bottom"
                                                        : undefined
                                            }
                                        />
                                    </div>
                                ) : (
                                    <PersonSearchResult
                                        person={result}
                                        isSelected={isSelected}
                                        isEdge={
                                            index === 0 &&
                                            searchResults.length === 1
                                                ? "both"
                                                : index === 0
                                                  ? "top"
                                                  : index + 1 >=
                                                          displayedResults ||
                                                      index + 1 >=
                                                          searchResults.length
                                                    ? "bottom"
                                                    : undefined
                                        }
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
            </Box>
            <Box
                sx={{
                    mt: 2,
                    textAlign: "center",
                    display:
                        displayedResults >= searchResults.length
                            ? "none"
                            : undefined,
                }}
            >
                <Button
                    variant="contained"
                    onClick={() => {
                        setDisplayedResults(displayedResults + 25);
                    }}
                >
                    Load more results
                </Button>
            </Box>
        </>
    );
}
