// React import
import React from "react";

// Custom imports
import Rule from "../Rule";
import Validation from "../Validation";

export default interface DateInput {
    type: "date";
    id: string;
    label?: string | React.ReactElement;
    helperText?: string;
    value?: string; //YYYY-MM-DD
    required?: boolean;
    visibility?: Rule[];
    validation?: Validation[];
}
