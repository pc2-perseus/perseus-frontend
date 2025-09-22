// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import {
    ProjectEditAddable,
    ProjectEditField,
    ProjectEditSelectable,
} from "../components/services/ProjectEdit.tsx";
import ResourceValue from "../interfaces/ResourceValue.ts";
import Resource from "../interfaces/Resource.ts";

export default async function getProjectEdit(projectId: string): Promise<{
    editable: ProjectEditField[];
    selectable: ProjectEditSelectable[];
    addable: ProjectEditAddable[];
    requested_resources: { values: ResourceValue[]; options: Resource[] };
    granted_resources: { values: ResourceValue[]; options: Resource[] };
}> {
    const call: APIResponse<{
        editable: ProjectEditField[];
        selectable: ProjectEditSelectable[];
        addable: ProjectEditAddable[];
        requested_resources: { values: ResourceValue[]; options: Resource[] };
        granted_resources: { values: ResourceValue[]; options: Resource[] };
    }> = await makeAPICall<{
        editable: ProjectEditField[];
        selectable: ProjectEditSelectable[];
        addable: ProjectEditAddable[];
        requested_resources: { values: ResourceValue[]; options: Resource[] };
        granted_resources: { values: ResourceValue[]; options: Resource[] };
    }>(HTTPMethod.GET, "/service/ProjectEdit/" + projectId);

    return call.statusCode === 200 && call.value !== null
        ? call.value
        : {
              editable: [],
              selectable: [],
              addable: [],
              requested_resources: { values: [], options: [] },
              granted_resources: { values: [], options: [] },
          };
}

export async function getProjectEditCheck(): Promise<boolean> {
    const call: APIResponse<object> = await makeAPICall<object>(
        HTTPMethod.GET,
        "/service/ProjectEdit/check"
    );

    return call.statusCode === 200;
}
