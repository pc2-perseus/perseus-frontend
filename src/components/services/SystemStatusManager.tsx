import React from "react";
import { Alert, Box, Button, Grid, Stack, Typography } from "@mui/material";
import Cluster from "../../interfaces/Cluster.ts";
import Resource from "../../interfaces/Resource.ts";
import SystemStatusEntry from "../../interfaces/SystemStatusEntry.ts";
import SystemStatusService from "../../interfaces/SystemStatusService.ts";
import getResourceManagerData from "../../api/getResourceManagerData.ts";
import getSystemStatusEntries from "../../api/system-status/getSystemStatusEntries.ts";
import getSystemStatusServices from "../../api/system-status/getSystemStatusServices.ts";
import postNewSystemStatusEntry from "../../api/system-status/postNewSystemStatusEntry.ts";
import postSystemStatusEntry from "../../api/system-status/postSystemStatusEntry.ts";
import deleteSystemStatusEntry from "../../api/system-status/deleteSystemStatusEntry.ts";
import postNewSystemStatusService from "../../api/system-status/postNewSystemStatusService.ts";
import postSystemStatusService from "../../api/system-status/postSystemStatusService.ts";
import SubmitResult from "../../api/system-status/SubmitResult.ts";
import LoadingBar from "../LoadingBar.tsx";
import SystemStatusEntriesTable from "./system-status/SystemStatusEntriesTable.tsx";
import SystemStatusServiceSection from "./system-status/SystemStatusServiceSection.tsx";
import SystemStatusEntryDialog from "./system-status/SystemStatusEntryDialog.tsx";
import SystemStatusServiceDialog from "./system-status/SystemStatusServiceDialog.tsx";
import SystemStatusConfirmDialog from "./system-status/SystemStatusConfirmDialog.tsx";
import {
    createEmptySystemStatusEntry,
    createEmptySystemStatusService,
} from "./system-status/systemStatusDefaults.ts";
import {
    buildResourceOptions,
    buildServiceOptions,
    getClusterName,
    sortSystemStatusEntries,
    sortSystemStatusServices,
} from "./system-status/systemStatusUtils.ts";

type ServiceDialogContext = {
    service: SystemStatusService;
    sectionTitle: string;
};

type PendingConfirmation =
    | { type: "delete-entry"; entry: SystemStatusEntry }
    | { type: "deactivate-service"; service: SystemStatusService };

export default function SystemStatusManager(): React.ReactElement {
    const [loading, setLoading] = React.useState<boolean>(true);
    const [submitting, setSubmitting] = React.useState<boolean>(false);
    const [clusters, setClusters] = React.useState<Cluster[]>([]);
    const [resources, setResources] = React.useState<Resource[]>([]);
    const [entries, setEntries] = React.useState<SystemStatusEntry[]>([]);
    const [services, setServices] = React.useState<SystemStatusService[]>([]);
    const [pageMessage, setPageMessage] = React.useState<{
        severity: "success" | "error";
        text: string;
    } | null>(null);
    const [loadError, setLoadError] = React.useState<string>("");
    const [entryDialogError, setEntryDialogError] = React.useState<string>("");
    const [serviceDialogError, setServiceDialogError] =
        React.useState<string>("");
    const [editingEntry, setEditingEntry] =
        React.useState<SystemStatusEntry | null>(null);
    const [serviceDialogContext, setServiceDialogContext] =
        React.useState<ServiceDialogContext | null>(null);
    const [pendingConfirmation, setPendingConfirmation] =
        React.useState<PendingConfirmation | null>(null);

    async function reloadData(showLoader: boolean): Promise<void> {
        if (showLoader) {
            setLoading(true);
        }

        try {
            const [resourceManagerData, fetchedEntries, fetchedServices] =
                await Promise.all([
                    getResourceManagerData(),
                    getSystemStatusEntries(),
                    getSystemStatusServices(),
                ]);

            setClusters(resourceManagerData.clusters);
            setResources(resourceManagerData.resources);
            setEntries(sortSystemStatusEntries(fetchedEntries));
            setServices(sortSystemStatusServices(fetchedServices));
            setLoadError("");
        } catch {
            setLoadError(
                "Failed to load system status data. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        reloadData(true);
    }, []);

    async function submitEntry(entry: SystemStatusEntry): Promise<void> {
        setSubmitting(true);
        setEntryDialogError("");

        const result: SubmitResult =
            entry._id === null
                ? await postNewSystemStatusEntry(entry)
                : await postSystemStatusEntry(entry);

        if (result.success) {
            setEditingEntry(null);
            setPageMessage({
                severity: "success",
                text:
                    entry._id === null
                        ? "The entry was created."
                        : "The entry was updated.",
            });
            await reloadData(false);
        } else {
            setEntryDialogError(result.message);
        }

        setSubmitting(false);
    }

    async function submitService(service: SystemStatusService): Promise<void> {
        setSubmitting(true);
        setServiceDialogError("");

        const result: SubmitResult =
            service._id === null
                ? await postNewSystemStatusService(service)
                : await postSystemStatusService(service);

        if (result.success) {
            setServiceDialogContext(null);
            setPageMessage({
                severity: "success",
                text:
                    service._id === null
                        ? "The service was created."
                        : "The service was updated.",
            });
            await reloadData(false);
        } else {
            setServiceDialogError(result.message);
        }

        setSubmitting(false);
    }

    async function confirmAction(): Promise<void> {
        if (pendingConfirmation === null) {
            return;
        }

        setSubmitting(true);

        if (pendingConfirmation.type === "delete-entry") {
            const result: SubmitResult = await deleteSystemStatusEntry(
                pendingConfirmation.entry._id
            );

            if (result.success) {
                setEditingEntry(null);
                setPendingConfirmation(null);
                setPageMessage({
                    severity: "success",
                    text: "The entry was deleted.",
                });
                await reloadData(false);
            } else {
                setPendingConfirmation(null);
                setEntryDialogError(result.message);
            }
        } else {
            const inactiveService: SystemStatusService = {
                ...structuredClone(pendingConfirmation.service),
                is_active: false,
            };
            const result: SubmitResult =
                await postSystemStatusService(inactiveService);

            if (result.success) {
                setServiceDialogContext(null);
                setPendingConfirmation(null);
                setPageMessage({
                    severity: "success",
                    text: "The service was marked inactive.",
                });
                await reloadData(false);
            } else {
                setPendingConfirmation(null);
                setServiceDialogError(result.message);
            }
        }

        setSubmitting(false);
    }

    if (loading) {
        return <LoadingBar />;
    }

    const centralServices: SystemStatusService[] = services.filter(
        (service: SystemStatusService) => service.domain === "central_services"
    );
    const clusterSections = clusters.map((cluster: Cluster) => ({
        cluster,
        services: services.filter(
            (service: SystemStatusService) =>
                service.domain === "cluster" &&
                service.cluster_id === cluster.id
        ),
    }));

    const serviceOptions = buildServiceOptions(services, clusters).filter(
        (service) => service.id.length > 0
    );
    const resourceOptions = buildResourceOptions(
        resources,
        clusters,
        serviceDialogContext?.service.domain === "cluster"
            ? serviceDialogContext.service.cluster_id
            : null
    );

    return (
        <Box>
            <Stack spacing={3}>
                {loadError.length > 0 && (
                    <Alert
                        severity="error"
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                onClick={() => reloadData(true)}
                            >
                                Retry
                            </Button>
                        }
                    >
                        {loadError}
                    </Alert>
                )}
                {pageMessage !== null && (
                    <Alert
                        severity={pageMessage.severity}
                        onClose={() => setPageMessage(null)}
                    >
                        {pageMessage.text}
                    </Alert>
                )}
                <SystemStatusEntriesTable
                    entries={entries}
                    onAdd={() => {
                        setPageMessage(null);
                        setEntryDialogError("");
                        setEditingEntry(createEmptySystemStatusEntry());
                    }}
                    onSelect={(entry: SystemStatusEntry) => {
                        setPageMessage(null);
                        setEntryDialogError("");
                        setEditingEntry(structuredClone(entry));
                    }}
                />
                <Box>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        Services
                    </Typography>
                    <Grid spacing={2} container>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <SystemStatusServiceSection
                                title="Central Services"
                                services={centralServices}
                                onAdd={() => {
                                    setPageMessage(null);
                                    setServiceDialogError("");
                                    setServiceDialogContext({
                                        service:
                                            createEmptySystemStatusService(
                                                "central_services"
                                            ),
                                        sectionTitle: "Central Services",
                                    });
                                }}
                                onSelect={(service: SystemStatusService) => {
                                    setPageMessage(null);
                                    setServiceDialogError("");
                                    setServiceDialogContext({
                                        service: structuredClone(service),
                                        sectionTitle: "Central Services",
                                    });
                                }}
                            />
                        </Grid>
                        {clusterSections.map(({ cluster, services }) => (
                            <Grid key={cluster.id} size={{ xs: 12, md: 6 }}>
                                <SystemStatusServiceSection
                                    title={cluster.name}
                                    services={services}
                                    onAdd={() => {
                                        setPageMessage(null);
                                        setServiceDialogError("");
                                        setServiceDialogContext({
                                            service:
                                                createEmptySystemStatusService(
                                                    "cluster",
                                                    cluster.id
                                                ),
                                            sectionTitle: cluster.name,
                                        });
                                    }}
                                    onSelect={(
                                        service: SystemStatusService
                                    ) => {
                                        setPageMessage(null);
                                        setServiceDialogError("");
                                        setServiceDialogContext({
                                            service: structuredClone(service),
                                            sectionTitle: getClusterName(
                                                service.cluster_id,
                                                clusters
                                            ),
                                        });
                                    }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Stack>
            <SystemStatusEntryDialog
                open={editingEntry !== null}
                entry={editingEntry}
                services={serviceOptions}
                error={entryDialogError}
                submitting={submitting}
                onClose={() => {
                    setEditingEntry(null);
                    setEntryDialogError("");
                }}
                onSubmit={submitEntry}
                onDelete={
                    editingEntry?._id === null
                        ? null
                        : () => {
                              if (editingEntry !== null) {
                                  setPendingConfirmation({
                                      type: "delete-entry",
                                      entry: editingEntry,
                                  });
                              }
                          }
                }
            />
            <SystemStatusServiceDialog
                open={serviceDialogContext !== null}
                title={
                    serviceDialogContext === null
                        ? ""
                        : "Section: " + serviceDialogContext.sectionTitle
                }
                service={serviceDialogContext?.service ?? null}
                resourceOptions={resourceOptions}
                error={serviceDialogError}
                submitting={submitting}
                onClose={() => {
                    setServiceDialogContext(null);
                    setServiceDialogError("");
                }}
                onSubmit={submitService}
                onDeactivate={
                    serviceDialogContext?.service._id === null
                        ? null
                        : () => {
                              if (serviceDialogContext !== null) {
                                  setPendingConfirmation({
                                      type: "deactivate-service",
                                      service: serviceDialogContext.service,
                                  });
                              }
                          }
                }
            />
            <SystemStatusConfirmDialog
                open={pendingConfirmation !== null}
                title={
                    pendingConfirmation?.type === "delete-entry"
                        ? "Delete entry"
                        : "Mark service inactive"
                }
                description={
                    pendingConfirmation?.type === "delete-entry"
                        ? "Are you sure you want to delete this entry? This should only be used to correct mistakes."
                        : "Are you sure you want to mark this service as inactive? It will disappear from the active list."
                }
                actionLabel={
                    pendingConfirmation?.type === "delete-entry"
                        ? "Delete entry"
                        : "Mark inactive"
                }
                onClose={() => setPendingConfirmation(null)}
                onConfirm={confirmAction}
            />
        </Box>
    );
}
