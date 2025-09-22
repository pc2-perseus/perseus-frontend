// React imports
import React from "react";

// MUI imports
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Button,
    Grid,
    Typography,
} from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";

// Icon imports
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Custom imports
import getRoles from "../../api/getRoles.ts";
import updateRole from "../../api/updateRole.ts";
import LoadingBar from "../LoadingBar.tsx";

export interface RolePermission {
    method: string;
    endpoint: string;
}

export interface Role {
    name: string;
    groups: string[];
    users: string[];
    permissions: RolePermission[];
}

/**
 * Component that allows to see & edit all roles that PERSEUS works with.
 *
 */
export default function RoleManager(): React.ReactElement {
    const [loading, setLoading] = React.useState<boolean>(true);
    const [roles, updateRoles] = React.useState<Role[]>([]);

    const [openRole, updateOpenRole] = React.useState<string | undefined>(
        undefined
    );

    const [alertType, updateAlertType] = React.useState<
        undefined | "success" | "error"
    >(undefined);

    function addGroup(role_name: string): void {
        const working_roles: Role[] = JSON.parse(JSON.stringify(roles));
        working_roles.forEach((role: Role, index: number) => {
            if (role.name === role_name) {
                working_roles[index].groups.push("new group");
            }
        });
        updateRoles(working_roles);
    }

    function deleteGroup(role_name: string, group_name: string): void {
        const working_roles: Role[] = JSON.parse(JSON.stringify(roles));
        working_roles.forEach((role: Role, index: number) => {
            if (role.name === role_name) {
                const j: number = role.groups.indexOf(group_name);
                if (j !== -1) {
                    working_roles[index].groups.splice(j, 1);
                }
            }
        });
        updateRoles(working_roles);
    }

    function editGroup(
        role_name: string,
        old_group: string,
        new_group: string
    ): void {
        const working_roles: Role[] = JSON.parse(JSON.stringify(roles));
        working_roles.forEach((role: Role, index: number) => {
            if (role.name === role_name) {
                const j: number = role.groups.indexOf(old_group);
                if (j !== -1) {
                    working_roles[index].groups[j] = new_group;
                }
            }
        });
        updateRoles(working_roles);
    }

    function addUser(role_name: string): void {
        const working_roles: Role[] = JSON.parse(JSON.stringify(roles));
        working_roles.forEach((role: Role, index: number) => {
            if (role.name === role_name) {
                working_roles[index].users.push("new user");
            }
        });
        updateRoles(working_roles);
    }

    function deleteUser(role_name: string, user_name: string): void {
        const working_roles: Role[] = JSON.parse(JSON.stringify(roles));
        working_roles.forEach((role: Role, index: number) => {
            if (role.name === role_name) {
                const j: number = role.users.indexOf(user_name);
                if (j !== -1) {
                    working_roles[index].users.splice(j, 1);
                }
            }
        });
        updateRoles(working_roles);
    }

    function editUser(
        role_name: string,
        old_user: string,
        new_user: string
    ): void {
        const working_roles: Role[] = JSON.parse(JSON.stringify(roles));
        working_roles.forEach((role: Role, index: number) => {
            if (role.name === role_name) {
                const j: number = role.users.indexOf(old_user);
                if (j !== -1) {
                    working_roles[index].users[j] = new_user;
                }
            }
        });
        updateRoles(working_roles);
    }

    function saveRole(role: Role): void {
        updateRole(role).then((result: boolean) => {
            updateAlertType(result ? "success" : "error");
            window.setTimeout(() => {
                updateAlertType(undefined);
            }, 3000);
        });
    }

    React.useEffect(() => {
        getRoles().then((roles: Role[]) => {
            updateRoles(
                roles.sort((r1, r2) => {
                    if (r1.name < r2.name) {
                        return -1;
                    } else if (r1.name > r2.name) {
                        return 1;
                    } else {
                        return 0;
                    }
                })
            );
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <LoadingBar />;
    }

    return (
        <>
            <Alert
                variant="outlined"
                severity={alertType}
                sx={{
                    mb: 3,
                    display: alertType === undefined ? "none" : "flex",
                }}
            >
                {alertType === "success"
                    ? "Changes were saved successfully."
                    : "An error has occurred."}
            </Alert>
            {roles.map((role: Role) => {
                return (
                    <Accordion
                        key={role.name}
                        expanded={openRole === role.name}
                        onChange={(
                            _event: React.SyntheticEvent,
                            isExpanded: boolean
                        ) => updateOpenRole(isExpanded ? role.name : undefined)}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography component="span">
                                {role.name}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <DataGrid
                                        columns={[
                                            {
                                                field: "group",
                                                type: "string",
                                                headerName: "LDAP groups",
                                                flex: 1,
                                                editable: true,
                                            },
                                            {
                                                field: "delete",
                                                type: "actions",
                                                headerName: "",
                                                width: 25,
                                                align: "right",
                                                getActions: (data) => [
                                                    <GridActionsCellItem
                                                        label="Delete"
                                                        icon={
                                                            <RemoveCircleOutlineIcon color="error" />
                                                        }
                                                        onClick={() => {
                                                            deleteGroup(
                                                                role.name,
                                                                data.row.group
                                                            );
                                                        }}
                                                    />,
                                                ],
                                            },
                                        ]}
                                        rows={role.groups.map(
                                            (group: string) => {
                                                return {
                                                    id: group,
                                                    group: group,
                                                };
                                            }
                                        )}
                                        density="compact"
                                        processRowUpdate={(
                                            new_row: {
                                                id: string;
                                                group: string;
                                            },
                                            old_row: {
                                                id: string;
                                                group: string;
                                            }
                                        ) => {
                                            editGroup(
                                                role.name,
                                                old_row.group,
                                                new_row.group
                                            );
                                            return {
                                                id: new_row.group,
                                                group: new_row.group,
                                            };
                                        }}
                                        slots={{
                                            footer: () => {
                                                return (
                                                    <Button
                                                        variant="contained"
                                                        onClick={() =>
                                                            addGroup(role.name)
                                                        }
                                                    >
                                                        Add LDAP group
                                                    </Button>
                                                );
                                            },
                                        }}
                                        hideFooterPagination
                                        hideFooterSelectedRowCount
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <DataGrid
                                        columns={[
                                            {
                                                field: "user",
                                                type: "string",
                                                headerName: "Additional users",
                                                flex: 1,
                                                editable: true,
                                            },
                                            {
                                                field: "delete",
                                                type: "actions",
                                                headerName: "",
                                                width: 25,
                                                align: "right",
                                                getActions: (data) => [
                                                    <GridActionsCellItem
                                                        label="Delete"
                                                        icon={
                                                            <RemoveCircleOutlineIcon color="error" />
                                                        }
                                                        onClick={() => {
                                                            deleteUser(
                                                                role.name,
                                                                data.row.user
                                                            );
                                                        }}
                                                    />,
                                                ],
                                            },
                                        ]}
                                        rows={role.users.map((user: string) => {
                                            return {
                                                id: user,
                                                user: user,
                                            };
                                        })}
                                        density="compact"
                                        processRowUpdate={(
                                            new_row: {
                                                id: string;
                                                user: string;
                                            },
                                            old_row: {
                                                id: string;
                                                user: string;
                                            }
                                        ) => {
                                            editUser(
                                                role.name,
                                                old_row.user,
                                                new_row.user
                                            );
                                            return {
                                                id: new_row.user,
                                                user: new_row.user,
                                            };
                                        }}
                                        slots={{
                                            footer: () => {
                                                return (
                                                    <Button
                                                        variant="contained"
                                                        onClick={() =>
                                                            addUser(role.name)
                                                        }
                                                    >
                                                        Add user
                                                    </Button>
                                                );
                                            },
                                        }}
                                        hideFooterPagination
                                        hideFooterSelectedRowCount
                                    />
                                </Grid>
                            </Grid>

                            <Button
                                variant="contained"
                                sx={{ float: "right", mb: 2, mt: 4 }}
                                onClick={() => {
                                    saveRole(role);
                                }}
                            >
                                Save changes
                            </Button>
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </>
    );
}
