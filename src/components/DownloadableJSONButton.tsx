// React imports
import React from "react";
import { Button, ButtonProps } from "@mui/material";

interface DownloadableJSONButton extends ButtonProps {
    buttonText: string;
    json: object;
}

export default function DownloadableJSONButton({
    buttonText,
    json,
    ...props
}: DownloadableJSONButton): React.ReactElement {
    function download() {
        const jsonString: string = JSON.stringify(json, null, 2);
        const blob: Blob = new Blob([jsonString], { type: "application/json" });
        const url: string = URL.createObjectURL(blob);

        const a: HTMLAnchorElement = document.createElement("a");
        a.href = url;
        a.download = "data.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return (
        <Button {...props} onClick={download}>
            {buttonText}
        </Button>
    );
}
