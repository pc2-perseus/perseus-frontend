// React imports
import React from "react";

// MUI imports
import {
    Box,
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    Collapse,
    TableHead,
    TableRow,
    Typography,
    Paper,
    ButtonGroup,
    Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

// Icon imports
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import AddIcon from "@mui/icons-material/Add";

// Custom imports
import EmailTemplate from "../../../interfaces/EmailTemplate.ts";
import getEmailTemplates from "../../../api/email-templates/getEmailTemplates.ts";
import deleteEmailTemplate from "../../../api/email-templates/deleteEmailTemplate.ts";
import postNewEmailTemplate from "../../../api/email-templates/postNewEmailTemplate.ts";
import postEditEmailTemplate from "../../../api/email-templates/postEditEmailTemplate.ts";
import EditEmailTemplateDialog from "./EditEmailTemplateDialog.tsx";
import HelpDialog from "./HelpDialog.tsx";
import DeleteDialog from "./DeleteDialog.tsx";
import PreviewDialog from "./PreviewDialog.tsx";
import LoadingBar from "../../LoadingBar.tsx";
import SearchBar from "../../SearchBar.tsx";

export default function EmailTemplateManager(): React.ReactElement {
    const [loading, setLoading] = React.useState<boolean>(true);
    const [search, setSearch] = React.useState<string>("");

    const [openHelp, setOpenHelp] = React.useState<boolean>(false);
    const [templates, setTemplates] = React.useState<EmailTemplate[]>([]);
    const [previewTemplate, setPreviewTemplate] =
        React.useState<EmailTemplate | null>(null);
    const [editTemplate, setEditTemplate] =
        React.useState<EmailTemplate | null>(null);
    const [addTemplate, setAddTemplate] = React.useState<boolean>(false);

    const [deleteTemplate, setDeleteTemplate] =
        React.useState<EmailTemplate | null>(null);

    const parseEmailTemplateContent = (content: string) =>
        content.replace(/(\\n)/g, "\n");
    const theme = useTheme();
    const parseEmailTemplateContentAddColor = (content: string) =>
        content.replace(
            /({[^{}]*})/g,
            '<span style="color: ' + theme.palette.primary.main + ';">$1</span>'
        );

    React.useEffect(() => {
        setEmailTemplates();
    }, []);

    if (loading) {
        return <LoadingBar />;
    }

    const external_templates = templates.filter(
        (template) =>
            template.email_template_type === "EXTERNAL" &&
            (template.template_id.toLowerCase().includes(search) ||
                template.name.toLowerCase().includes(search))
    );
    const internal_templates = templates.filter(
        (template) =>
            template.email_template_type === "INTERNAL" &&
            (template.template_id.toLowerCase().includes(search) ||
                template.name.toLowerCase().includes(search))
    );

    function setEmailTemplates() {
        getEmailTemplates().then((result: EmailTemplate[]) => {
            setTemplates(result);
            setLoading(false);
        });
    }

    function finalDeleteEmailTemplate() {
        if (deleteTemplate !== null && deleteTemplate._id !== null) {
            setLoading(true);
            deleteEmailTemplate(deleteTemplate._id).then((result) => {
                if (result) {
                    setEmailTemplates();
                    setDeleteTemplate(null);
                    setLoading(false);
                }
            });
        }
    }

    function addNewTemplate(template: EmailTemplate | null) {
        if (template !== null) {
            setLoading(true);

            postNewEmailTemplate(template).then((result) => {
                if (result) {
                    setEmailTemplates();
                    setAddTemplate(false);
                    setLoading(false);
                } else {
                    setLoading(false);
                    setAddTemplate(false);
                }
            });
        }
    }

    function editExistingTemplate(template: EmailTemplate | null) {
        if (template !== null) {
            setLoading(true);

            postEditEmailTemplate(template).then((result) => {
                if (result) {
                    setEmailTemplates();
                    setEditTemplate(null);
                    setLoading(false);
                } else {
                    setEmailTemplates();
                    setLoading(false);
                    setEditTemplate(null);
                }
            });
        }
    }

    function Row(props: { row: EmailTemplate }) {
        const { row } = props;
        const [open, setOpen] = React.useState(false);

        return (
            <React.Fragment>
                <TableRow>
                    <TableCell sx={{ borderBottom: "none", pt: 2 }}>
                        <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setOpen(!open)}
                        >
                            {open ? (
                                <KeyboardArrowUpIcon />
                            ) : (
                                <KeyboardArrowDownIcon />
                            )}
                        </IconButton>
                    </TableCell>
                    <TableCell
                        align="justify"
                        component="th"
                        scope="row"
                        sx={{ borderBottom: "none", pt: 2 }}
                    >
                        {row.template_id}
                    </TableCell>
                    <TableCell
                        align="justify"
                        component="th"
                        scope="row"
                        sx={{ borderBottom: "none", pt: 2 }}
                    >
                        {row.name}
                    </TableCell>
                    <TableCell
                        align="right"
                        component="th"
                        scope="row"
                        sx={{ borderBottom: "none", pt: 2 }}
                    >
                        <ButtonGroup
                            variant="outlined"
                            aria-label="Template actions"
                        >
                            <Button
                                color="primary"
                                onClick={() => {
                                    setPreviewTemplate(row);
                                }}
                            >
                                Preview
                            </Button>
                            <Button
                                color="secondary"
                                onClick={() => {
                                    setEditTemplate(row);
                                }}
                            >
                                Edit
                            </Button>
                        </ButtonGroup>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell />
                    <TableCell
                        style={{
                            paddingBottom: 0,
                            paddingTop: 0,
                        }}
                        colSpan={3}
                    >
                        <Collapse in={open} timeout="auto">
                            <Box sx={{ pb: 1, mt: 2 }}>
                                <Box
                                    dangerouslySetInnerHTML={{
                                        __html: parseEmailTemplateContentAddColor(
                                            parseEmailTemplateContent(
                                                row.content
                                            )
                                        ),
                                    }}
                                    sx={{
                                        border: 1,
                                        borderColor: "grey.500",
                                        borderRadius: 1,
                                        p: 2,
                                        whiteSpace: "pre-wrap",
                                    }}
                                />
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => setDeleteTemplate(row)}
                                    sx={{ mt: 2 }}
                                >
                                    Delete template
                                </Button>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            </React.Fragment>
        );
    }

    return (
        <>
            <SearchBar
                onSearch={(value: string) => {
                    setSearch(value.toLowerCase());
                }}
                actionTitle="Add email template"
                actionIcon={<AddIcon />}
                onAction={() => {
                    setAddTemplate(true);
                }}
            />

            <Stack spacing={2} sx={{ mt: 2, width: "100%" }}>
                <Typography variant="h5">External Email Templates</Typography>
                <TableContainer component={Paper}>
                    <Table
                        aria-label="collapsible table"
                        size="small"
                        sx={{
                            width: "100%",
                            tableLayout: "fixed",
                            overflowWrap: "break-word",
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell align="justify">
                                    Template ID
                                </TableCell>
                                <TableCell align="justify">
                                    Template name
                                </TableCell>
                                <TableCell align="right" />
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{ width: "100%" }}>
                            {external_templates.length == 0 ? (
                                <TableRow
                                    sx={{ "& > *": { borderBottom: "unset" } }}
                                >
                                    <TableCell />
                                    <TableCell colSpan={3}>
                                        No templates found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                external_templates.map((row) => (
                                    <Row key={row.name} row={row} />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Typography variant="h5">Internal Email Templates</Typography>
                <TableContainer component={Paper}>
                    <Table aria-label="collapsible table" size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell align="justify">
                                    Template ID
                                </TableCell>
                                <TableCell align="justify">
                                    Template name
                                </TableCell>
                                <TableCell align="right" />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {internal_templates.length == 0 ? (
                                <TableRow
                                    sx={{ "& > *": { borderBottom: "unset" } }}
                                >
                                    <TableCell />
                                    <TableCell colSpan={3}>
                                        No templates found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                internal_templates.map((row) => (
                                    <Row key={row.name} row={row} />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>

            <PreviewDialog
                template={previewTemplate}
                onHide={() => {
                    setPreviewTemplate(null);
                }}
            />

            <DeleteDialog
                onHide={() => {
                    setDeleteTemplate(null);
                }}
                onDelete={finalDeleteEmailTemplate}
                template={deleteTemplate}
            />

            <EditEmailTemplateDialog
                title="Add a new Email template"
                show={addTemplate}
                onHide={() => setAddTemplate(false)}
                submitTemplate={addNewTemplate}
                openHelp={() => setOpenHelp(true)}
            />

            <EditEmailTemplateDialog
                title="Edit template"
                template={editTemplate}
                show={editTemplate !== null}
                onHide={() => setEditTemplate(null)}
                submitTemplate={editExistingTemplate}
                openHelp={() => setOpenHelp(true)}
            />

            <HelpDialog
                show={openHelp}
                onHide={() => {
                    setOpenHelp(false);
                }}
            />
        </>
    );
}
