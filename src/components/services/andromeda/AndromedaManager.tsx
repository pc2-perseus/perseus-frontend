// React imports
import React from "react";

// MUI imports
import {
    Alert,
    Box,
    Button,
    Card,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

// Custom imports
import LoadingBar from "../../LoadingBar.tsx";
import AndromedaConfiguration from "../../../interfaces/AndromedaConfiguration.ts";
import getAndromedaConfig from "../../../api/andromeda-configuration/getAndromedaConfig.ts";
import enableAndromedaModule from "../../../api/andromeda-configuration/enableAndromedaModule.ts";
import disableAndromedaModule from "../../../api/andromeda-configuration/disableAndromedaModule.ts";
import updateAndromedaModuleConfig from "../../../api/andromeda-configuration/updateAndromedaModuleConfig.ts";
import AndromedaModuleRow from "./AndromedaModuleRow.tsx";
import { MODULE_NAMES } from "./constants.ts";
import { LoadingAction, parseJSONObject } from "./utils.ts";

export default function AndromedaManager(): React.ReactElement {
    const [loading, setLoading] = React.useState<boolean>(true);
    const [configuration, setConfiguration] =
        React.useState<AndromedaConfiguration | null>(null);
    const [drafts, setDrafts] = React.useState<{ [key: string]: string }>({});
    const [loadingActions, setLoadingActions] = React.useState<{
        [key: string]: LoadingAction;
    }>({});
    const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
    const [successes, setSuccesses] = React.useState<{ [key: string]: string }>(
        {}
    );
    const [loadError, setLoadError] = React.useState<string>("");

    async function loadConfiguration(): Promise<void> {
        setLoading(true);

        try {
            const result: AndromedaConfiguration = await getAndromedaConfig();
            const nextDrafts: { [key: string]: string } = {};

            MODULE_NAMES.forEach((moduleName: string) => {
                nextDrafts[moduleName] = JSON.stringify(
                    result.module_configurations[moduleName] ?? {},
                    null,
                    2
                );
            });

            setConfiguration(result);
            setDrafts(nextDrafts);
            setLoadError("");
        } catch {
            setConfiguration(null);
            setLoadError(
                "Failed to load Andromeda configuration. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        loadConfiguration();
    }, []);

    function setModuleLoading(moduleName: string, value: LoadingAction) {
        setLoadingActions((current) => ({
            ...current,
            [moduleName]: value,
        }));
    }

    function clearModuleMessages(moduleName: string) {
        setErrors((current) => ({ ...current, [moduleName]: "" }));
        setSuccesses((current) => ({ ...current, [moduleName]: "" }));
    }

    function handleDraftChange(moduleName: string, value: string) {
        setDrafts((current) => ({
            ...current,
            [moduleName]: value,
        }));
        clearModuleMessages(moduleName);
    }

    function handleToggle(moduleName: string, enabled: boolean) {
        if (configuration === null) {
            return;
        }

        const previousConfiguration: AndromedaConfiguration =
            structuredClone(configuration);
        const nextConfiguration: AndromedaConfiguration =
            structuredClone(configuration);

        if (enabled) {
            if (!nextConfiguration.enabled_modules.includes(moduleName)) {
                nextConfiguration.enabled_modules.push(moduleName);
            }
            if (
                nextConfiguration.module_configurations[moduleName] ===
                undefined
            ) {
                nextConfiguration.module_configurations[moduleName] = {};
            }
            setDrafts((current) => ({
                ...current,
                [moduleName]: JSON.stringify(
                    nextConfiguration.module_configurations[moduleName],
                    null,
                    2
                ),
            }));
        } else {
            nextConfiguration.enabled_modules =
                nextConfiguration.enabled_modules.filter(
                    (entry: string) => entry !== moduleName
                );
        }

        setConfiguration(nextConfiguration);
        clearModuleMessages(moduleName);
        setModuleLoading(moduleName, "toggle");

        const request = enabled
            ? enableAndromedaModule(moduleName)
            : disableAndromedaModule(moduleName);

        request
            .then((result: boolean) => {
                if (!result) {
                    setConfiguration(previousConfiguration);
                    setErrors((current) => ({
                        ...current,
                        [moduleName]: `Failed to ${
                            enabled ? "enable" : "disable"
                        } module.`,
                    }));
                } else {
                    setSuccesses((current) => ({
                        ...current,
                        [moduleName]: `Module ${
                            enabled ? "enabled" : "disabled"
                        } successfully.`,
                    }));
                }
            })
            .catch(() => {
                setConfiguration(previousConfiguration);
                setErrors((current) => ({
                    ...current,
                    [moduleName]: `Failed to ${
                        enabled ? "enable" : "disable"
                    } module.`,
                }));
            })
            .finally(() => {
                setModuleLoading(moduleName, null);
            });
    }

    function handleUpdateConfiguration(moduleName: string) {
        if (configuration === null) {
            return;
        }

        const parsedConfiguration = parseJSONObject(drafts[moduleName] ?? "{}");

        if (parsedConfiguration === null) {
            setErrors((current) => ({
                ...current,
                [moduleName]: "Configuration must be a valid JSON object.",
            }));
            setSuccesses((current) => ({
                ...current,
                [moduleName]: "",
            }));
            return;
        }

        setModuleLoading(moduleName, "config");
        clearModuleMessages(moduleName);

        updateAndromedaModuleConfig(moduleName, parsedConfiguration).then(
            (result: boolean) => {
                if (!result) {
                    setErrors((current) => ({
                        ...current,
                        [moduleName]: "Failed to update configuration.",
                    }));
                } else {
                    setConfiguration((current) => {
                        if (current === null) {
                            return current;
                        }

                        const nextConfiguration: AndromedaConfiguration =
                            structuredClone(current);
                        nextConfiguration.module_configurations[moduleName] =
                            parsedConfiguration;
                        return nextConfiguration;
                    });
                    setDrafts((current) => ({
                        ...current,
                        [moduleName]: JSON.stringify(
                            parsedConfiguration,
                            null,
                            2
                        ),
                    }));
                    setSuccesses((current) => ({
                        ...current,
                        [moduleName]: "Configuration updated successfully.",
                    }));
                }

                setModuleLoading(moduleName, null);
            }
        );
    }

    if (loading) {
        return <LoadingBar />;
    }

    return (
        <Box>
            <Stack spacing={3}>
                <Typography variant="h4">Andromeda modules</Typography>
                {loadError.length > 0 && (
                    <Alert
                        severity="error"
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                onClick={() => loadConfiguration()}
                            >
                                Retry
                            </Button>
                        }
                    >
                        {loadError}
                    </Alert>
                )}
                {configuration !== null && (
                    <Card>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ width: "25%" }}>
                                        Module
                                    </TableCell>
                                    <TableCell sx={{ width: "20%" }}>
                                        Status
                                    </TableCell>
                                    <TableCell>Configuration</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {MODULE_NAMES.map((moduleName: string) => (
                                    <AndromedaModuleRow
                                        key={moduleName}
                                        moduleName={moduleName}
                                        enabled={configuration.enabled_modules.includes(
                                            moduleName
                                        )}
                                        loadingAction={
                                            loadingActions[moduleName] ?? null
                                        }
                                        draft={drafts[moduleName] ?? "{}"}
                                        error={errors[moduleName] ?? ""}
                                        success={successes[moduleName] ?? ""}
                                        onToggle={(enabled: boolean) =>
                                            handleToggle(moduleName, enabled)
                                        }
                                        onDraftChange={(value: string) =>
                                            handleDraftChange(moduleName, value)
                                        }
                                        onUpdateConfiguration={() =>
                                            handleUpdateConfiguration(
                                                moduleName
                                            )
                                        }
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                )}
            </Stack>
        </Box>
    );
}
