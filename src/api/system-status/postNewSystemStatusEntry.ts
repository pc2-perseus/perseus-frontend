import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import SubmitResult from "./SubmitResult.ts";
import getAPIErrorMessage from "../getAPIErrorMessage.ts";
import SystemStatusEntry from "../../interfaces/SystemStatusEntry.ts";

export default async function postNewSystemStatusEntry(
    entry: SystemStatusEntry
): Promise<SubmitResult> {
    const call: APIResponse<{ result: boolean } | { message?: string }> =
        await makeAPICall<{ result: boolean } | { message?: string }>(
            HTTPMethod.POST,
            "/service/SystemStatus/entries/new",
            entry
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
                      "The entry could not be created."
                  ),
    };
}
