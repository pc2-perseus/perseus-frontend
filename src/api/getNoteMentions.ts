// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import UserMention from "../interfaces/UserMention.ts";

function normalizeMentionResponse(value: unknown): UserMention[] | null {
    if (Array.isArray(value)) {
        return value as UserMention[];
    }

    if (
        value !== null &&
        typeof value === "object" &&
        "items" in value &&
        Array.isArray(value.items)
    ) {
        return value.items as UserMention[];
    }

    return null;
}

export default async function getNoteMentions(
    username: string
): Promise<UserMention[] | null> {
    const call: APIResponse<
        UserMention[] | { users?: UserMention[]; items?: UserMention[] }
    > = await makeAPICall<
        UserMention[] | { users?: UserMention[]; items?: UserMention[] }
    >(
        HTTPMethod.GET,
        "/service/Notes/mention-user?username=" + encodeURIComponent(username)
    );

    return call.statusCode === 200
        ? normalizeMentionResponse(call.value)
        : null;
}
