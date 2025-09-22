// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import Person from "../../interfaces/Person.ts";

export default async function searchPersons(search: string): Promise<Person[]> {
    const call: APIResponse<{
        persons: Person[];
    }> = await makeAPICall<{ persons: Person[] }>(
        HTTPMethod.GET,
        "/service/PersonSearch/search?search=" + search
    );

    return call.statusCode == 200 && call.value !== null
        ? call.value.persons
        : [];
}
