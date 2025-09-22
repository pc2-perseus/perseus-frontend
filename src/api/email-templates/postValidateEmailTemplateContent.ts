// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";

export default async function postValidateEmailTemplateContent(
    template_content: string
): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall<{
        result: boolean;
    }>(HTTPMethod.POST, "/service/EmailTemplateManager/validate", {
        email_template_content: template_content,
    });
    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
