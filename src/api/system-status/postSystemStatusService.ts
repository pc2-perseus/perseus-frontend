import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import SubmitResult from "./SubmitResult.ts";
import getAPIErrorMessage from "../getAPIErrorMessage.ts";
import SystemStatusService from "../../interfaces/SystemStatusService.ts";

export default async function postSystemStatusService(
    service: SystemStatusService
): Promise<SubmitResult> {
    if (service._id === null) {
        return {
            success: false,
            message: "The selected service is missing its ObjectId.",
        };
    }

    const call: APIResponse<{ result: boolean } | { message?: string }> =
        await makeAPICall<{ result: boolean } | { message?: string }>(
            HTTPMethod.POST,
            "/service/SystemStatus/services/" + service._id,
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
                      "The service could not be updated."
                  ),
    };
}
