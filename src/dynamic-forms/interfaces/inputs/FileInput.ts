// React import
import React from "react";

// Custom imports
import Rule from "../Rule";
import Validation from "../Validation";

export default interface FileInput {
    type: "file";
    id: string;
    label?: string | React.ReactElement;
    helperText?: string;
    accept?: string | string[];
    required?: boolean;
    visibility?: Rule[];
    validation?: Validation[];
}
