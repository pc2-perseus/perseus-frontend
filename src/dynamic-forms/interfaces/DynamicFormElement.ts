// React imports
import React from "react";

// Custom imports
import DynamicFormPage from "./DynamicFormPage";

export default interface DynamicFormElement {
    title?: string | React.ReactElement;
    pages: DynamicFormPage[];
    submitButton?: string;
    submitEndpoint?: string;
    onSuccess?: () => void;
}
