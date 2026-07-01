import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import SubmitResult from "./SubmitResult.ts";
import getAPIErrorMessage from "../getAPIErrorMessage.ts";

export default async function deleteSystemStatusEntry(
    entryId: string | null
): Promise<SubmitResult> {
    if (entryId === null) {
        return {
            success: false,
            message: "The selected entry is missing its ObjectId.",
        };
    }

    const call: APIResponse<{ result: boolean } | { message?: string }> =
        await makeAPICall<{ result: boolean } | { message?: string }>(
            HTTPMethod.DELETE,
            "/service/SystemStatus/entries/" + entryId
        );

    return {
        success:
            call.statusCode === 200 &&
            call.value !== null &&
            "result" in call.value &&
            call.value.result === true,
        message:
            call.statusCode === 200
                ? ""
                : getAPIErrorMessage(
                      call.value,
                      "The entry could not be deleted."
                  ),
    };
}
