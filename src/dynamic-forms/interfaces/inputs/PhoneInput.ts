// React import
import React from "react";

// Custom imports
import Rule from "../Rule";
import Validation from "../Validation";

export default interface PhoneInput {
    type: "phone";
    id: string;
    label?: string | React.ReactElement;
    helperText?: string;
    value?: string;
    required?: boolean;
    visibility?: Rule[];
    validation?: Validation[];
}
