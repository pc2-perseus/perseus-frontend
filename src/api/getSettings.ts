// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import UserSetting from "../interfaces/UserSetting.ts";

export default async function getSettings(): Promise<UserSetting[]> {
    const call: APIResponse<{ items: UserSetting[] }> = await makeAPICall<{
        items: UserSetting[];
    }>(HTTPMethod.GET, "/service/Settings/items");

    return call.statusCode === 200 && call.value !== null
        ? call.value.items
        : [];
}
