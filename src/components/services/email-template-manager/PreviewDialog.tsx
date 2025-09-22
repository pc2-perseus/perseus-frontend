// React imports
import React, { ReactElement } from "react";

// MUI imports
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Skeleton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

// Icon imports
import RefreshIcon from "@mui/icons-material/Refresh";

// Custom imports
import EmailTemplate from "../../../interfaces/EmailTemplate.ts";
import searchProjects from "../../../api/project-search/searchProjects.ts";
import Project from "../../../interfaces/Project.ts";
import getFormattedEmailTemplate from "../../../api/email-templates/getFormattedEmailTemplate.ts";

export default function PreviewDialog({
    template,
    onHide,
}: {
    template: EmailTemplate | null;
    onHide: () => void;
}): React.ReactElement {
    const [currentTemplate, setCurrentTemplate] =
        React.useState<EmailTemplate | null>(null);
    const [previewLoading, setPreviewLoading] = React.useState<boolean>(true);
    const [errorMessage, setErrorMessage] = React.useState<ReactElement | null>(
        null
    );

    const [formattedEmailTemplate, setFormattedEmailTemplate] =
        React.useState<EmailTemplate | null>(null);
    const [randomProject, setRandomProject] = React.useState<Project | null>(
        null
    );

    React.useEffect(() => {
        setCurrentTemplate(JSON.parse(JSON.stringify(template)));
        getNewRandomProject();
    }, [template]);

    React.useEffect(() => {
        if (randomProject !== null && currentTemplate !== null) {
            formatEmailTemplate(currentTemplate);
        }
    }, [randomProject]);

    const parseEmailTemplateContent = (content: string) =>
        content.replace(/(\\n)/g, "\n");
    const theme = useTheme();
    const parseEmailTemplateContentAddColor = (content: string) =>
        content.replace(
            /({[^{}]*})/g,
            '<span style="color: ' + theme.palette.primary.main + ';">$1</span>'
        );

    function getNewRandomProject() {
        setPreviewLoading(true);
        setErrorMessage(null);

        if (template !== null) {
            // get the first 50 active projects
            searchProjects("", { is_active: [true] }, 1, 50).then(
                (result: Project[]) => {
                    const randomInt = Math.floor(Math.random() * result.length);
                    if (result.length >= 1) {
                        setRandomProject(result[randomInt]);
                    } else {
                        setPreviewLoading(false);

                        setErrorMessage(
                            <Alert severity="error" variant="outlined">
                                Cannot preview email template! No active
                                projects found.
                            </Alert>
                        );
                    }
                }
            );
        }
    }

    function formatEmailTemplate(template: EmailTemplate) {
        if (template !== null && template._id !== null) {
            if (randomProject !== null && randomProject._id !== null) {
                getFormattedEmailTemplate(template._id, randomProject._id).then(
                    (formatted_template) => {
                        // failed to format the email template -> Maybe an AttributeError?
                        if (
                            formatted_template !== null &&
                            "result" in formatted_template &&
                            "reason" in formatted_template &&
                            formatted_template.result === false &&
                            formatted_template.reason !== null
                        ) {
                            setFormattedEmailTemplate(template);
                            if (formattedEmailTemplate !== null) {
                                formattedEmailTemplate.content =
                                    parseEmailTemplateContentAddColor(
                                        template.content
                                    );
                            }
                            setErrorMessage(
                                <Alert severity="error" variant="outlined">
                                    {formatted_template.reason}
                                </Alert>
                            );
                        } else {
                            // successfully formatted email template -> formatted_template === EmailTemplate()
                            if (
                                formatted_template !== null &&
                                "content" in formatted_template
                            ) {
                                formatted_template.content =
                                    parseEmailTemplateContentAddColor(
                                        formatted_template.content
                                    );
                                setFormattedEmailTemplate(formatted_template);
                            }
                        }

                        // disable skeleton loading, if the preview dialog is active
                        if (template !== null) {
                            setPreviewLoading(false);
                        }
                    }
                );
            }
        }
    }

    return (
        <Dialog
            open={template !== null}
            onClose={() => {
                onHide();
                setErrorMessage(null);
                setFormattedEmailTemplate(null);
                setPreviewLoading(false);
            }}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>Preview Email template: {template?.name}</DialogTitle>
            <DialogContent>
                {errorMessage !== null ? errorMessage : ""}
                <Box sx={{ mb: 2 }}>
                    {previewLoading ? (
                        <Skeleton
                            variant="rectangular"
                            animation="wave"
                            width={160}
                            height={30}
                        />
                    ) : (
                        !errorMessage && (
                            <Button
                                aria-label="refresh previewing template"
                                size="small"
                                onClick={() => getNewRandomProject()}
                                variant="contained"
                            >
                                <RefreshIcon /> random project
                            </Button>
                        )
                    )}
                </Box>
                {previewLoading ? (
                    <Skeleton
                        variant="rectangular"
                        animation="wave"
                        width="100%"
                        height={300}
                    />
                ) : formattedEmailTemplate ? (
                    <Box
                        dangerouslySetInnerHTML={{
                            __html: parseEmailTemplateContentAddColor(
                                parseEmailTemplateContent(
                                    formattedEmailTemplate.content
                                )
                            ),
                        }}
                        component="div"
                        minHeight={300}
                        maxHeight={300}
                        overflow="auto"
                        fontSize={14}
                        sx={{
                            border: 1,
                            borderColor: "grey.500",
                            borderRadius: 1,
                            p: 2,
                            whiteSpace: "pre-wrap",
                        }}
                    />
                ) : (
                    ""
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        onHide();
                        setErrorMessage(null);
                        setFormattedEmailTemplate(null);
                        setPreviewLoading(false);
                    }}
                >
                    Back
                </Button>
            </DialogActions>
        </Dialog>
    );
}
