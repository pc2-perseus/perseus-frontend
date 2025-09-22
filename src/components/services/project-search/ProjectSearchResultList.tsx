// React imports
import React from "react";
import { useNavigate } from "react-router-dom";

// MUI imports
import { Box, Button, Divider } from "@mui/material";

// Custom imports
import Project from "../../../interfaces/Project.ts";
import ProjectSearchResult from "./ProjectSearchResult.tsx";

export default function ProjectSearchResultList({
    searchResults,
    isSearchActive = true,
}: {
    searchResults: Project[];
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

    function isArchived(project: Project): boolean {
        return (
            project.state_machine.current_states.length === 1 &&
            project.state_machine.current_states[0] === "Archive"
        );
    }

    function isNotArchived(project: Project): boolean {
        return !isArchived(project);
    }

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
                navigate("/ProjectSearch/" + searchResults[selectedResult]._id);
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
                    .filter(isNotArchived)
                    .slice(0, displayedResults)
                    .map((result: Project, index: number) => {
                        const isSelected: boolean = index === selectedResult;
                        const isEdge =
                            index === 0 &&
                            searchResults.filter(isNotArchived).length === 1
                                ? "both"
                                : index === 0
                                  ? "top"
                                  : index + 1 >= displayedResults ||
                                      index + 1 >=
                                          searchResults.filter(isNotArchived)
                                              .length
                                    ? "bottom"
                                    : undefined;
                        return (
                            <React.Fragment key={result._id}>
                                {isSelected ? (
                                    <div ref={selectedResultRef}>
                                        <ProjectSearchResult
                                            project={result}
                                            isSelected={isSelected}
                                            isEdge={isEdge}
                                        />
                                    </div>
                                ) : (
                                    <ProjectSearchResult
                                        project={result}
                                        isSelected={isSelected}
                                        isEdge={isEdge}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                <Divider
                    sx={{
                        my: 3,
                        display:
                            searchResults.filter(isArchived).length === 0 ||
                            searchResults.filter(isNotArchived).length >=
                                displayedResults
                                ? "none"
                                : undefined,
                    }}
                />
                {searchResults
                    .filter(isArchived)
                    .slice(
                        0,
                        Math.max(
                            0,

                            displayedResults -
                                searchResults.filter(isNotArchived).length
                        )
                    )
                    .map((result: Project, index: number) => {
                        const isSelected: boolean =
                            index +
                                searchResults.filter(isNotArchived).length ===
                            selectedResult;
                        return (
                            <React.Fragment key={result._id}>
                                {isSelected ? (
                                    <div ref={selectedResultRef}>
                                        <ProjectSearchResult
                                            project={result}
                                            isSelected={isSelected}
                                            isEdge={
                                                index === 0 &&
                                                searchResults.length === 1
                                                    ? "both"
                                                    : index === 0
                                                      ? "top"
                                                      : index +
                                                              searchResults.filter(
                                                                  isNotArchived
                                                              ).length +
                                                              1 >=
                                                              displayedResults ||
                                                          index + 1 >=
                                                              searchResults.filter(
                                                                  isArchived
                                                              ).length
                                                        ? "bottom"
                                                        : undefined
                                            }
                                        />
                                    </div>
                                ) : (
                                    <ProjectSearchResult
                                        project={result}
                                        isSelected={isSelected}
                                        isEdge={
                                            index === 0 &&
                                            searchResults.length === 1
                                                ? "both"
                                                : index === 0
                                                  ? "top"
                                                  : index +
                                                          searchResults.filter(
                                                              isNotArchived
                                                          ).length +
                                                          1 >=
                                                          displayedResults ||
                                                      index + 1 >=
                                                          searchResults.filter(
                                                              isArchived
                                                          ).length
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
