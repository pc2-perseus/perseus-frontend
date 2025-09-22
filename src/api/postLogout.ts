// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";

export default async function postLogout(): Promise<void> {
    await makeAPICall<object>(HTTPMethod.POST, "/logout");
    return;
}
