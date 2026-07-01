// React imports
import React from "react";

// MUI imports
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
    Box,
    Button,
    CssBaseline,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";

// Custom imports
import Navbar from "./components/Navbar.tsx";
import AuthContext, { AuthContextData } from "./contexts/AuthContext.ts";
import getValidate from "./api/getValidate.ts";
import LoginForm from "./components/LoginForm.tsx";
import LoadingAnimation from "./components/LoadingAnimation.tsx";
import DrawerNavigation, {
    NavigationItem,
} from "./components/DrawerNavigation.tsx";
import getMenuItems from "./api/getMenuItems.ts";
import { BrowserRouter } from "react-router-dom";
import PageRouter from "./PageRouter.tsx";
import isDarkModeActive, { setDarkMode } from "./utils/isDarkModeActive.ts";
import isDrawerCollapsed, {
    setDrawerCollapsed,
} from "./utils/isDrawerCollapsed.ts";
import { usePeriodicHook } from "./utils/usePeriodicHook.ts";
import postLogout from "./api/postLogout.ts";
import LoadingBar from "./components/LoadingBar.tsx";
import FrontendConfiguration from "./interfaces/FrontendConfiguration.ts";
import getFrontendConfig from "./api/frontend-configuration/getFrontendConfig.ts";
import ConfigContext from "./contexts/ConfigContext.ts";

export default function App() {
    const systemPrefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const [showDialog, setShowDialog] = React.useState<boolean | null>(null);

    const [isDarkMode, updateDarkMode] = React.useState<boolean>(
        isDarkModeActive() !== false
    );
    const [isDrawerCollapsedState, updateDrawerCollapsedState] =
        React.useState<boolean>(isDrawerCollapsed());

    // Activate dark mode if explicitly set (1) or if set to "system" (2) and system prefers dark
    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    primary: {
                        main: "#826cc6",
                        light: "#d1c9e8",
                        dark: "#47367d",
                    },
                    secondary: {
                        main: "#4d998b",
                        light: "#8cc5ba",
                        dark: "#33665c",
                    },
                    mode: isDarkMode ? "dark" : "light",
                    background: {
                        default: isDarkMode ? "#212529" : "#ffffff",
                        paper: isDarkMode ? "#212529" : "#ffffff",
                    },
                },
            }),
        // This memo hook monitors the following variables
        [isDarkMode]
    );

    const [navigationItems, setNavigationItems] = React.useState<
        NavigationItem[]
    >([]);

    const [authContextData, updateAuthContextData] =
        React.useState<null | AuthContextData>(null);
    const [configContextData, updateConfigContextData] =
        React.useState<null | FrontendConfiguration>(null);

    const [isLoading, setLoading] = React.useState<boolean | null>(null);

    const [loaderMessage, updateLoaderMessage] = React.useState<string>(
        "Initializing PERSEUS frontend"
    );

    async function initialize(): Promise<void> {
        updateLoaderMessage("Initializing PERSEUS frontend");
        const loadNavigationItems: NavigationItem[] = await getMenuItems();
        setNavigationItems(loadNavigationItems);
    }

    function updateDarkModeNavbar(active: boolean): void {
        updateDarkMode(active);
        setDarkMode(active);
    }

    function updateDrawerCollapsed(collapsed: boolean): void {
        updateDrawerCollapsedState(collapsed);
        setDrawerCollapsed(collapsed);
    }

    function logout() {
        postLogout().then(() => window.location.reload());
    }

    React.useEffect(() => {
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const { reason } = event;

            if (reason?.name === "AbortError") {
                event.preventDefault();
            }
        };
        window.addEventListener("unhandledrejection", handleUnhandledRejection);

        return () => {
            window.removeEventListener(
                "unhandledrejection",
                handleUnhandledRejection
            );
        };
    }, []);

    React.useEffect(() => {
        if (isDarkModeActive() === null) {
            setDarkMode(systemPrefersDarkMode);
        }
        getValidate().then((result: AuthContextData | null) => {
            if (result !== null && authContextData === null) {
                setLoading(true);
                initialize().then(() => setLoading(false));
            } else {
                setLoading(false);
            }
            updateAuthContextData(result);
        });
        getFrontendConfig().then((config: FrontendConfiguration) => {
            updateConfigContextData(config);
        });
    }, []);

    usePeriodicHook(() => {
        if (authContextData === null) {
            return;
        }
        if (
            new Date(authContextData.expires).getTime() - new Date().getTime() <
                600000 &&
            showDialog === null
        ) {
            setShowDialog(true);
        }
    }, 60000);

    usePeriodicHook(() => {
        getMenuItems().then((items) => setNavigationItems(items));
    }, 60000);

    return (
        <BrowserRouter basename={import.meta.env.BASE_URL}>
            <ThemeProvider theme={theme}>
                <AuthContext.Provider value={authContextData}>
                    <ConfigContext.Provider value={configContextData}>
                        <CssBaseline />
                        <Box
                            sx={{
                                display: "flex",
                                width: "100%",
                                flexDirection: "column",
                            }}
                        >
                            <Navbar
                                isDarkMode={isDarkMode}
                                updateDarkMode={updateDarkModeNavbar}
                                isDrawerCollapsed={isDrawerCollapsedState}
                                updateDrawerCollapsed={
                                    updateDrawerCollapsed
                                }
                            />

                            {authContextData === null && isLoading !== null ? (
                                <LoginForm
                                    triggerSuccessfulLogin={() => {
                                        getValidate().then(
                                            (
                                                result: AuthContextData | null
                                            ) => {
                                                if (
                                                    result !== null &&
                                                    authContextData === null
                                                ) {
                                                    setLoading(true);
                                                    initialize().then(() =>
                                                        setLoading(false)
                                                    );
                                                }
                                                updateAuthContextData(result);
                                            }
                                        );
                                    }}
                                />
                            ) : (
                                ""
                            )}
                            {isLoading === null ? (
                                <Box
                                    sx={{
                                        width: "100%",
                                        mt: "48px",
                                    }}
                                >
                                    <LoadingBar />
                                </Box>
                            ) : (
                                ""
                            )}
                            {isLoading === true ? (
                                <LoadingAnimation message={loaderMessage} />
                            ) : (
                                ""
                            )}
                            {authContextData !== null && isLoading === false ? (
                                <Box sx={{ display: "flex" }}>
                                    <DrawerNavigation
                                        items={navigationItems}
                                        isCollapsed={isDrawerCollapsedState}
                                    />
                                    <Box
                                        component="main"
                                        sx={{
                                            flexGrow: 1,
                                            minWidth: 0,
                                            pl: 3,
                                            pr: 2,
                                            pt: "64px",
                                            pb: 2,
                                            overflowX: "hidden",
                                        }}
                                        id="main"
                                    >
                                        <PageRouter
                                            items={[
                                                ...navigationItems,
                                                {
                                                    id: "ProjectEdit",
                                                    name: "Project Edit",
                                                    icon: null,
                                                    keyword: "service",
                                                },
                                                {
                                                    id: "PersonEdit",
                                                    name: "Person Edit",
                                                    icon: null,
                                                    keyword: "service",
                                                },
                                            ]}
                                        />
                                    </Box>
                                </Box>
                            ) : (
                                ""
                            )}
                            <div id="trash" style={{ display: "none" }}></div>
                        </Box>
                        <Dialog
                            open={showDialog === true}
                            onClose={() => {
                                setShowDialog(false);
                            }}
                        >
                            <DialogTitle>
                                Your session is about to expire
                            </DialogTitle>
                            <DialogContent>
                                Your session will expire in less than 10
                                minutes. Please finish your current work and log
                                in again to start a new session.
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={logout}
                                >
                                    Log in again
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => {
                                        setShowDialog(false);
                                    }}
                                >
                                    Keep working
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </ConfigContext.Provider>
                </AuthContext.Provider>
            </ThemeProvider>
        </BrowserRouter>
    );
}
