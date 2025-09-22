// React imports
import React from "react";
import { NavLink, useLocation } from "react-router-dom";

// MUI imports
import {
    Badge,
    Box,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Theme,
    useTheme,
} from "@mui/material";

// Icon imports
import DashboardIcon from "@mui/icons-material/Dashboard";
import NavigationItemIcon from "./NavigationItemIcon.tsx";

export interface NavigationItem {
    id: string;
    name: string;
    icon: string | null;
    keyword: string | null;
    notifications?: number;
}

/**
 * Component to display the side menu
 *
 * @param items {NavigationItem[]} - items to display
 *
 * @return {React.ReactElement} - The created drawer component
 */
export default function DrawerNavigation({
    items,
}: {
    items: NavigationItem[];
}): React.ReactElement {
    const location = useLocation();

    const theme: Theme = useTheme();

    let settingsIndex: number | null = null;
    items.forEach((item, index) => {
        if (item.id === "Settings") {
            settingsIndex = index;
        }
    });
    if (settingsIndex !== null) {
        items.push(items.splice(settingsIndex, 1)[0]);
    }

    React.useEffect(() => {
        if (
            location.pathname.startsWith("/dashboard") ||
            location.pathname.trim() === "/"
        ) {
            document.title = "Dashboard - PERSEUS";
            return;
        } else {
            let found: boolean = false;
            items.forEach((item: NavigationItem) => {
                if (!found && location.pathname.startsWith("/" + item.id)) {
                    found = true;
                    document.title = item.name + " - PERSEUS";
                }
            });
            if (found) {
                return;
            }
        }
        document.title = "PERSEUS";
    }, [location]);

    function renderItem(item: NavigationItem) {
        return (
            <ListItem sx={{ ml: 0, mr: 0, px: 0, py: "1px" }} key={item.id}>
                <ListItemButton
                    component={NavLink}
                    to={"/" + item.id}
                    sx={{
                        backgroundColor: location.pathname.startsWith(
                            "/" + item.id
                        )
                            ? theme.palette.mode === "light"
                                ? "primary.light"
                                : "primary.dark"
                            : undefined,
                        ":hover": {
                            backgroundColor:
                                theme.palette.mode === "light"
                                    ? "primary.light"
                                    : "primary.dark",
                        },
                    }}
                >
                    <ListItemIcon>
                        {item.notifications && item.notifications > 0 ? (
                            <Badge
                                badgeContent={item.notifications}
                                color="primary"
                            >
                                <NavigationItemIcon icon={item.icon} />
                            </Badge>
                        ) : (
                            <NavigationItemIcon icon={item.icon} />
                        )}
                    </ListItemIcon>
                    <ListItemText primary={item.name} />
                </ListItemButton>
            </ListItem>
        );
    }

    return (
        <Box
            component="nav"
            sx={{
                width: 300,
                flexShrink: 0,
                scrollbarWidth: "none",
                "& ::-webkit-scrollbar": {
                    display: "none",
                },
                "& -ms-overflow-style:": {
                    display: "none",
                },
            }}
        >
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: "none", md: "block" },
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: 300,
                    },
                }}
            >
                <List
                    sx={{
                        mt: "49px",
                    }}
                >
                    <ListItem sx={{ ml: 0, mr: 0, px: 0, pb: "2px", pt: 1 }}>
                        <ListItemButton
                            component={NavLink}
                            to="/dashboard"
                            sx={{
                                backgroundColor:
                                    location.pathname.startsWith(
                                        "/dashboard"
                                    ) || location.pathname.trim() === "/"
                                        ? theme.palette.mode === "light"
                                            ? "primary.light"
                                            : "primary.dark"
                                        : undefined,
                                ":hover": {
                                    backgroundColor:
                                        theme.palette.mode === "light"
                                            ? "primary.light"
                                            : "primary.dark",
                                },
                            }}
                        >
                            <ListItemIcon>
                                <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText primary="Dashboard" />
                        </ListItemButton>
                    </ListItem>
                    {items
                        .filter(
                            (i) =>
                                !i.keyword?.startsWith("state") &&
                                !i.keyword?.startsWith("service")
                        )
                        .map(renderItem)}
                    {items.filter((i) => i.keyword?.startsWith("state"))
                        .length == 0 ? (
                        ""
                    ) : (
                        <>
                            <Divider />
                            <ListSubheader sx={{ lineHeight: "24px", pt: 1 }}>
                                States
                            </ListSubheader>
                            {items
                                .filter((i) => i.keyword?.startsWith("state"))
                                .map(renderItem)}
                        </>
                    )}
                    {items.filter((i) => i.keyword?.startsWith("service"))
                        .length == 0 ? (
                        ""
                    ) : (
                        <>
                            <Divider />
                            <ListSubheader sx={{ lineHeight: "24px", pt: 1 }}>
                                Services
                            </ListSubheader>
                            {items
                                .filter((i) => i.keyword?.startsWith("service"))
                                .map(renderItem)}
                        </>
                    )}
                </List>
            </Drawer>
        </Box>
    );
}
