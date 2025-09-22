// React imports
import React from "react";

// MUI imports
import { Box, Theme, useTheme } from "@mui/material";

// Custom imports
import getLog from "../../api/getLog.ts";
import { usePeriodicHook } from "../../utils/usePeriodicHook.ts";
import LoadingBar from "../LoadingBar.tsx";

export default function LogService({
    type,
}: {
    type: "production" | "development";
}): React.ReactElement {
    const [lines, setLines] = React.useState<string[]>([]);

    const endRef = React.useRef<null | HTMLDivElement>(null);

    const theme: Theme = useTheme();

    function logEntryColor(type: string): string {
        switch (type) {
            case "INFO":
                return theme.palette.info.main;
            case "WARNING":
                return theme.palette.warning.main;
            case "ERROR":
                return theme.palette.error.main;
            case "CRITICAL":
                return theme.palette.error.main;
            default:
                return theme.palette.text.primary;
        }
    }

    function isInViewport(offset = 0) {
        if (!endRef) return false;
        const top = endRef.current?.getBoundingClientRect().top;
        return (
            top !== undefined &&
            top + offset >= 0 &&
            top - offset <= window.innerHeight
        );
    }

    React.useEffect(() => {
        setLines([]);
        getLog(type).then((result) => {
            setLines(result);
            window.setTimeout(() => {
                endRef.current?.scrollIntoView({ behavior: "instant" });
            }, 10);
        });
    }, [type]);

    React.useEffect(() => {
        getLog(type).then((result) => {
            setLines(result);
            endRef.current?.scrollIntoView({ behavior: "instant" });
        });
    }, []);

    usePeriodicHook(() => {
        getLog(type).then((result) => {
            setLines(result);
            if (isInViewport()) {
                window.setTimeout(() => {
                    endRef.current?.scrollIntoView({ behavior: "instant" });
                }, 10);
            }
        });
    }, 15000);

    return (
        <Box sx={{ fontFamily: "Monospace" }}>
            <Box sx={{ mb: 2 }}>
                {lines.map((line, index: number) => {
                    const parts = line.split(" - ");
                    return (
                        <Box key={index}>
                            {parts[0]}
                            {parts.length > 1 ? " - " : ""}
                            <Box
                                component="span"
                                sx={{ color: logEntryColor(parts[1]) }}
                            >
                                {parts[1]}
                            </Box>
                            {parts.length > 2 ? " - " : ""}
                            {parts.slice(2).join(" - ")}
                        </Box>
                    );
                })}
            </Box>
            <LoadingBar />
            <Box ref={endRef}></Box>
        </Box>
    );
}

("2025-07-31 15:01:10,843 - INFO - Email 'Warning - Cannot create compute project hpc-prf-kiko (NHR-JARDS, #25128)' sent successfully to robert.schade@uni-paderborn.de");
