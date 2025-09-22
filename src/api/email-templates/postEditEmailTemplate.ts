// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import EmailTemplate from "../../interfaces/EmailTemplate.ts";

export default async function postEditEmailTemplate(
    template: EmailTemplate
): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall<{
        result: boolean;
    }>(HTTPMethod.POST, "/service/EmailTemplateManager/" + template._id, {
        template_id: template.template_id,
        name: template.name,
        content: template.content,
        email_template_type: template.email_template_type,
    });
    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
