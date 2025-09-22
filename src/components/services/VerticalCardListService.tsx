// React imports
import React from "react";

// MUI imports
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    InputAdornment,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TextField,
    Theme,
    Typography,
    useTheme,
} from "@mui/material";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view";

// Icon imports
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

// Custom imports
import getVerticalCardListServiceEntities from "../../api/getVerticalCardListServiceEntities.ts";
import VerticalCardListServiceEntity from "../../interfaces/VerticalCardListServiceEntity.ts";
import VerticalCardListServiceEntityContentItem from "../../interfaces/VerticalCardListServiceEntityContentItem.ts";
import checkServicePermission from "../../api/checkServicePermission.ts";
import DynamicForm from "../../dynamic-forms/DynamicForm.tsx";
import DynamicFormElement from "../../dynamic-forms/interfaces/DynamicFormElement.ts";
import CONFIG from "../../config.ts";
import deleteVerticalCardListServiceEntity from "../../api/deleteVerticalCardListServiceEntity.ts";
import LoadingBar from "../LoadingBar.tsx";

export default function VerticalCardListService({
    serviceId,
}: {
    serviceId: string;
}): React.ReactElement {
    const [entities, updateEntities] = React.useState<
        VerticalCardListServiceEntity[] | null
    >(null);
    const [searchFilter, setSearchFilter] = React.useState<string>("");
    const [hasProjectDetailPermission, setHasProjectDetailPermission] =
        React.useState<boolean>(false);

    const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(
        null
    );
    const [menuEntity, setMenuEntity] =
        React.useState<VerticalCardListServiceEntity | null>(null);

    const [currentEntity, setCurrentEntity] =
        React.useState<VerticalCardListServiceEntity | null>(null);
    const [showViewModal, setShowViewModal] = React.useState<boolean>(false);
    const [showEditModal, setShowEditModal] = React.useState<boolean>(false);
    const [showAddModal, setShowAddModal] = React.useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] =
        React.useState<boolean>(false);

    const [currentEntityForm, setCurrentEntityForm] =
        React.useState<DynamicFormElement>({ pages: [] });

    const theme: Theme = useTheme();

    function viewEntity(entity: VerticalCardListServiceEntity) {
        setCurrentEntity(entity);
        setShowViewModal(true);
    }

    function addEntity() {
        updateEntities(null);
        getVerticalCardListServiceEntities(serviceId).then((result) =>
            updateEntities(result)
        );
    }

    function editEntity() {
        updateEntities(null);
        getVerticalCardListServiceEntities(serviceId).then((result) =>
            updateEntities(result)
        );
    }

    function deleteEntity() {
        if (currentEntity !== null) {
            deleteVerticalCardListServiceEntity(serviceId, currentEntity).then(
                (result) => {
                    if (result) {
                        updateEntities(null);
                        getVerticalCardListServiceEntities(serviceId).then(
                            (result) => updateEntities(result)
                        );
                    }
                }
            );
        }
    }

    React.useEffect(() => {
        checkServicePermission("ProjectSearch").then((result) => {
            setHasProjectDetailPermission(result);
        });
        getVerticalCardListServiceEntities(serviceId).then((result) =>
            updateEntities(result)
        );
    }, []);

    if (entities === null) {
        return <LoadingBar />;
    }

    function entityFilter(entity: VerticalCardListServiceEntity): boolean {
        return (
            entity.name.includes(searchFilter) ||
            entity.items.some(entityFilter)
        );
    }

    const filteredEntities: VerticalCardListServiceEntity[] =
        entities.filter(entityFilter);

    function renderInnerEntities(
        entities: VerticalCardListServiceEntity[]
    ): React.ReactElement[] {
        return entities.map((entity: VerticalCardListServiceEntity) => {
            return (
                <TreeItem
                    itemId={entity.entity_id}
                    label={
                        <>
                            {entity.name}
                            <IconButton
                                size="small"
                                onClick={(
                                    event: React.MouseEvent<HTMLButtonElement>
                                ) => {
                                    event.stopPropagation();
                                    setMenuEntity(entity);
                                    setMenuAnchor(event.currentTarget);
                                }}
                                sx={{
                                    float: "right",
                                    height: "24px",
                                    width: "24px",
                                }}
                            >
                                <MoreHorizIcon />
                            </IconButton>
                        </>
                    }
                >
                    {renderInnerEntities(entity.items)}
                </TreeItem>
            );
        });
    }

    return (
        <Box>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 8, lg: 9 }}>
                    <TextField
                        label="Search"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        variant="outlined"
                        onChange={(e) =>
                            setSearchFilter(e.currentTarget.value.toLowerCase())
                        }
                        value={searchFilter}
                        fullWidth
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        sx={{ height: "100%" }}
                        onClick={() => {
                            addEntity();
                        }}
                    >
                        <AddIcon />
                        Add item
                    </Button>
                </Grid>
            </Grid>
            <Stack spacing={1} sx={{ mt: 2 }}>
                {filteredEntities.map(
                    (entity: VerticalCardListServiceEntity, index: number) => {
                        return (
                            <Paper elevation={16} sx={{ p: 2 }} key={index}>
                                <Typography
                                    variant="h5"
                                    component="span"
                                    gutterBottom
                                >
                                    {entity.name}
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={(
                                        event: React.MouseEvent<HTMLButtonElement>
                                    ) => {
                                        setMenuEntity(entity);
                                        setMenuAnchor(event.currentTarget);
                                    }}
                                    sx={{ float: "right" }}
                                >
                                    <MoreHorizIcon />
                                </Button>
                                <SimpleTreeView disableSelection sx={{ mt: 2 }}>
                                    {renderInnerEntities(entity.items)}
                                </SimpleTreeView>
                            </Paper>
                        );
                    }
                )}
            </Stack>
            <Menu
                open={menuAnchor !== null}
                anchorEl={menuAnchor}
                onClose={() => {
                    setMenuAnchor(null);
                }}
                MenuListProps={{ dense: true }}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                <MenuItem
                    onClick={() => {
                        if (menuEntity !== null) {
                            viewEntity(menuEntity);
                        }
                    }}
                >
                    <ListItemIcon>
                        <VisibilityIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>View details</ListItemText>
                </MenuItem>
                {menuEntity === null || !menuEntity.editing_allowed ? (
                    ""
                ) : (
                    <MenuItem
                        onClick={() => {
                            if (menuEntity !== null) {
                                const form: DynamicFormElement = {
                                    pages: [{ items: [] }],
                                    submitButton: "Submit changes",
                                    submitEndpoint:
                                        CONFIG.CORE_URL +
                                        "/vertical-card-list-service/" +
                                        serviceId +
                                        "/" +
                                        menuEntity.entity_id,
                                    onSuccess: editEntity,
                                };
                                menuEntity.content.forEach(
                                    (
                                        item: VerticalCardListServiceEntityContentItem
                                    ) => {
                                        if (item.edit_element !== null) {
                                            form.pages[0].items.push(
                                                item.edit_element
                                            );
                                        }
                                    }
                                );
                                setCurrentEntityForm(form);
                                setCurrentEntity(menuEntity);
                                setShowEditModal(true);
                            }
                        }}
                    >
                        <ListItemIcon>
                            <EditIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Edit item</ListItemText>
                    </MenuItem>
                )}
                {menuEntity === null || !menuEntity.adding_allowed ? (
                    ""
                ) : (
                    <MenuItem
                        onClick={() => {
                            if (menuEntity !== null) {
                                const form: DynamicFormElement = {
                                    pages: [{ items: [] }],
                                    submitButton: "Add item",
                                    submitEndpoint:
                                        CONFIG.CORE_URL +
                                        "/vertical-card-list-service/" +
                                        serviceId +
                                        "/" +
                                        menuEntity.entity_id +
                                        "/add",
                                    onSuccess: addEntity,
                                };
                                form.pages[0].items.push(
                                    ...menuEntity.adding_elements
                                );
                                setCurrentEntityForm(form);
                                setCurrentEntity(menuEntity);
                                setShowAddModal(true);
                            }
                        }}
                    >
                        <ListItemIcon>
                            <AddIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Add subitem</ListItemText>
                    </MenuItem>
                )}
                {menuEntity === null || !menuEntity.deleting_allowed ? (
                    ""
                ) : (
                    <MenuItem
                        onClick={() => {
                            if (menuEntity !== null) {
                                setCurrentEntity(menuEntity);
                                setShowDeleteModal(true);
                            }
                        }}
                    >
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Delete item</ListItemText>
                    </MenuItem>
                )}
            </Menu>
            <Dialog
                open={showViewModal}
                maxWidth="lg"
                fullWidth
                onClose={() => {
                    setShowViewModal(false);
                    window.setTimeout(() => {
                        setCurrentEntity(null);
                    }, 30);
                }}
            >
                <DialogTitle>Details for {currentEntity?.name}</DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={() => {
                        setShowViewModal(false);
                        window.setTimeout(() => {
                            setCurrentEntity(null);
                        }, 30);
                    }}
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent>
                    <TableContainer>
                        <Table size="small">
                            <TableBody>
                                {currentEntity?.content.map(
                                    (
                                        item: VerticalCardListServiceEntityContentItem
                                    ) => {
                                        return (
                                            <TableRow>
                                                <TableCell sx={{ pr: 1 }}>
                                                    {item.name}:
                                                </TableCell>
                                                <TableCell>
                                                    {item.is_project_oid &&
                                                    hasProjectDetailPermission ? (
                                                        <a
                                                            href={
                                                                "ProjectSearch/" +
                                                                item.content
                                                            }
                                                            target="_blank"
                                                            style={{
                                                                textDecoration:
                                                                    "none",
                                                                color: theme
                                                                    .palette
                                                                    .primary
                                                                    .main,
                                                            }}
                                                        >
                                                            {item.content}
                                                        </a>
                                                    ) : (
                                                        item.content
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </Dialog>
            <Dialog
                open={showEditModal}
                maxWidth="lg"
                fullWidth
                onClose={() => {
                    setShowEditModal(false);
                    window.setTimeout(() => {
                        setCurrentEntity(null);
                    }, 30);
                }}
            >
                <DialogTitle>Edit {currentEntity?.name}</DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={() => {
                        setShowEditModal(false);
                        window.setTimeout(() => {
                            setCurrentEntity(null);
                        }, 30);
                    }}
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent>
                    <DynamicForm form={currentEntityForm} />
                </DialogContent>
            </Dialog>
            <Dialog
                open={showAddModal}
                maxWidth="lg"
                fullWidth
                onClose={() => {
                    setShowAddModal(false);
                    window.setTimeout(() => {
                        setCurrentEntity(null);
                    }, 30);
                }}
            >
                <DialogTitle>Add subitem to {currentEntity?.name}</DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={() => {
                        setShowAddModal(false);
                        window.setTimeout(() => {
                            setCurrentEntity(null);
                        }, 30);
                    }}
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent>
                    <DynamicForm form={currentEntityForm} />
                </DialogContent>
            </Dialog>
            <Dialog
                open={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    window.setTimeout(() => {
                        setCurrentEntity(null);
                    }, 30);
                }}
            >
                <DialogTitle>Delete {currentEntity?.name}</DialogTitle>
                <DialogContent>
                    Are you sure to delete {currentEntity?.name}?
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setShowDeleteModal(false);
                            window.setTimeout(() => {
                                setCurrentEntity(null);
                            }, 30);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={deleteEntity}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
