// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import { Session } from "../components/services/SessionManager.tsx";

export default async function getSessions(): Promise<Session[]> {
    const call: APIResponse<{ sessions: Session[] }> = await makeAPICall<{
        sessions: Session[];
    }>(HTTPMethod.GET, "/service/SessionManager/sessions");

    return call.statusCode === 200 && call.value !== null
        ? call.value.sessions
        : [];
}
