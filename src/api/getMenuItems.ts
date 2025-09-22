// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import { NavigationItem } from "../components/DrawerNavigation.tsx";

export default async function getMenuItems(): Promise<NavigationItem[]> {
    const call: APIResponse<{ items: NavigationItem[] }> = await makeAPICall<{
        items: NavigationItem[];
    }>(HTTPMethod.GET, "/menu-items");

    return call.statusCode === 200 && call.value !== null
        ? call.value.items
        : [];
}
