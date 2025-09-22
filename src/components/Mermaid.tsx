// React imports
import React, { MouseEventHandler } from "react";

// MUI imports
import { Theme, useTheme } from "@mui/material";

// Other imports
import mermaid from "mermaid";

export default function Mermaid({
    chart,
    onClick,
}: {
    chart: string;
    onClick?: MouseEventHandler<HTMLDivElement>;
}): string | React.JSX.Element | React.JSX.Element[] {
    const idRef = React.useRef<string>(
        `mermaid-${Math.floor(Math.random() * 100000)}`
    );
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const theme: Theme = useTheme();

    React.useLayoutEffect(() => {
        let active: boolean = true;
        mermaid.initialize({
            startOnLoad: false,
            theme: theme.palette.mode === "dark" ? "dark" : "default",
        });

        mermaid.render(idRef.current, chart).then((result) => {
            if (active && containerRef.current !== null) {
                containerRef.current.innerHTML = result.svg;
            }
        });
        return () => {
            active = false;
        };
    }, [chart, theme.palette.mode]);

    return <div ref={containerRef} onClick={onClick} />;
}
