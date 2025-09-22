// React imports
import React from "react";

// Other imports
import parse from "html-react-parser";
import { marked } from "marked";
import DOMPurify from "dompurify";

export default function parseMarkdown(
    value: string
): string | React.ReactElement | React.ReactElement[] {
    return parse(
        DOMPurify.sanitize(marked.parse(value).toString(), {
            USE_PROFILES: { html: true },
            ALLOWED_TAGS: [
                "p",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6",
                "ul",
                "ol",
                "li",
                "code",
                "br",
                "b",
                "i",
                "hr",
                "em",
                "s",
                "strong",
                "u",
                "table",
                "tr",
                "td",
                "thead",
                "tbody",
            ],
            ALLOW_UNKNOWN_PROTOCOLS: false,
            ADD_ATTR: ["target"],
        })
    );
}
