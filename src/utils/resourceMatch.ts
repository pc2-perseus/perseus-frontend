import ResourceValue from "../interfaces/ResourceValue.ts";
import Resource from "../interfaces/Resource.ts";

export default function resourceMatch(
    resourceValue: ResourceValue | { resource_id: string },
    resources: Resource[]
): Resource | undefined {
    try {
        return resources.filter((r) => r.id === resourceValue.resource_id)[0];
    } catch {
        return undefined;
    }
}
