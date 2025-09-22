import DatabaseItem from "./DatabaseItem.ts";
import { EmailTemplateType } from "./EmailTemplateType.ts";

export default interface EmailTemplate extends DatabaseItem {
    template_id: string;
    name: string;
    content: string;
    email_template_type: EmailTemplateType;
}

export interface APIResultEmailTemplate {
    result: boolean | null;
    reason: string | null;
}
