// React imports
import React from "react";

// Custom imports
import UserSetting from "../../interfaces/UserSetting.ts";
import getSettings from "../../api/getSettings.ts";
import DynamicForm from "../../dynamic-forms/DynamicForm.tsx";
import CONFIG from "../../config.ts";
import LoadingBar from "../LoadingBar.tsx";

export default function Settings(): React.ReactElement {
    const [loading, setLoading] = React.useState<boolean>(true);
    const [settings, setSettings] = React.useState<UserSetting[]>([]);

    React.useEffect(() => {
        getSettings().then((result) => {
            setSettings(JSON.parse(JSON.stringify(result)));
            setLoading(false);
        });
    }, []);

    function onSuccess() {
        window.location.reload();
    }

    if (loading) {
        return <LoadingBar />;
    }

    return (
        <DynamicForm
            form={{
                pages: [{ items: settings.map((s) => s.form_element) }],
                submitButton: "Save",
                submitEndpoint: CONFIG.CORE_URL + "/service/Settings/save",
                onSuccess: onSuccess,
            }}
        />
    );
}
