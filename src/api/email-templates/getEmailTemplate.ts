// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import EmailTemplate from "../../interfaces/EmailTemplate.ts";

export default async function getEmailTemplate(
    emailTemplateId: string
): Promise<EmailTemplate | null> {
    const call: APIResponse<{ templates: EmailTemplate }> = await makeAPICall<{
        templates: EmailTemplate;
    }>(HTTPMethod.GET, "/service/EmailTemplateManager/" + emailTemplateId);

    return call.statusCode === 200 && call.value !== null
        ? call.value.templates
        : null;
}
