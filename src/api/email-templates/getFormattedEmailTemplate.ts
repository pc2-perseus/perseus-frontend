// Custom imports
import makeAPICall from "../makeAPICall.ts";
import HTTPMethod from "../HTTPMethod.ts";
import APIResponse from "../APIResponse.ts";
import EmailTemplate from "../../interfaces/EmailTemplate.ts";
import { APIResultEmailTemplate } from "../../interfaces/EmailTemplate.ts";

export default async function getFormattedEmailTemplate(
    emailTemplateId: string,
    projectId: string
): Promise<EmailTemplate | APIResultEmailTemplate | null> {
    const call: APIResponse<EmailTemplate | APIResultEmailTemplate> =
        await makeAPICall(
            HTTPMethod.GET,
            "/service/EmailTemplateManager/format?format_email_template=" +
                emailTemplateId +
                "&format_project=" +
                projectId
        );

    return call.statusCode === 200 && call.value !== null ? call.value : null;
}
