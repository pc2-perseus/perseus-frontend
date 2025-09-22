import APIResponse from "../APIResponse.ts";
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import ScientificField from "../../interfaces/ScientificField.ts";
import Person from "../../interfaces/Person.ts";
import Institute from "../../interfaces/Institute.ts";
import Organization from "../../interfaces/Organization.ts";

export default async function getProjectEditOptions(): Promise<{
    source_names: string[];
    project_types: string[];
    scientific_fields: ScientificField[];
    calls: string[];
    persons: Person[];
    institutes: Institute[];
    organizations: Organization[];
    states: string[];
}> {
    const call: APIResponse<{
        source_names: string[];
        project_types: string[];
        scientific_fields: ScientificField[];
        calls: string[];
        persons: Person[];
        institutes: Institute[];
        organizations: Organization[];
        states: string[];
    }> = await makeAPICall<{
        source_names: string[];
        project_types: string[];
        scientific_fields: ScientificField[];
        calls: string[];
        persons: Person[];
        institutes: Institute[];
        organizations: Organization[];
        states: string[];
    }>(HTTPMethod.GET, "/service/ProjectEdit/options");

    return call.statusCode === 200 && call.value !== null
        ? call.value
        : {
              source_names: [],
              project_types: [],
              scientific_fields: [],
              calls: [],
              persons: [],
              institutes: [],
              organizations: [],
              states: [],
          };
}
