// React import
import React from "react";

// Custom imports
import Rule from "../Rule";
import Validation from "../Validation";

export default interface CheckboxInput {
    type: "checkbox";
    id: string;
    label?: string | React.ReactElement;
    helperText?: string;
    value?: boolean;
    required?: boolean;
    visibility?: Rule[];
    validation?: Validation[];
}
