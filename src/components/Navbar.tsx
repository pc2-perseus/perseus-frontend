// React imports
import React from "react";
import { useNavigate } from "react-router-dom";

// MUI imports
import {
    AppBar,
    Box,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    MenuList,
    Toolbar,
    Typography,
} from "@mui/material";

// Icon imports
import SettingsIcon from "@mui/icons-material/Settings";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LogoutIcon from "@mui/icons-material/Logout";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";

// Custom imports
import customClasses from "../styles/custom.module.css";
import getVersion from "../api/getVersion.ts";
import AuthContext, { AuthContextData } from "../contexts/AuthContext.ts";
import postLogout from "../api/postLogout.ts";

/**
 * Component for navbar at the top of the website
 *
 * @param isDarkMode {boolean} - React state indicating if dark mode is active
 * @param updateDarkMode {(isDarkMode: boolean) => void} - Updating the corresponding React state
 *
 * @return {React.ReactElement} - The created navbar component
 */
export default function Navbar({
    isDarkMode,
    updateDarkMode,
    isDrawerCollapsed,
    onToggleNavigation,
    showNavigationToggle,
}: {
    isDarkMode: boolean;
    updateDarkMode: (isDarkMode: boolean) => void;
    isDrawerCollapsed: boolean;
    onToggleNavigation: () => void;
    showNavigationToggle: boolean;
}): React.ReactElement {
    const [version, updateVersion] = React.useState<null | string>("");

    const [anchorElement, setAnchorElement] =
        React.useState<null | HTMLElement>(null);

    const navigate = useNavigate();

    const authContextData: AuthContextData | null =
        React.useContext(AuthContext);

    function openMenu(event: React.MouseEvent<HTMLButtonElement>) {
        setAnchorElement(event.currentTarget);
    }

    function logout() {
        postLogout().then(() => window.location.reload());
    }

    React.useEffect(() => {
        getVersion().then((result: string) =>
            updateVersion(result === "" ? null : result)
        );
    }, []);

    return (
        <>
            <Box
                sx={{
                    flexGrow: 0,
                    flexShrink: 0,
                    flexBasis: "100%",
                    mb: 2,
                    zIndex: 1201,
                }}
            >
                <AppBar position="fixed" enableColorOnDark>
                    <Toolbar>
                        {showNavigationToggle ? (
                            <IconButton
                                sx={{
                                    color: "#fff",
                                    ml: { md: "-12px" },
                                    mr: 1,
                                }}
                                onClick={onToggleNavigation}
                                aria-label="Toggle navigation menu"
                            >
                                <Box
                                    sx={{
                                        display: {
                                            xs: "inline-flex",
                                            md: "none",
                                        },
                                    }}
                                >
                                    <MenuIcon />
                                </Box>
                                <Box
                                    sx={{
                                        display: {
                                            xs: "none",
                                            md: "inline-flex",
                                        },
                                    }}
                                >
                                    {isDrawerCollapsed ? (
                                        <MenuIcon />
                                    ) : (
                                        <MenuOpenIcon />
                                    )}
                                </Box>
                            </IconButton>
                        ) : (
                            ""
                        )}
                        <Typography
                            component="div"
                            className={customClasses.firaCode}
                            sx={{
                                fontSize: "1.75em",
                                flexGrow: 1,
                            }}
                        >
                            PERSEUS{" "}
                            <Typography
                                component="span"
                                sx={{
                                    fontSize: "0.6em",
                                }}
                            >
                                {version === null ? (
                                    <CloudOffIcon
                                        sx={{
                                            ml: 1,
                                        }}
                                    />
                                ) : (
                                    version
                                )}
                            </Typography>
                        </Typography>
                        <IconButton sx={{ color: "#fff" }} onClick={openMenu}>
                            <SettingsIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Menu
                    open={anchorElement !== null}
                    anchorEl={anchorElement}
                    onClose={() => {
                        setAnchorElement(null);
                    }}
                >
                    <MenuList dense sx={{ pt: 0, pb: 0 }}>
                        <MenuItem disabled>
                            <ListItemText>
                                {authContextData === null ? (
                                    <i>Please log in to see all settings</i>
                                ) : (
                                    <i>
                                        Logged in as{" "}
                                        {authContextData.username}{" "}
                                    </i>
                                )}
                            </ListItemText>
                        </MenuItem>
                        <Divider />
                        <MenuItem
                            onClick={() => {
                                updateDarkMode(!isDarkMode);
                            }}
                        >
                            <ListItemIcon>
                                {isDarkMode ? (
                                    <LightModeIcon />
                                ) : (
                                    <DarkModeIcon />
                                )}
                            </ListItemIcon>
                            <ListItemText>
                                {isDarkMode
                                    ? "Switch to light mode"
                                    : "Switch to dark mode"}
                            </ListItemText>
                        </MenuItem>
                        {authContextData === null
                            ? ""
                            : [
                                  <Divider key="d1" />,
                                  <MenuItem
                                      key="m1"
                                      onClick={() => {
                                          navigate("/Settings");
                                          setAnchorElement(null);
                                      }}
                                  >
                                      <ListItemIcon>
                                          <SettingsIcon />
                                      </ListItemIcon>
                                      <ListItemText>All settings</ListItemText>
                                  </MenuItem>,
                                  <Divider key="d2" />,
                                  <MenuItem
                                      key="m2"
                                      onClick={() => {
                                          logout();
                                      }}
                                  >
                                      <ListItemIcon>
                                          <LogoutIcon />
                                      </ListItemIcon>
                                      <ListItemText>Logout</ListItemText>
                                  </MenuItem>,
                              ]}
                    </MenuList>
                </Menu>
            </Box>
        </>
    );
}
