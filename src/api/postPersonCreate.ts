// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";

export default async function postPersonCreate(
    username: string,
    title: string,
    firstname: string,
    lastname: string,
    email: string,
    phone: string,
    homepage: string,
    nationalities: string[],
    cor: string
): Promise<string | null> {
    const call: APIResponse<{ oid: string }> = await makeAPICall<{
        oid: string;
    }>(HTTPMethod.POST, "/service/PersonCreate/create", {
        username: username,
        title: title,
        firstname: firstname,
        lastname: lastname,
        email: email,
        phone: phone,
        homepage: homepage,
        nationalities: nationalities,
        cor: cor,
    });
    return call.statusCode === 200 && call.value !== null
        ? call.value.oid
        : null;
}
