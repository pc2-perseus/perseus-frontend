// Custom imports
import CheckboxInput from "./inputs/CheckboxInput";
import DateInput from "./inputs/DateInput";
import DateTimeInput from "./inputs/DateTimeInput";
import EmailInput from "./inputs/EmailInput";
import FileInput from "./inputs/FileInput";
import PasswordInput from "./inputs/PasswordInput";
import PhoneInput from "./inputs/PhoneInput";
import TextInput from "./inputs/TextInput";
import URLInput from "./inputs/URLInput";
import TimeInput from "./inputs/TimeInput";
import NumberInput from "./inputs/NumberInput";
import RadioInput from "./inputs/RadioInput";
import SelectInput from "./inputs/SelectInput";
import TextAreaInput from "./inputs/TextAreaInput";

export type Input =
    | CheckboxInput
    | DateInput
    | DateTimeInput
    | EmailInput
    | FileInput
    | NumberInput
    | PasswordInput
    | PhoneInput
    | RadioInput
    | SelectInput
    | TextInput
    | TextAreaInput
    | TimeInput
    | URLInput;
