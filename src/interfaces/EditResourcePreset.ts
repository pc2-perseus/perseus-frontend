import React from "react";
import ResourceValue from "./ResourceValue.ts";
import Resource from "./Resource.ts";
import Cluster from "./Cluster.ts";

export default interface EditResourcePreset {
    id: string;
    name: string;
    component: ({
        resourceValues,
        resources,
        clusters,
        updatePresetData,
    }: {
        resourceValues: ResourceValue[];
        resources: Resource[];
        clusters: Cluster[];
        updatePresetData: (id: string, value: unknown) => void;
    }) => React.ReactElement;
    submitFormat: (
        presetData: { [key: string]: unknown },
        resourceValues: ResourceValue[],
        resources: Resource[],
        clusters: Cluster[]
    ) => {
        resource_id: string;
        compute_project_id: string | null;
        start: string;
        end: string;
        value: number;
    }[];
    note?: (
        presetData: { [key: string]: unknown },
        resourceValues: ResourceValue[],
        resources: Resource[],
        clusters: Cluster[]
    ) => string;
}
