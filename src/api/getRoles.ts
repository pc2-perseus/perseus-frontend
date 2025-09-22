// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import { Role } from "../components/services/RoleManager.tsx";

export default async function getRoles(): Promise<Role[]> {
    const call: APIResponse<{ roles: Role[] }> = await makeAPICall<{
        roles: Role[];
    }>(HTTPMethod.GET, "/service/RoleManager/roles");

    return call.statusCode === 200 && call.value !== null
        ? call.value.roles
        : [];
}
