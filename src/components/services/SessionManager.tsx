// React imports
import React from "react";

// MUI imports
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

// Icon imports
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DeleteIcon from "@mui/icons-material/Delete";

// Other imports
import dayjs, { Dayjs } from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/de";

// Custom imports
import getSessions from "../../api/getSessions.ts";
import postSessionBlock from "../../api/postSessionBlock.ts";
import postSessionUnblock from "../../api/postSessionUnblock.ts";
import postSessionToken from "../../api/postSessionToken.ts";
import LoadingBar from "../LoadingBar.tsx";
import AuthContext, { AuthContextData } from "../../contexts/AuthContext.ts";

export interface Session {
    _id: string;
    username: string;
    expires: string;
    is_api_token: boolean;
    blocked: boolean;
    one_time_use: boolean;
    api_permissions: { http_method: string; endpoint: string }[];
}

dayjs.extend(utc);
dayjs.extend(updateLocale);
dayjs.updateLocale("de", {
    weekStart: 1,
});

export default function SessionManager(): React.ReactElement {
    const [loading, setLoading] = React.useState<boolean>(true);
    const [tokenLoading, setTokenLoading] = React.useState<boolean>(false);

    const [sessions, setSessions] = React.useState<Session[]>([]);
    const [openNewToken, setOpenNewToken] = React.useState<boolean>(false);
    const [newToken, setNewToken] = React.useState<string | null>(null);
    const [newTokenName, setNewTokenName] = React.useState<string>("");
    const [newTokenExpires, setNewTokenExpires] = React.useState<Dayjs | null>(
        null
    );
    const [newTokenPermissions, setNewTokenPermissions] = React.useState<
        { http_method: string; endpoint: string }[]
    >([]);
    const [showPermissions, setShowPermissions] = React.useState<number[]>([]);
    const [errorTokenName, setErrorTokenName] = React.useState<string | null>(
        null
    );

    const authContextData: AuthContextData | null =
        React.useContext(AuthContext);

    const validateTokenName = (token_name: string): boolean => {
        if (authContextData !== null) {
            if (token_name.trim() == authContextData.username) {
                setErrorTokenName(
                    "Token name must not be the same as username!"
                );
                return false;
            }
        } else {
            return false;
        }

        setErrorTokenName(null);
        return true;
    };

    function block(session: Session) {
        postSessionBlock(session._id).then((result: boolean) => {
            if (result) {
                getSessions().then((result: Session[]) => {
                    setSessions(result);
                });
            }
        });
    }

    function unblock(session: Session) {
        postSessionUnblock(session._id).then((result: boolean) => {
            if (result) {
                getSessions().then((result: Session[]) => {
                    setSessions(result);
                });
            }
        });
    }

    function addToken() {
        setTokenLoading(true);
        if (newTokenExpires !== null) {
            postSessionToken(
                newTokenName,
                newTokenExpires.toDate(),
                newTokenPermissions
            ).then((token: string) => {
                setNewToken(token);
                setTokenLoading(false);
                getSessions().then((result: Session[]) => {
                    setSessions(result);
                });
            });
        }
    }

    function addPermission() {
        newTokenPermissions.push({
            http_method: "GET",
            endpoint: "/example/endpoint",
        });
        setNewTokenPermissions(JSON.parse(JSON.stringify(newTokenPermissions)));
    }

    function changePermission(
        index: number,
        type: "method" | "endpoint",
        value: string
    ) {
        if (type === "method") {
            newTokenPermissions[index].http_method = value;
        } else if (type === "endpoint") {
            newTokenPermissions[index].endpoint = value;
        }
        setNewTokenPermissions(JSON.parse(JSON.stringify(newTokenPermissions)));
    }

    function removePermission(index: number) {
        newTokenPermissions.splice(index, 1);
        setNewTokenPermissions(JSON.parse(JSON.stringify(newTokenPermissions)));
    }

    const sessionStatus = (session: Session) => {
        if (new Date(session.expires) <= new Date()) {
            return "expired";
        }
        if (session.blocked) {
            return "blocked";
        }
        return "active";
    };

    React.useEffect(() => {
        getSessions().then((result: Session[]) => {
            setSessions(result);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <LoadingBar />;
    }

    return (
        <>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography component="span">Users</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Card variant="outlined" sx={{ width: "100%" }}>
                        <TableContainer>
                            <Table size="small" sx={{ width: "100%" }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>User</TableCell>
                                        <TableCell>Expires</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sessions
                                        .filter(
                                            (session) => !session.is_api_token
                                        )
                                        .map(
                                            (
                                                session: Session,
                                                index: number
                                            ) => {
                                                const borderStyle =
                                                    index + 1 ===
                                                    sessions.filter(
                                                        (session) =>
                                                            !session.is_api_token
                                                    ).length
                                                        ? {
                                                              borderBottomWidth:
                                                                  "0px",
                                                          }
                                                        : {};
                                                return (
                                                    <TableRow key={index}>
                                                        <TableCell
                                                            sx={borderStyle}
                                                        >
                                                            {session.username}
                                                        </TableCell>
                                                        <TableCell
                                                            sx={borderStyle}
                                                        >
                                                            {new Date(
                                                                session.expires
                                                            ).toUTCString()}
                                                        </TableCell>
                                                        <TableCell
                                                            sx={borderStyle}
                                                        >
                                                            {sessionStatus(
                                                                session
                                                            )}
                                                        </TableCell>
                                                        <TableCell
                                                            sx={borderStyle}
                                                        >
                                                            {sessionStatus(
                                                                session
                                                            ) === "expired" ? (
                                                                <></>
                                                            ) : (
                                                                <Button
                                                                    size="small"
                                                                    color={
                                                                        session.blocked
                                                                            ? "success"
                                                                            : "error"
                                                                    }
                                                                    variant="contained"
                                                                    sx={{
                                                                        float: "right",
                                                                    }}
                                                                    onClick={() => {
                                                                        if (
                                                                            session.blocked
                                                                        ) {
                                                                            unblock(
                                                                                session
                                                                            );
                                                                        } else {
                                                                            block(
                                                                                session
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    {session.blocked
                                                                        ? "unblock"
                                                                        : "block"}
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            }
                                        )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography component="span">API tokens</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Card variant="outlined" sx={{ width: "100%" }}>
                        <TableContainer>
                            <Table size="small" sx={{ width: "100%" }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Expires</TableCell>
                                        <TableCell>Permission(s)</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                sx={{ float: "right" }}
                                                onClick={() => {
                                                    setOpenNewToken(true);
                                                    setNewTokenPermissions([
                                                        {
                                                            http_method: "GET",
                                                            endpoint:
                                                                "/example/endpoint",
                                                        },
                                                    ]);
                                                }}
                                            >
                                                Add token
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sessions
                                        .filter(
                                            (session) => session.is_api_token
                                        )
                                        .map(
                                            (
                                                session: Session,
                                                index: number
                                            ) => {
                                                function toggleComment() {
                                                    if (
                                                        showPermissions.includes(
                                                            index
                                                        )
                                                    ) {
                                                        showPermissions.splice(
                                                            showPermissions.indexOf(
                                                                index
                                                            ),
                                                            1
                                                        );
                                                    } else {
                                                        showPermissions.push(
                                                            index
                                                        );
                                                    }
                                                    setShowPermissions(
                                                        JSON.parse(
                                                            JSON.stringify(
                                                                showPermissions
                                                            )
                                                        )
                                                    );
                                                }
                                                const borderStyle =
                                                    index + 1 ===
                                                    sessions.filter(
                                                        (session) =>
                                                            session.is_api_token
                                                    ).length
                                                        ? {
                                                              borderBottomWidth:
                                                                  "0px",
                                                          }
                                                        : {};
                                                return (
                                                    <TableRow key={index}>
                                                        <TableCell
                                                            sx={borderStyle}
                                                        >
                                                            {session.username}
                                                            {session.one_time_use
                                                                ? " (worker token)"
                                                                : ""}
                                                        </TableCell>
                                                        <TableCell
                                                            sx={borderStyle}
                                                        >
                                                            {new Date(
                                                                session.expires
                                                            ).toUTCString()}
                                                        </TableCell>
                                                        <TableCell
                                                            sx={{
                                                                ...borderStyle,
                                                                //width: "auto",
                                                                textarea: {
                                                                    overflow:
                                                                        "hidden",
                                                                },
                                                            }}
                                                        >
                                                            <TextField
                                                                variant="standard"
                                                                sx={{
                                                                    border: "none",
                                                                    padding: 0,
                                                                    "&::after":
                                                                        {
                                                                            display:
                                                                                "none",
                                                                        },
                                                                }}
                                                                inputProps={{
                                                                    style: {
                                                                        scrollbarWidth:
                                                                            "none",
                                                                    },
                                                                }}
                                                                InputProps={{
                                                                    readOnly: true,
                                                                    disableUnderline: true,
                                                                    style: {
                                                                        fontSize:
                                                                            "0.875rem",
                                                                        padding: 0,
                                                                    },
                                                                    endAdornment:
                                                                        session
                                                                            .api_permissions
                                                                            .length >
                                                                        1 ? (
                                                                            <InputAdornment position="end">
                                                                                <IconButton
                                                                                    onClick={
                                                                                        toggleComment
                                                                                    }
                                                                                >
                                                                                    <MoreHorizIcon />
                                                                                </IconButton>
                                                                            </InputAdornment>
                                                                        ) : (
                                                                            <>

                                                                            </>
                                                                        ),
                                                                }}
                                                                size="small"
                                                                value={session.api_permissions
                                                                    .map(
                                                                        (
                                                                            permission
                                                                        ) =>
                                                                            permission.http_method +
                                                                            " " +
                                                                            permission.endpoint
                                                                    )
                                                                    .join("\n")}
                                                                multiline
                                                                rows={
                                                                    showPermissions.includes(
                                                                        index
                                                                    )
                                                                        ? undefined
                                                                        : 1
                                                                }
                                                                fullWidth
                                                            />
                                                        </TableCell>
                                                        <TableCell
                                                            sx={borderStyle}
                                                        >
                                                            {sessionStatus(
                                                                session
                                                            )}
                                                        </TableCell>
                                                        <TableCell
                                                            sx={borderStyle}
                                                        >
                                                            {sessionStatus(
                                                                session
                                                            ) === "expired" ? (
                                                                <></>
                                                            ) : (
                                                                <Button
                                                                    size="small"
                                                                    color={
                                                                        session.blocked
                                                                            ? "success"
                                                                            : "error"
                                                                    }
                                                                    variant="contained"
                                                                    sx={{
                                                                        float: "right",
                                                                    }}
                                                                    onClick={() => {
                                                                        if (
                                                                            session.blocked
                                                                        ) {
                                                                            unblock(
                                                                                session
                                                                            );
                                                                        } else {
                                                                            block(
                                                                                session
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    {session.blocked
                                                                        ? "unblock"
                                                                        : "block"}
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            }
                                        )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </AccordionDetails>
            </Accordion>
            <Dialog
                open={openNewToken}
                onClose={() => {
                    setNewToken(null);
                    setOpenNewToken(false);
                    setNewTokenName("");
                    setNewTokenExpires(null);
                    setNewTokenPermissions([]);
                    setErrorTokenName(null);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Add a new API token</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Name"
                        variant="outlined"
                        value={newTokenName}
                        onChange={(e) => {
                            validateTokenName(e.currentTarget.value);
                            setNewTokenName(e.currentTarget.value);
                        }}
                        error={errorTokenName !== null}
                        helperText={errorTokenName}
                        fullWidth
                        sx={{ mt: 2 }}
                    />
                    <LocalizationProvider
                        dateAdapter={AdapterDayjs}
                        adapterLocale="de"
                    >
                        <DateTimePicker
                            label="Expires (UTC)"
                            ampm={false}
                            slotProps={{ textField: { fullWidth: true } }}
                            sx={{ mt: 2 }}
                            value={newTokenExpires}
                            timezone="UTC"
                            onChange={(newValue) =>
                                setNewTokenExpires(newValue)
                            }
                        />
                    </LocalizationProvider>
                    <Typography variant="h5" sx={{ mt: 3 }}>
                        Permissions
                    </Typography>
                    {newTokenPermissions.map((_, index: number) => {
                        return (
                            <Grid
                                container
                                spacing={1}
                                sx={{ mt: 1 }}
                                key={index}
                            >
                                <Grid size={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Method</InputLabel>
                                        <Select
                                            label="Method"
                                            value={
                                                newTokenPermissions[index]
                                                    .http_method
                                            }
                                            onChange={(e) => {
                                                changePermission(
                                                    index,
                                                    "method",
                                                    e.target.value
                                                );
                                            }}
                                            size="small"
                                        >
                                            <MenuItem value="GET">GET</MenuItem>
                                            <MenuItem value="POST">
                                                POST
                                            </MenuItem>
                                            <MenuItem value="DELETE">
                                                DELETE
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={8}>
                                    <TextField
                                        label="Endpoint"
                                        variant="outlined"
                                        size="small"
                                        value={
                                            newTokenPermissions[index].endpoint
                                        }
                                        fullWidth
                                        onChange={(e) => {
                                            changePermission(
                                                index,
                                                "endpoint",
                                                e.currentTarget.value
                                            );
                                        }}
                                    />
                                </Grid>
                                <Grid size={1}>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        fullWidth
                                        sx={{ height: "100%" }}
                                        onClick={() => {
                                            removePermission(index);
                                        }}
                                    >
                                        <DeleteIcon />
                                    </Button>
                                </Grid>
                            </Grid>
                        );
                    })}
                    <Box sx={{ mb: 2 }}>
                        <Button
                            variant="contained"
                            sx={{ mt: 1, float: "right" }}
                            onClick={addPermission}
                        >
                            Add permission
                        </Button>
                    </Box>
                    {tokenLoading && (
                        <Box sx={{ mt: "50px" }}>
                            <LoadingBar />
                        </Box>
                    )}
                    {newToken === null ? (
                        <></>
                    ) : (
                        <TextField
                            label="API Token"
                            variant="outlined"
                            color="primary"
                            value={newToken}
                            helperText="You cannot access the token once you close this dialog"
                            multiline
                            fullWidth
                            focused
                            sx={{ mt: 2 }}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={addToken}
                        disabled={tokenLoading}
                    >
                        Add API token
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
