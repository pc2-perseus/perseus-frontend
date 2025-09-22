// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import Cluster from "../interfaces/Cluster.ts";

export default async function postCluster(cluster: Cluster): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall<{
        result: boolean;
    }>(HTTPMethod.POST, "/service/ResourceManager/cluster", {
        cluster_id: cluster._id ? cluster._id : null,
        item_id: cluster.id,
        name: cluster.name,
    });
    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
