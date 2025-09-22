// React imports
import React, { useState } from "react";

// MUI imports
import { Alert, Box, Button, TextField } from "@mui/material";

// Custom imports
import postLogin from "../api/postLogin.ts";
import LoadingBar from "./LoadingBar.tsx";

export default function LoginForm({
    triggerSuccessfulLogin,
}: {
    triggerSuccessfulLogin: () => void;
}): React.ReactElement {
    const [loading, setLoading] = useState<boolean>(false);
    const [isError, setError] = React.useState<boolean>(false);
    const [username, setUsername] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");

    function login(): void {
        setLoading(true);
        postLogin(username, password).then((result: boolean) => {
            setError(!result);
            if (result) {
                triggerSuccessfulLogin();
            } else {
                setLoading(false);
            }
        });
    }

    return (
        <Box
            sx={{
                position: "absolute",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                mt: "94px",
                height: "calc(100vh - 94px)",
                width: "100vw",
            }}
        >
            <Box sx={{ maxWidth: "600px", width: "100%" }}>
                {isError ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        Login failed
                    </Alert>
                ) : (
                    ""
                )}
                <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2 }}
                    value={username}
                    onChange={(e) => setUsername(e.currentTarget.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            login();
                        }
                    }}
                />
                <TextField
                    label="Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2 }}
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            login();
                        }
                    }}
                />
                {loading ? (
                    <LoadingBar />
                ) : (
                    <Button
                        type="submit"
                        variant="contained"
                        onClick={() => {
                            login();
                        }}
                        fullWidth
                    >
                        Login
                    </Button>
                )}
            </Box>
        </Box>
    );
}
