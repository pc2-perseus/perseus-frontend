// React imports
import React from "react";

// MUI imports

// Custom imports
import Publication from "../../../interfaces/Publication.ts";
import MaterialUICopyField from "../../../dynamic-forms/renderer/mui/MaterialUICopyField.tsx";
import {
    Box,
    Divider,
    List,
    ListItem,
    ListItemText,
    Theme,
    useTheme,
} from "@mui/material";
import PublicationDetails from "../../../interfaces/PublicationDetails.ts";
import ExpandableText from "../../ExpandableText.tsx";
import isoToLocaleString from "../../../utils/isoToLocaleString.ts";

export default function PublicationList({
    publications,
}: {
    publications: Publication[];
}): React.ReactElement {
    const theme: Theme = useTheme();

    function mergeDetails(publication: Publication): PublicationDetails {
        const details: PublicationDetails = {
            _id: null,
            files: {},
            file_tags: {},
            source: "semanticscholar",
            title: null,
            authors: [],
            abstract: null,
            venue: null,
            publisher: null,
            year: null,
            citation_count: null,
            journal: null,
            bibtex: null,
            created: null,
        };
        ["semanticscholar", "crossref"].forEach((source: string) => {
            publication.details.forEach((detailsItem: PublicationDetails) => {
                if (detailsItem.source === source) {
                    if (details.title === null) {
                        details.title = detailsItem.title;
                    }
                    if (details.authors.length === 0) {
                        details.authors = detailsItem.authors;
                    }
                    if (details.abstract === null) {
                        details.abstract = detailsItem.abstract;
                    }
                    if (details.venue === null) {
                        details.venue = detailsItem.venue;
                    }
                    if (details.publisher === null) {
                        details.publisher = detailsItem.publisher;
                    }
                    if (details.year === null) {
                        details.year = detailsItem.year;
                    }
                    if (details.citation_count === null) {
                        details.citation_count = detailsItem.citation_count;
                        details.created = detailsItem.created;
                        details.source = detailsItem.source;
                    }
                    if (details.journal === null) {
                        details.journal = detailsItem.journal;
                    }
                    if (details.bibtex === null) {
                        details.bibtex = detailsItem.bibtex;
                    }
                }
            });
        });
        return details;
    }

    return (
        <List>
            {publications.map((publication: Publication, index: number) => {
                const details: PublicationDetails = mergeDetails(publication);
                if (publication.type === "doi") {
                    const secondary: string[] = [];
                    if (details.authors.length > 0) {
                        secondary.push(details.authors.join(", "));
                    }
                    let next: string = "";
                    if (details.journal !== null) {
                        next += details.journal;
                    } else if (details.venue !== null) {
                        next += details.venue;
                    }
                    if (details.year !== null) {
                        next +=
                            next.length > 0
                                ? " • " + details.year.toString()
                                : details.year.toString();
                    }
                    if (details.publisher !== null) {
                        next +=
                            next.length > 0
                                ? " • " + details.publisher
                                : details.publisher;
                    }
                    if (next.length > 0) {
                        secondary.push(next);
                    }
                    if (details.citation_count !== null) {
                        secondary.push(
                            "Cited by " +
                                details.citation_count.toString() +
                                (details.created !== null
                                    ? " (fetched on " +
                                      isoToLocaleString(details.created) +
                                      " from " +
                                      details.source +
                                      ")"
                                    : " (fetched from " + details.source + ")")
                        );
                    }
                    return (
                        <React.Fragment key={index}>
                            {index === 0 ? (
                                ""
                            ) : (
                                <Divider component="li" sx={{ ml: 2 }} />
                            )}
                            <ListItem>
                                <ListItemText
                                    primary={
                                        <a
                                            href={
                                                "https://doi.org/" +
                                                publication.content
                                            }
                                            target="_blank"
                                            style={{
                                                textDecoration: "none",
                                                color: theme.palette.primary
                                                    .main,
                                            }}
                                        >
                                            {details.title === null
                                                ? "https://doi.org/" +
                                                  publication.content
                                                : details.title}
                                        </a>
                                    }
                                    secondary={
                                        <>
                                            {secondary.map(
                                                (
                                                    line: string,
                                                    index: number
                                                ) => {
                                                    return (
                                                        <React.Fragment
                                                            key={index}
                                                        >
                                                            {index > 0 ? (
                                                                <br />
                                                            ) : (
                                                                ""
                                                            )}
                                                            {line}
                                                        </React.Fragment>
                                                    );
                                                }
                                            )}
                                            {details.abstract === null ? (
                                                ""
                                            ) : (
                                                <Box sx={{ mt: 1 }}>
                                                    <ExpandableText
                                                        content={
                                                            details.abstract
                                                        }
                                                    />
                                                </Box>
                                            )}
                                        </>
                                    }
                                />
                            </ListItem>
                        </React.Fragment>
                    );
                } else if (publication.type === "bibtex") {
                    return (
                        <MaterialUICopyField
                            config={{
                                type: "copyitem",
                                id: "bibtex",
                                value: publication.content,
                            }}
                        />
                    );
                }
                return <></>;
            })}
        </List>
    );
}
