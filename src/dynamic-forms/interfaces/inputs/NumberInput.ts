// React import
import React from "react";

// Custom imports
import Rule from "../Rule";
import Validation from "../Validation";

export default interface NumberInput {
    type: "number";
    id: string;
    label?: string | React.ReactElement;
    helperText?: string;
    value?: number;
    required?: boolean;
    visibility?: Rule[];
    validation?: Validation[];
}
