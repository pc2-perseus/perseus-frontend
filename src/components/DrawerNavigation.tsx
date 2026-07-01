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
    Tooltip,
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
    isCollapsed,
}: {
    items: NavigationItem[];
    isCollapsed: boolean;
}): React.ReactElement {
    const location = useLocation();

    const theme: Theme = useTheme();
    const expandedDrawerWidth = "270px";
    const collapsedDrawerWidth = `${theme.spacing(8)}`;
    const drawerTransition = theme.transitions.create("width", {
        easing: isCollapsed
            ? "cubic-bezier(0.4, 0, 0.2, 1)"
            : "cubic-bezier(0.22, 1, 0.36, 1)",
        duration: isCollapsed ? 180 : 260,
    });
    const labelTransition = theme.transitions.create(
        ["opacity", "max-width", "transform"],
        {
            easing: isCollapsed
                ? "cubic-bezier(0.4, 0, 0.2, 1)"
                : "cubic-bezier(0.22, 1, 0.36, 1)",
            duration: isCollapsed ? 140 : 220,
        }
    );
    const itemIconOffset = isCollapsed ? 0 : 3;
    const labelSx = {
        opacity: isCollapsed ? 0 : 1,
        maxWidth: isCollapsed ? 0 : 240,
        overflow: "hidden",
        whiteSpace: "nowrap",
        transform: isCollapsed ? "translateX(-8px)" : "translateX(0)",
        transition: labelTransition,
    };
    const orderedItems = React.useMemo(() => {
        const nextItems = [...items];
        const settingsIndex = nextItems.findIndex(
            (item) => item.id === "Settings"
        );

        if (settingsIndex >= 0) {
            nextItems.push(nextItems.splice(settingsIndex, 1)[0]);
        }

        return nextItems;
    }, [items]);
    const generalItems = React.useMemo(
        () =>
            orderedItems.filter(
                (i) =>
                    !i.keyword?.startsWith("state") &&
                    !i.keyword?.startsWith("service")
            ),
        [orderedItems]
    );
    const stateItems = React.useMemo(
        () => orderedItems.filter((i) => i.keyword?.startsWith("state")),
        [orderedItems]
    );
    const serviceItems = React.useMemo(
        () => orderedItems.filter((i) => i.keyword?.startsWith("service")),
        [orderedItems]
    );

    React.useEffect(() => {
        if (
            location.pathname.startsWith("/dashboard") ||
            location.pathname.trim() === "/"
        ) {
            document.title = "Dashboard - PERSEUS";
            return;
        } else {
            let found: boolean = false;
            orderedItems.forEach((item: NavigationItem) => {
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
    }, [location, orderedItems]);

    const dashboardItemContent = (
        <ListItemButton
            component={NavLink}
            to="/dashboard"
            sx={{
                minHeight: 48,
                px: 2.5,
                justifyContent: isCollapsed ? "center" : "initial",
                backgroundColor:
                    location.pathname.startsWith("/dashboard") ||
                    location.pathname.trim() === "/"
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
            <ListItemIcon
                sx={{
                    minWidth: 0,
                    mr: itemIconOffset,
                    justifyContent: "center",
                    transition: theme.transitions.create("margin-right", {
                        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                        duration: 220,
                    }),
                }}
            >
                <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" sx={labelSx} />
        </ListItemButton>
    );

    function renderItem(item: NavigationItem) {
        const itemContent = (
            <ListItemButton
                component={NavLink}
                to={"/" + item.id}
                sx={{
                    minHeight: 48,
                    px: 2.5,
                    justifyContent: isCollapsed ? "center" : "initial",
                    backgroundColor: location.pathname.startsWith("/" + item.id)
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
                <ListItemIcon
                    sx={{
                        minWidth: 0,
                        mr: itemIconOffset,
                        justifyContent: "center",
                        transition: theme.transitions.create("margin-right", {
                            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                            duration: 220,
                        }),
                    }}
                >
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
                <ListItemText primary={item.name} sx={labelSx} />
            </ListItemButton>
        );

        return (
            <ListItem sx={{ ml: 0, mr: 0, px: 0, py: "1px" }} key={item.id}>
                {isCollapsed ? (
                    <Tooltip title={item.name} placement="right">
                        {itemContent}
                    </Tooltip>
                ) : (
                    itemContent
                )}
            </ListItem>
        );
    }

    return (
        <Box
            component="nav"
            sx={{
                width: {
                    md: isCollapsed
                        ? collapsedDrawerWidth
                        : expandedDrawerWidth,
                },
                flexShrink: 0,
                scrollbarWidth: "none",
                transition: drawerTransition,
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
                        overflowX: "hidden",
                        width: isCollapsed
                            ? collapsedDrawerWidth
                            : expandedDrawerWidth,
                        transition: drawerTransition,
                    },
                }}
            >
                <List
                    sx={{
                        mt: "49px",
                    }}
                >
                    <ListItem sx={{ ml: 0, mr: 0, px: 0, pb: "2px", pt: 1 }}>
                        {isCollapsed ? (
                            <Tooltip title="Dashboard" placement="right">
                                {dashboardItemContent}
                            </Tooltip>
                        ) : (
                            dashboardItemContent
                        )}
                    </ListItem>
                    {generalItems.map(renderItem)}
                    {stateItems.length == 0 ? (
                        ""
                    ) : isCollapsed ? (
                        stateItems.map(renderItem)
                    ) : (
                        <>
                            <ListSubheader sx={{ lineHeight: "24px", pt: 1 }}>
                                States
                            </ListSubheader>
                            {stateItems.map(renderItem)}
                        </>
                    )}
                    {serviceItems.length == 0 ? (
                        ""
                    ) : isCollapsed ? (
                        [
                            stateItems.length > 0 ? (
                                <Divider key="collapsed-services-divider" />
                            ) : (
                                ""
                            ),
                            ...serviceItems.map(renderItem),
                        ]
                    ) : (
                        <>
                            {stateItems.length > 0 ? <Divider /> : ""}
                            <ListSubheader sx={{ lineHeight: "24px", pt: 1 }}>
                                Services
                            </ListSubheader>
                            {serviceItems.map(renderItem)}
                        </>
                    )}
                </List>
            </Drawer>
        </Box>
    );
}
