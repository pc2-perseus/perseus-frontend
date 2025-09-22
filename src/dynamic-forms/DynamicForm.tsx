// React imports
import React from "react";

// Custom imports
import DynamicFormElement from "./interfaces/DynamicFormElement";
import RendererMaterialUI from "./renderer/RendererMaterialUI";
import DynamicFormPage from "./interfaces/DynamicFormPage";
import TextItem from "./interfaces/TextItem";
import { Input } from "./interfaces/Input";
import FormStateField from "./interfaces/FormStateField";
import CopyItem from "./interfaces/CopyItem";

// Other imports
import dayjs from "dayjs";

export default function DynamicForm({ form }: { form: DynamicFormElement }) {
    const [formState, updateFormState] = React.useState<FormStateField[]>([]);
    const [data, updateData] = React.useState<DynamicFormElement>({
        title: "loading form...",
        pages: [],
        submitButton: undefined,
    });

    React.useEffect(() => {
        const setIds: string[] = [];
        formState.forEach((field: FormStateField) => {
            setIds.push(field.id);
        });
        // Remove this line when adding support for multiple pages
        form.pages = [form.pages[0]];
        form.pages.forEach((page: DynamicFormPage) => {
            page.items.forEach((item: Input | TextItem | CopyItem) => {
                if (item.type === "checkbox" && !setIds.includes(item.id)) {
                    formState.push({ id: item.id, value: item.value });
                } else if (item.type === "date" && !setIds.includes(item.id)) {
                    formState.push({
                        id: item.id,
                        value: dayjs(item.value, "YYYY-MM-DD").toDate(),
                    });
                } else if (item.type === "email" && !setIds.includes(item.id)) {
                    formState.push({ id: item.id, value: item.value });
                } else if (
                    item.type === "number" &&
                    !setIds.includes(item.id)
                ) {
                    formState.push({ id: item.id, value: item.value });
                } else if (
                    item.type === "password" &&
                    !setIds.includes(item.id)
                ) {
                    formState.push({ id: item.id, value: item.value });
                } else if (item.type === "phone" && !setIds.includes(item.id)) {
                    formState.push({ id: item.id, value: item.value });
                } else if (item.type === "radio" && !setIds.includes(item.id)) {
                    formState.push({ id: item.id, value: item.value });
                } else if (
                    item.type === "select" &&
                    !setIds.includes(item.id)
                ) {
                    formState.push({ id: item.id, value: item.value });
                } else if (
                    item.type === "textarea" &&
                    !setIds.includes(item.id)
                ) {
                    formState.push({ id: item.id, value: item.value });
                } else if (item.type === "text" && !setIds.includes(item.id)) {
                    formState.push({ id: item.id, value: item.value });
                } else if (item.type === "time" && !setIds.includes(item.id)) {
                    formState.push({
                        id: item.id,
                        value: dayjs(item.value, "HH:mm:ss").toDate(),
                    });
                } else if (item.type === "url" && !setIds.includes(item.id)) {
                    formState.push({ id: item.id, value: item.value });
                }
            });
        });
        updateData(form);
        updateFormState(JSON.parse(JSON.stringify(formState)));
    }, [form]);

    return <RendererMaterialUI data={data} initialFormState={formState} />;
}
