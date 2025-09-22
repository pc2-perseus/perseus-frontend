import ResourceValue from "../interfaces/ResourceValue.ts";
import Cluster from "../interfaces/Cluster.ts";
import resourceMatch from "./resourceMatch.ts";
import Resource from "../interfaces/Resource.ts";

export default function clusterMatch(
    resourceValue: ResourceValue | { resource_id: string },
    resources: Resource[],
    clusters: Cluster[]
): Cluster | undefined {
    try {
        const r = resourceMatch(resourceValue, resources);
        if (r === undefined) {
            return undefined;
        }
        return clusters.filter((c) => c.id === r.cluster_id)[0];
    } catch {
        return undefined;
    }
}
