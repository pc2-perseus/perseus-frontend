import { Input } from "../dynamic-forms/interfaces/Input.ts";

export default interface UserSetting {
    _id?: string;
    setting_id: string;
    name: string;
    form_element: Input;
}
