// React imports
import React from "react";

// MUI imports
import {
    Box,
    Divider,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";

// Custom imports

// Other imports
import _ from "lodash";
import getReport from "../../../api/reporting/getReport.ts";
import CONFIG from "../../../config.ts";
import Image from "../../Image.tsx";
import parseMarkdown from "../../../dynamic-forms/core/parseMarkdown.ts";
import DownloadableJSONButton from "../../DownloadableJSONButton.tsx";
import isoToLocaleString from "../../../utils/isoToLocaleString.ts";
import LoadingBar from "../../LoadingBar.tsx";

export default function Report({
    reportId,
}: {
    reportId: string;
}): React.ReactElement {
    const [loading, setLoading] = React.useState<boolean>(true);
    const [pageSelection, setPageSelection] = React.useState<
        "data" | "charts" | "documents" | null
    >(null);

    const [reportName, setReportName] = React.useState<string>("");
    const [reportCreatedAt, setReportCreatedAt] = React.useState<string>("");
    const [reportMarkdown, setReportMarkdown] = React.useState<string[]>([]);
    const [reportData, setReportData] = React.useState<object | null>(null);
    const [reportCharts, setReportCharts] = React.useState<string[]>([]);
    const [reportDocuments, setReportDocuments] = React.useState<string[]>([]);

    React.useEffect(() => {
        setLoading(true);
        setPageSelection(null);
        const hash: string = window.location.hash.replaceAll("#", "");
        const parameters: { [key: string]: string } = {};
        if (hash.length > 0) {
            hash.split(";").forEach((parameterString: string) => {
                const [key, value] = parameterString.split("=", 2);
                parameters[key] = value;
            });
        }
        getReport(
            reportId,
            "start" in parameters ? parameters["start"] : null,
            "end" in parameters ? parameters["end"] : null,
            null
        ).then(
            (result: {
                name: string;
                created_at: string;
                markdown: string[];
                data: object | null;
                charts: string[];
                documents: string[];
            }) => {
                setReportName(result.name);
                setReportCreatedAt(result.created_at);
                setReportMarkdown(result.markdown);
                setReportData(result.data);
                setReportCharts(result.charts);
                setReportDocuments(result.documents);
                setLoading(false);
            }
        );
    }, [reportId]);

    React.useEffect(() => {
        if (pageSelection === null) {
            if (reportMarkdown.length > 0) {
                setPageSelection("data");
            } else if (reportCharts.length > 0) {
                setPageSelection("charts");
            } else if (reportDocuments.length > 0) {
                setPageSelection("documents");
            }
        }
    }, [loading]);

    if (loading) {
        return <LoadingBar />;
    }
    return (
        <>
            <Box sx={{ width: "100%", textAlign: "center", mb: 2 }}>
                <Typography variant="h4">{reportName}</Typography>
            </Box>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <ToggleButtonGroup
                    color="primary"
                    exclusive
                    value={pageSelection}
                    onChange={(_, val) => {
                        if (val !== null) {
                            setPageSelection(val);
                        }
                    }}
                >
                    {reportData === null || _.keys(reportData).length === 0 ? (
                        ""
                    ) : (
                        <ToggleButton value="data">Data</ToggleButton>
                    )}
                    {reportCharts.length === 0 ? (
                        ""
                    ) : (
                        <ToggleButton value="charts">Charts</ToggleButton>
                    )}
                    {reportDocuments.length === 0 ? (
                        ""
                    ) : (
                        <ToggleButton value="document">Document</ToggleButton>
                    )}
                </ToggleButtonGroup>
            </Box>
            <Box sx={{ width: "100%", textAlign: "right" }}>
                <Typography
                    sx={{ fontSize: 14 }}
                    color="text.secondary"
                    gutterBottom
                >
                    Report created at: {isoToLocaleString(reportCreatedAt)}
                </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box
                sx={{
                    display: pageSelection === "data" ? undefined : "none",
                }}
            >
                <Box
                    sx={{
                        width: "100%",
                        textAlign: "right",
                        mb: 2,
                    }}
                >
                    <DownloadableJSONButton
                        buttonText="Download data"
                        json={reportData === null ? {} : reportData}
                        variant="contained"
                    />
                </Box>
                {reportMarkdown.map((markdownString: string, index: number) => {
                    return (
                        <Box key={index}>{parseMarkdown(markdownString)}</Box>
                    );
                })}
            </Box>
            <Box
                sx={{
                    display: pageSelection === "charts" ? "flex" : "none",
                    alignItems: "center",
                    flexDirection: "column",
                    gap: "10px",
                }}
            >
                {reportCharts.map((source: string) => {
                    return (
                        <Image
                            key={source}
                            src={CONFIG.CORE_URL + "/reporting/chart/" + source}
                            alt="Chart"
                            height={500}
                            width={1000}
                        />
                    );
                })}
            </Box>
        </>
    );
}
