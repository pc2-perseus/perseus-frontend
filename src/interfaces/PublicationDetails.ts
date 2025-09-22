import DatabaseItem from "./DatabaseItem.ts";

export default interface PublicationDetails extends DatabaseItem {
    source: "semanticscholar" | "crossref";
    title: string | null;
    authors: string[];
    abstract: string | null;
    venue: string | null;
    publisher: string | null;
    year: number | null;
    citation_count: number | null;
    journal: string | null;
    bibtex: string | null;
    created: string | null;
}
