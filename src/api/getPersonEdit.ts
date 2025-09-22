// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import {
    ProjectEditAddable,
    ProjectEditField,
    ProjectEditSelectable,
} from "../components/services/ProjectEdit.tsx";

export default async function getPersonEdit(personId: string): Promise<{
    editable: ProjectEditField[];
    selectable: ProjectEditSelectable[];
    addable: ProjectEditAddable[];
}> {
    const call: APIResponse<{
        editable: ProjectEditField[];
        selectable: ProjectEditSelectable[];
        addable: ProjectEditAddable[];
    }> = await makeAPICall<{
        editable: ProjectEditField[];
        selectable: ProjectEditSelectable[];
        addable: ProjectEditAddable[];
    }>(HTTPMethod.GET, "/service/PersonEdit/" + personId);

    return call.statusCode === 200 && call.value !== null
        ? call.value
        : {
              editable: [],
              selectable: [],
              addable: [],
          };
}

export async function getPersonEditCheck(): Promise<boolean> {
    const call: APIResponse<object> = await makeAPICall<object>(
        HTTPMethod.GET,
        "/service/PersonEdit/check"
    );

    return call.statusCode === 200;
}
