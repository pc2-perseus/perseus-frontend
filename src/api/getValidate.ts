// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import { AuthContextData } from "../contexts/AuthContext.ts";

export default async function getValidate(): Promise<null | AuthContextData> {
    const call: APIResponse<object> = await makeAPICall<object>(
        HTTPMethod.GET,
        "/validate"
    );

    return call.statusCode === 200 ? (call.value as AuthContextData) : null;
}
