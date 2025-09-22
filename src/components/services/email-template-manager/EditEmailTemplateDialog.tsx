// React imports
import React from "react";

// Mui imports
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    TextField,
    Tooltip,
} from "@mui/material";

// Custom imports
import { EmailTemplateType } from "../../../interfaces/EmailTemplateType.ts";
import EmailTemplate from "../../../interfaces/EmailTemplate.ts";

export default function EditEmailTemplateDialog({
    title,
    show,
    onHide,
    template,
    submitTemplate,
    openHelp,
}: {
    title: string;
    show: boolean;
    onHide: () => void;
    template?: EmailTemplate | null;
    submitTemplate: (template: EmailTemplate | null) => void;
    openHelp: () => void;
}): React.ReactElement {
    const [currentTemplate, setCurrentTemplate] = React.useState<EmailTemplate>(
        {
            _id: null,
            files: {},
            file_tags: {},
            template_id: "",
            name: "",
            content: "",
            email_template_type: "EXTERNAL",
        }
    );

    React.useEffect(() => {
        if (template === undefined || template === null) {
            setCurrentTemplate({
                _id: null,
                files: {},
                file_tags: {},
                template_id: "",
                name: "",
                content: "",
                email_template_type: "EXTERNAL",
            });
        } else {
            setCurrentTemplate(JSON.parse(JSON.stringify(template)));
        }
    }, [template, show]);

    const [error, setError] = React.useState<string | null>(null);

    const validate = (): boolean => {
        const allowedHTMLTags = new Set([
            "p",
            "h1",
            "h2",
            "h3",
            "h4",
            "strong",
            "i",
            "b",
            "small",
            "a",
            "ul",
            "ol",
            "li",
            "code",
            "hr",
            "br",
        ]);

        const allowedHTMLTagAttributes = new Set(["style", "href"]);

        const tagRegex = /<\s*\/?\s*([a-zA-Z0-9]+)([^>]*)>/g;
        let match;

        while ((match = tagRegex.exec(currentTemplate.content)) !== null) {
            const tagName = match[1].toLowerCase();
            const attrString = match[2];

            if (!allowedHTMLTags.has(tagName)) {
                setError(
                    "Only following HTML-tags are allowed: " +
                        Array.from(allowedHTMLTags).join(", ")
                );
                return false;
            }

            const attrRegex = /([a-zA-Z0-9-]+)\s*=\s*(['"]).*?\2/g;
            let attrMatch;
            while ((attrMatch = attrRegex.exec(attrString)) !== null) {
                const attrName = attrMatch[1].toLowerCase();
                if (!allowedHTMLTagAttributes.has(attrName)) {
                    setError(
                        "Only following attributes are allowed: " +
                            Array.from(allowedHTMLTagAttributes).join(", ")
                    );
                    return false;
                }
            }
        }
        setError(null);

        return true;
    };

    return (
        <Dialog open={show} onClose={onHide} maxWidth="md" fullWidth>
            <DialogTitle>{title}</DialogTitle>

            <DialogContent>
                <TextField
                    label="Email template ID"
                    fullWidth
                    required
                    sx={{ mt: 2 }}
                    value={currentTemplate.template_id}
                    onChange={(e) => {
                        if (currentTemplate !== null) {
                            currentTemplate.template_id = e.currentTarget.value;
                            setCurrentTemplate(
                                JSON.parse(JSON.stringify(currentTemplate))
                            );
                        }
                    }}
                />
                <TextField
                    label="Email template name"
                    id="addEmailTemplateName"
                    fullWidth
                    required
                    sx={{ mt: 2 }}
                    value={currentTemplate.name}
                    onChange={(e) => {
                        if (currentTemplate !== null) {
                            currentTemplate.name = e.currentTarget.value;
                            setCurrentTemplate(
                                JSON.parse(JSON.stringify(currentTemplate))
                            );
                        }
                    }}
                />
                <TextField
                    label="Email template content"
                    multiline
                    fullWidth
                    required
                    minRows={12}
                    maxRows={12}
                    id="addEmailTemplateContent"
                    error={error !== null}
                    helperText={error}
                    sx={{ mt: 2 }}
                    slotProps={{
                        htmlInput: {
                            style: { fontSize: 14 },
                        },
                    }}
                    value={currentTemplate.content}
                    onChange={(e) => {
                        validate();
                        if (currentTemplate !== null) {
                            currentTemplate.content = e.currentTarget.value;
                            setCurrentTemplate(
                                JSON.parse(JSON.stringify(currentTemplate))
                            );
                        }
                    }}
                />
                <FormControl sx={{ mt: 2 }}>
                    <FormLabel id="radio-button-email-template-type-group-label">
                        Email template type
                    </FormLabel>
                    <RadioGroup
                        name="radio-button-email-template-type-group"
                        value={currentTemplate.email_template_type}
                        onChange={(e) => {
                            if (currentTemplate !== null) {
                                currentTemplate.email_template_type = e
                                    .currentTarget.value as EmailTemplateType;
                                setCurrentTemplate(
                                    JSON.parse(JSON.stringify(currentTemplate))
                                );
                            }
                        }}
                    >
                        <Tooltip
                            title="For PERSEUS internal emails - e.g. project state changes"
                            arrow
                            placement="right"
                        >
                            <FormControlLabel
                                value="INTERNAL"
                                control={<Radio />}
                                label="Internal template"
                            />
                        </Tooltip>
                        <Tooltip
                            title="For external emails - e.g. mail to the PI/PC of a project"
                            arrow
                            placement="right"
                        >
                            <FormControlLabel
                                value="EXTERNAL"
                                control={<Radio />}
                                label="External template"
                            />
                        </Tooltip>
                    </RadioGroup>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={openHelp}
                >
                    Help
                </Button>
                <div style={{ flex: "1 0 0" }} />
                <Button onClick={onHide}>Back</Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        if (validate()) {
                            submitTemplate(currentTemplate);
                        }
                    }}
                >
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
}
