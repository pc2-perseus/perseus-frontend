import ResourceValue from "../interfaces/ResourceValue.ts";
import Resource from "../interfaces/Resource.ts";
import Cluster from "../interfaces/Cluster.ts";
import resourceMatch from "./resourceMatch.ts";
import clusterMatch from "./clusterMatch.ts";

export default function sortResourceValues(
    resourceValues: ResourceValue[],
    resources: Resource[],
    clusters: Cluster[]
): ResourceValue[] {
    return JSON.parse(JSON.stringify(resourceValues)).sort(
        (rv1: ResourceValue, rv2: ResourceValue): number => {
            const r1: Resource | undefined = resourceMatch(rv1, resources);
            const r2: Resource | undefined = resourceMatch(rv2, resources);
            const c1: Cluster | undefined = clusterMatch(
                rv1,
                resources,
                clusters
            );
            const c2: Cluster | undefined = clusterMatch(
                rv2,
                resources,
                clusters
            );
            if (c1 === undefined && c2 !== undefined) {
                return -1;
            } else if (c1 !== undefined && c2 === undefined) {
                return 1;
            } else {
                if (c1 !== undefined && c2 !== undefined) {
                    const comp: number = c1.name.localeCompare(c2.name);
                    if (comp !== 0) {
                        return comp;
                    }
                }
                if (r1 === undefined && r2 !== undefined) {
                    return -1;
                } else if (r1 !== undefined && r2 === undefined) {
                    return 1;
                } else if (r1 !== undefined && r2 !== undefined) {
                    if (r1.name === r2.name) {
                        if (rv1.compute_project_id !== null) {
                            return rv1.compute_project_id.localeCompare(
                                rv2.compute_project_id === null
                                    ? ""
                                    : rv2.compute_project_id
                            );
                        }
                        if (rv2.compute_project_id !== null) {
                            return 1;
                        }
                    }
                    return r1.name.localeCompare(r2.name);
                }
                return rv1.resource_id.localeCompare(rv2.resource_id);
            }
        }
    );
}
