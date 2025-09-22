// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import Cluster from "../interfaces/Cluster.ts";
import Resource from "../interfaces/Resource.ts";
import Limit from "../interfaces/Limit.ts";

export default async function getResourceManagerData(): Promise<{
    clusters: Cluster[];
    resources: Resource[];
    limits: Limit[];
}> {
    const call: APIResponse<{
        clusters: Cluster[];
        resources: Resource[];
        limits: Limit[];
    }> = await makeAPICall<{
        clusters: Cluster[];
        resources: Resource[];
        limits: Limit[];
    }>(HTTPMethod.GET, "/service/ResourceManager/all");

    return call.statusCode === 200 && call.value !== null
        ? call.value
        : { clusters: [], resources: [], limits: [] };
}
