// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";

export default async function postLogin(
    username: string,
    password: string
): Promise<boolean> {
    const call: APIResponse<object> = await makeAPICall<object>(
        HTTPMethod.POST,
        "/login",
        { username: username, password: password }
    );

    return call.statusCode === 200;
}
