// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import Person from "../../interfaces/Person.ts";

export default async function getPersonDetails(
    personId: string
): Promise<Person | null> {
    const call: APIResponse<{ person: Person | null }> = await makeAPICall<{
        person: Person | null;
    }>(HTTPMethod.GET, "/service/PersonSearch/" + personId);
    return call.statusCode === 200 && call.value !== null
        ? call.value.person
        : null;
}
