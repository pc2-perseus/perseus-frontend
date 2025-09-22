// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import { Role } from "../components/services/RoleManager.tsx";

export default async function updateRole(role: Role): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall<{
        result: boolean;
    }>(HTTPMethod.POST, "/service/RoleManager/update", {
        name: role.name,
        groups: role.groups,
        users: role.users,
        permissions: role.permissions,
    });

    return call.statusCode === 200 && call.value !== null && call.value.result;
}
