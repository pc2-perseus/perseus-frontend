// React import
import React from "react";

// Custom imports
import Rule from "../Rule";
import Validation from "../Validation";

export default interface TimeInput {
    type: "time";
    id: string;
    label?: string | React.ReactElement;
    helperText?: string;
    value?: string; // HH:mm:ss
    required?: boolean;
    visibility?: Rule[];
    validation?: Validation[];
}
