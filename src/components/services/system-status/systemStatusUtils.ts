import Cluster from "../../../interfaces/Cluster.ts";
import Resource from "../../../interfaces/Resource.ts";
import SystemStatusCategory from "../../../interfaces/SystemStatusCategory.ts";
import SystemStatusEntry from "../../../interfaces/SystemStatusEntry.ts";
import SystemStatusService from "../../../interfaces/SystemStatusService.ts";
import { SYSTEM_STATUS_CATEGORY_ORDER } from "./systemStatusDefaults.ts";

export interface SystemStatusResourceOption {
    id: string;
    label: string;
}

export interface SystemStatusServiceOption {
    id: string;
    label: string;
}

function systemStatusCategoryRank(category: SystemStatusCategory): number {
    const rank: number = SYSTEM_STATUS_CATEGORY_ORDER.indexOf(category);
    return rank === -1 ? SYSTEM_STATUS_CATEGORY_ORDER.length : rank;
}

export function sortSystemStatusEntries(
    entries: SystemStatusEntry[]
): SystemStatusEntry[] {
    return [...entries].sort((entryA, entryB) => {
        const categoryDiff: number =
            systemStatusCategoryRank(entryA.category) -
            systemStatusCategoryRank(entryB.category);
        if (categoryDiff !== 0) {
            return categoryDiff;
        }

        const startA: number =
            entryA.start === null
                ? Number.NEGATIVE_INFINITY
                : Date.parse(entryA.start);
        const startB: number =
            entryB.start === null
                ? Number.NEGATIVE_INFINITY
                : Date.parse(entryB.start);
        if (startA !== startB) {
            return startB - startA;
        }

        const affectedServicesDiff: number =
            entryB.service_oids.length - entryA.service_oids.length;
        if (affectedServicesDiff !== 0) {
            return affectedServicesDiff;
        }

        return entryA.title.localeCompare(entryB.title);
    });
}

export function sortSystemStatusServices(
    services: SystemStatusService[]
): SystemStatusService[] {
    return [...services].sort((serviceA, serviceB) => {
        if (serviceA.display_rank !== serviceB.display_rank) {
            return serviceA.display_rank - serviceB.display_rank;
        }
        return serviceA.name.localeCompare(serviceB.name);
    });
}

export function getClusterName(
    clusterId: string | null,
    clusters: Cluster[]
): string {
    if (clusterId === null) {
        return "Central Services";
    }

    return (
        clusters.find((cluster: Cluster) => cluster.id === clusterId)?.name ??
        clusterId
    );
}

export function formatSystemStatusDate(date: string | null): string {
    if (date === null) {
        return "Not set";
    }

    const parsedDate: Date = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleString();
}

export function buildResourceOptions(
    resources: Resource[],
    clusters: Cluster[],
    clusterId: string | null
): SystemStatusResourceOption[] {
    return resources
        .filter((resource: Resource) =>
            clusterId === null ? true : resource.cluster_id === clusterId
        )
        .map((resource: Resource) => ({
            id: resource.id,
            label:
                getClusterName(resource.cluster_id, clusters) +
                " / " +
                resource.name,
        }))
        .sort((optionA, optionB) => optionA.label.localeCompare(optionB.label));
}

export function buildServiceOptions(
    services: SystemStatusService[],
    clusters: Cluster[]
): SystemStatusServiceOption[] {
    return sortSystemStatusServices(services).map(
        (service: SystemStatusService) => ({
            id: service._id ?? "",
            label:
                getClusterName(service.cluster_id, clusters) +
                " / " +
                service.name,
        })
    );
}
