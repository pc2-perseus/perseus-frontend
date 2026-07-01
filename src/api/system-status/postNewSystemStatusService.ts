import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import SubmitResult from "./SubmitResult.ts";
import getAPIErrorMessage from "../getAPIErrorMessage.ts";
import SystemStatusService from "../../interfaces/SystemStatusService.ts";

export default async function postNewSystemStatusService(
    service: SystemStatusService
): Promise<SubmitResult> {
    const call: APIResponse<{ result: boolean } | { message?: string }> =
        await makeAPICall<{ result: boolean } | { message?: string }>(
            HTTPMethod.POST,
            "/service/SystemStatus/services/new",
            service
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
                      "The service could not be created."
                  ),
    };
}
