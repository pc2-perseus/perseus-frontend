import ResourceUsage from "../interfaces/ResourceUsage.ts";
import ResourceUsageAdditionalResource from "../interfaces/ResourceUsageAdditionalResource.ts";
import ResourceUsageAdditionalMetric from "../interfaces/ResourceUsageAdditionalMetric.ts";

export default function usedContingent(usage: ResourceUsage): number {
    let value: number = usage.value * usage.contingent_factor;
    usage.additional_resources.forEach(
        (item: ResourceUsageAdditionalResource) => {
            value += item.value * item.contingent_factor;
        }
    );
    usage.additional_metrics.forEach((item: ResourceUsageAdditionalMetric) => {
        value += item.value * item.contingent_factor;
    });
    return value;
}
