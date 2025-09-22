// React imports
import React, { FormEvent } from "react";

// MUI imports
import Typography from "@mui/material/Typography";
import {
    Backdrop,
    Box,
    Button,
    CircularProgress,
    Step,
    StepLabel,
    Stepper,
    Theme,
    useTheme,
} from "@mui/material";

// Custom imports
import DynamicFormElement from "../interfaces/DynamicFormElement";
import DynamicFormPage from "../interfaces/DynamicFormPage";
import MaterialUICheckbox from "./mui/inputs/MaterialUICheckbox";
import { Input } from "../interfaces/Input";
import TextItem from "../interfaces/TextItem";
import MaterialUIDatePicker from "./mui/inputs/MaterialUIDatePicker";
import MaterialUIDateTimePicker from "./mui/inputs/MaterialUIDateTimePicker";
import MaterialUIEmailInput from "./mui/inputs/MaterialUIEmailInput";
import MaterialUIFileUpload from "./mui/inputs/MaterialUIFileUpload";
import MaterialUIPasswordInput from "./mui/inputs/MaterialUIPasswordInput";
import MaterialUIPhoneInput from "./mui/inputs/MaterialUIPhoneInput";
import MaterialUITextInput from "./mui/inputs/MaterialUITextInput";
import MaterialUIURLInput from "./mui/inputs/MaterialUIURLInput";
import MaterialUITimePicker from "./mui/inputs/MaterialUITimePicker";
import MaterialUINumberInput from "./mui/inputs/MaterialUINumberInput";
import MaterialUIRadioButtons from "./mui/inputs/MaterialUIRadioButtons";
import MaterialUISelect from "./mui/inputs/MaterialUISelect";
import MaterialUITextArea from "./mui/inputs/MaterialUITextArea";
import parseMarkdown from "../core/parseMarkdown";
import Rule from "../interfaces/Rule";
import validateRules from "../core/validateRules";
import FormStateField from "../interfaces/FormStateField";
import compileExpressions, {
    isExpressionTrue,
} from "../core/compileExpressions";
import CopyItem from "../interfaces/CopyItem";
import MaterialUICopyField from "./mui/MaterialUICopyField";
import Validation from "../interfaces/Validation";
import TextAreaInput from "../interfaces/inputs/TextAreaInput.ts";
import CheckboxInput from "../interfaces/inputs/CheckboxInput.ts";
import DateInput from "../interfaces/inputs/DateInput.ts";
import DateTimeInput from "../interfaces/inputs/DateTimeInput.ts";
import EmailInput from "../interfaces/inputs/EmailInput.ts";
import FileInput from "../interfaces/inputs/FileInput.ts";
import NumberInput from "../interfaces/inputs/NumberInput.ts";
import PasswordInput from "../interfaces/inputs/PasswordInput.ts";
import PhoneInput from "../interfaces/inputs/PhoneInput.ts";
import RadioInput from "../interfaces/inputs/RadioInput.ts";
import SelectInput from "../interfaces/inputs/SelectInput.ts";
import TextInput from "../interfaces/inputs/TextInput.ts";
import TimeInput from "../interfaces/inputs/TimeInput.ts";
import URLInput from "../interfaces/inputs/URLInput.ts";

const DynamicCheckbox = React.memo(
    ({
        item,
        renderCount,
        formState,
        changeInput,
        executeValidation,
    }: {
        item: CheckboxInput;
        renderCount: number;
        formState: FormStateField[];
        changeInput: (id: string, value: unknown) => void;
        executeValidation: (
            items: Validation[],
            currentFormState: FormStateField[]
        ) => null | string;
    }) => {
        const value = (formState.find((f) => f.id === item.id)?.value ??
            undefined) as boolean | undefined;
        item.value = value === undefined ? undefined : value;
        return (
            <Box
                sx={{
                    mb: 2,
                    display:
                        item.visibility === undefined ||
                        validateRules(item.visibility, formState)
                            ? "block"
                            : "none",
                }}
                render-count={renderCount}
            >
                <MaterialUICheckbox
                    config={item}
                    onChange={changeInput}
                    error={executeValidation(
                        item.validation === undefined ? [] : item.validation,
                        formState
                    )}
                />
            </Box>
        );
    },
    (prev, next) => prev.renderCount === next.renderCount
);

const DynamicDatePicker = React.memo(
    ({
        item,
        renderCount,
        formState,
        changeInput,
        executeValidation,
    }: {
        item: DateInput;
        renderCount: number;
        formState: FormStateField[];
        changeInput: (id: string, value: unknown) => void;
        executeValidation: (
            items: Validation[],
            currentFormState: FormStateField[]
        ) => null | string;
    }) => {
        const value = (formState.find((f) => f.id === item.id)?.value ??
            undefined) as string | undefined;
        item.value = value === undefined ? undefined : value;
        return (
            <Box
                sx={{
                    mb: 2,
                    display:
                        item.visibility === undefined ||
                        validateRules(item.visibility, formState)
                            ? "block"
                            : "none",
                }}
                render-count={renderCount}
            >
                <MaterialUIDatePicker
                    config={item}
                    onChange={changeInput}
                    error={executeValidation(
                        item.validation === undefined ? [] : item.validation,
                        formState
                    )}
                />
            </Box>
        );
    },
    (prev, next) => prev.renderCount === next.renderCount
);

const DynamicDateTimePicker = React.memo(
    ({
        item,
        renderCount,
        formState,
        changeInput,
        executeValidation,
    }: {
        item: DateTimeInput;
        renderCount: number;
        formState: FormStateField[];
        changeInput: (id: string, value: unknown) => void;
        executeValidation: (
            items: Validation[],
            currentFormState: FormStateField[]
        ) => null | string;
    }) => {
        const value = (formState.find((f) => f.id === item.id)?.value ??
            undefined) as string | undefined;
        item.value = value === undefined ? undefined : value;
        return (
            <Box
                sx={{
                    mb: 2,
                    display:
                        item.visibility === undefined ||
                        validateRules(item.visibility, formState)
                            ? "block"
                            : "none",
                }}
                render-count={renderCount}
            >
                <MaterialUIDateTimePicker
                    config={item}
                    onChange={changeInput}
                    error={executeValidation(
                        item.validation === undefined ? [] : item.validation,
                        formState
                    )}
                />
            </Box>
        );
    },
    (prev, next) => prev.renderCount === next.renderCount
);

const DynamicEmailInput = React.memo(
    ({
        item,
        renderCount,
        formState,
        changeInput,
        executeValidation,
    }: {
        item: EmailInput;
        renderCount: number;
        formState: FormStateField[];
        changeInput: (id: string, value: unknown) => void;
        executeValidation: (
            items: Validation[],
            currentFormState: FormStateField[]
        ) => null | string;
    }) => {
        const value = (formState.find((f) => f.id === item.id)?.value ??
            undefined) as string | undefined;
        item.value =
            value === undefined
                ? undefined
                : compileExpressions(value, formState);
        return (
            <Box
                sx={{
                    mb: 2,
                    display:
                        item.visibility === undefined ||
                        validateRules(item.visibility, formState)
                            ? "block"
                            : "none",
                }}
                render-count={renderCount}
            >
                <MaterialUIEmailInput
                    config={item}
                    onChange={changeInput}
                    error={executeValidation(
                        item.validation === undefined ? [] : item.validation,
                        formState
                    )}
                />
            </Box>
        );
    },
    (prev, next) => prev.renderCount === next.renderCount
);

const DynamicFileUpload = React.memo(
    ({
        item,
        renderCount,
        formState,
        changeInput,
        executeValidation,
    }: {
        item: FileInput;
        renderCount: number;
        formState: FormStateField[];
        changeInput: (id: string, value: unknown) => void;
        executeValidation: (
            items: Validation[],
            currentFormState: FormStateField[]
        ) => null | string;
    }) => {
        return (
            <Box
                sx={{
                    mb: 2,
                    display:
                        item.visibility === undefined ||
                        validateRules(item.visibility, formState)
                            ? "block"
                            : "none",
                }}
                render-count={renderCount}
            >
                <MaterialUIFileUpload
                    config={item}
                    onChange={changeInput}
                    error={executeValidation(
                        item.validation === undefined ? [] : item.validation,
                        formState
                    )}
                />
            </Box>
        );
    },
    (prev, next) => prev.renderCount === next.renderCount
);

const DynamicNumberInput = React.memo(
    ({
        item,
        renderCount,
        formState,
        changeInput,
        executeValidation,
    }: {
        item: NumberInput;
        renderCount: number;
        formState: FormStateField[];
        changeInput: (id: string, value: unknown) => void;
        executeValidation: (
            items: Validation[],
            currentFormState: FormStateField[]
        ) => null | string;
    }) => {
        const value = (formState.find((f) => f.id === item.id)?.value ??
            undefined) as number | undefined;
        item.value = value === undefined ? undefined : value;
        return (
            <Box
                sx={{
                    mb: 2,
                    display:
                        item.visibility === undefined ||
                        validateRules(item.visibility, formState)
                            ? "block"
                            : "none",
                }}
                render-count={renderCount}
            >
                <MaterialUINumberInput
                    config={item}
                    onChange={changeInput}
                    error={executeValidation(
                        item.validation === undefined ? [] : item.validation,
                        formState
                    )}
                />
            </Box>
        );
    },
    (prev, next) => prev.renderCount === next.renderCount
);

const DynamicPasswordInput = React.memo(
    ({
        item,
        renderCount,
        formState,
        changeInput,
        executeValidation,
    }: {
        item: PasswordInput;
        renderCount: number;
        formState: FormStateField[];
        changeInput: (id: string, value: unknown) => void;
        executeValidation: (
            items: Validation[],
            currentFormState: FormStateField[]
        ) => null | string;
    }) => {
        const value = (formState.find((f) => f.id === item.id)?.value ??
            undefined) as string | undefined;
        item.value =
            value === undefined
                ? undefined
                : compileExpressions(value, formState);
        return (
            <Box
                sx={{
                    mb: 2,
                    display:
                        item.visibility === undefined ||
                        validateRules(item.visibility, formState)
                            ? "block"
                            : "none",
                }}
                render-count={renderCount}
            >
                <MaterialUIPasswordInput
                    config={item}
                    onChange={changeInput}
                    error={executeValidation(
                        item.validation === undefined ? [] : item.validation,
                        formState
                    )}
                />
            </Box>
        );
    },
    (prev, next) => prev.renderCount === next.renderCount
);

const DynamicPhoneInput = React.memo(
    ({
        item,
        renderCount,
        formState,
        changeInput,
        executeValidation,
    }: {
        item: PhoneInput;
        renderCount: number;
        formState: FormStateField[];
        changeInput: (id: string, value: unknown) => void;
        executeValidation: (
            items: Validation[],
            currentFormState: FormStateField[]
        ) => null | string;
    }) => {
        const value = (formState.find((f) => f.id === item.id)?.value ??
            undefined) as string | undefined;
        item.value =
            value === undefined
                ? undefined
                : compileExpressions(value, formState);
        return (
            <Box
                sx={{
                    mb: 2,
                    display:
                        item.visibility === undefined ||
                        validateRules(item.visibility, formState)
                            ? "block"
                            : "none",
                }}
                render-count={renderCount}
            >
                <MaterialUIPhoneInput
                    config={item}
                    onChange={changeInput}
                    error={executeValidation(
                        item.validation === undefined ? [] : item.validation,
                        formState
                    )}
                />
            </Box>
        );
    },
    (prev, next) => prev.renderCount === next.renderCount
);

const DynamicRadioButtons = React.memo(
    ({
        item,
        renderCount,
        formState,
        changeInput,
        executeValidation,
    }: {
        item: RadioInput;
        renderCount: number;
        formState: FormStateField[];
        changeInput: (id: string, value: unknown) => void;
        executeValidation: (
            items: Validation[],
            currentFormState: FormStateField[]
        ) => null | string;
    }) => {
        const value = (formState.find((f) => f.id === item.id)?.value ??
            undefined) as string | undefined;
        item.value = value === undefined ? undefined : value;
        return (
            <Box
                sx={{
                    mb: 2,
                    display:
                        item.visibility === undefined ||
                        validateRules(item.visibility, formState)
                            ? "block"
                            : "none",
                }}
                render-count={renderCount}
            >
                <MaterialUIRadioButtons
                    config={item}
                    onChange={changeInput}
                    error={executeValidation(
                        item.validation === undefined ? [] : item.validation,
                        formState
                    )}
                />
            </Box>
        );
    },
    (prev, next) => prev.renderCount === next.renderCount
);

const DynamicSelect = React.memo(
    ({
        item,
        renderCount,
        formState,
        changeInput,
        executeValidation,
    }: {
        item: SelectInput;
        renderCount: number;
        formState: FormStateField[];
        changeInput: (id: string, value: unknown) => void;
        executeValidation: (
            items: Validation[],
            currentFormState: FormStateField[]
        ) => null | string;
    }) => {
        const value = (formState.find((f) => f.id === item.id)?.value ??
            undefined) as string | undefined;
        item.value = value === undefined ? undefined : value;
        return (
            <Box
                sx={{
                    mb: 2,
                    display:
                        item.visibility === undefined ||
                        validateRules(item.visibility, formState)
                            ? "block"
                            : "none",
                }}
                render-count={renderCount}
            >
                <MaterialUISelect
                    config={item}
                    onChange={changeInput}
                    error={executeValidation(
                        item.validation === undefined ? [] : item.validation,
                        formState
                    )}
                />
            </Box>
        );
    },
    (prev, next) => prev.renderCount === next.renderCount
);

const DynamicTextArea = React.memo(
    ({
        item,
        renderCount,
        formState,
        changeInput,
        executeValidation,
    }: {
        item: TextAreaInput;
        renderCount: number;
        formState: FormStateField[];
        changeInput: (id: string, value: unknown) => void;
        executeValidation: (
            items: Validation[],
            currentFormState: FormStateField[]
        ) => null | string;
    }) => {
        const value = (formState.find((f) => f.id === item.id)?.value ??
            undefined) as string | undefined;
        item.value =
            value === undefined
                ? undefined
                : compileExpressions(value, formState);
        return (
            <Box
                sx={{
                    mb: 2,
                    display:
                        item.visibility === undefined ||
                        validateRules(item.visibility, formState)
                            ? "block"
                            : "none",
                }}
                render-count={renderCount}
            >
                <MaterialUITextArea
                    config={item}
                    onChange={changeInput}
                    error={executeValidation(
                        item.validation === undefined ? [] : item.validation,
                        formState
                    )}
                />
            </Box>
        );
    },
    (prev, next) => prev.renderCount === next.renderCount
);

const DynamicTextInput = React.memo(
    ({
        item,
        renderCount,
        formState,
        changeInput,
        executeValidation,
    }: {
        item: TextInput;
        renderCount: number;
        formState: FormStateField[];
        changeInput: (id: string, value: unknown) => void;
        executeValidation: (
            items: Validation[],
            currentFormState: FormStateField[]
        ) => null | string;
    }) => {
        const value = (formState.find((f) => f.id === item.id)?.value ??
            undefined) as string | undefined;
        item.value =
            value === undefined
                ? undefined
                : compileExpressions(value, formState);
        return (
            <Box
                sx={{
                    mb: 2,
                    display:
                        item.visibility === undefined ||
                        validateRules(item.visibility, formState)
                            ? "block"
                            : "none",
                }}
                render-count={renderCount}
            >
                <MaterialUITextInput
                    config={item}
                    onChange={changeInput}
                    error={executeValidation(
                        item.validation === undefined ? [] : item.validation,
                        formState
                    )}
                />
            </Box>
        );
    },
    (prev, next) => prev.renderCount === next.renderCount
);

const DynamicTimePicker = React.memo(
    ({
        item,
        renderCount,
        formState,
        changeInput,
        executeValidation,
    }: {
        item: TimeInput;
        renderCount: number;
        formState: FormStateField[];
        changeInput: (id: string, value: unknown) => void;
        executeValidation: (
            items: Validation[],
            currentFormState: FormStateField[]
        ) => null | string;
    }) => {
        const value = (formState.find((f) => f.id === item.id)?.value ??
            undefined) as string | undefined;
        item.value = value === undefined ? undefined : value;
        return (
            <Box
                sx={{
                    mb: 2,
                    display:
                        item.visibility === undefined ||
                        validateRules(item.visibility, formState)
                            ? "block"
                            : "none",
                }}
                render-count={renderCount}
            >
                <MaterialUITimePicker
                    config={item}
                    onChange={changeInput}
                    error={executeValidation(
                        item.validation === undefined ? [] : item.validation,
                        formState
                    )}
                />
            </Box>
        );
    },
    (prev, next) => prev.renderCount === next.renderCount
);

const DynamicURLInput = React.memo(
    ({
        item,
        renderCount,
        formState,
        changeInput,
        executeValidation,
    }: {
        item: URLInput;
        renderCount: number;
        formState: FormStateField[];
        changeInput: (id: string, value: unknown) => void;
        executeValidation: (
            items: Validation[],
            currentFormState: FormStateField[]
        ) => null | string;
    }) => {
        const value = (formState.find((f) => f.id === item.id)?.value ??
            undefined) as string | undefined;
        item.value =
            value === undefined
                ? undefined
                : compileExpressions(value, formState);
        return (
            <Box
                sx={{
                    mb: 2,
                    display:
                        item.visibility === undefined ||
                        validateRules(item.visibility, formState)
                            ? "block"
                            : "none",
                }}
                render-count={renderCount}
            >
                <MaterialUIURLInput
                    config={item}
                    onChange={changeInput}
                    error={executeValidation(
                        item.validation === undefined ? [] : item.validation,
                        formState
                    )}
                />
            </Box>
        );
    },
    (prev, next) => prev.renderCount === next.renderCount
);

const DynamicCopyField = React.memo(
    ({
        item,
        renderCount,
        formState,
    }: {
        item: CopyItem;
        renderCount: number;
        formState: FormStateField[];
    }) => {
        const value = (formState.find((f) => f.id === item.id)?.value ??
            undefined) as string | undefined;
        item.value =
            value === undefined ? "" : compileExpressions(value, formState);
        return (
            <Box
                sx={{
                    mb: 2,
                    display:
                        item.visibility === undefined ||
                        validateRules(item.visibility, formState)
                            ? "block"
                            : "none",
                }}
                render-count={renderCount}
            >
                <MaterialUICopyField config={item} />
            </Box>
        );
    },
    (prev, next) => prev.renderCount === next.renderCount
);

const DynamicTextItem = React.memo(
    ({
        item,
        renderCount,
        formState,
    }: {
        item: TextItem;
        renderCount: number;
        formState: FormStateField[];
    }) => {
        const theme: Theme = useTheme();
        return (
            <Box
                sx={{
                    mb: 2,
                    display:
                        item.visibility === undefined ||
                        validateRules(item.visibility, formState)
                            ? "block"
                            : "none",
                    a: {
                        color: theme.palette.primary.main,
                        textDecoration: "none",
                    },
                }}
                render-count={renderCount}
            >
                {parseMarkdown(compileExpressions(item.content, formState))}
            </Box>
        );
    },
    (prev, next) => prev.renderCount === next.renderCount
);

export default function RendererMaterialUI({
    data,
    initialFormState,
}: {
    data: DynamicFormElement;
    initialFormState: FormStateField[];
}) {
    const [renderCount, setRenderCount] = React.useState<number[][]>([]);
    const [formState, updateFormState] = React.useState<FormStateField[]>([]);
    const [backdropOpen, setBackdropOpen] = React.useState<boolean>(false);

    const formStateRef = React.useRef<FormStateField[]>([]);

    React.useEffect(() => {
        formStateRef.current = formState;
    }, [formState]);

    React.useEffect(() => {
        renderCount.length = 0;
        data.pages.forEach((page: DynamicFormPage, pageIndex: number) => {
            renderCount.push([]);
            page.items.forEach(() => {
                renderCount[pageIndex].push(0);
            });
        });
        setRenderCount(JSON.parse(JSON.stringify(renderCount)));
    }, [data]);

    function changeInput(id: string, value: unknown) {
        const currentFormState: FormStateField[] = JSON.parse(
            JSON.stringify(formStateRef.current)
        );

        let flag: boolean = false;
        currentFormState.forEach((item: FormStateField, index: number) => {
            if (!flag && item.id === id) {
                flag = true;
                currentFormState[index].value = value;
            }
        });
        const requiredUpdates: number[][] = [];
        data.pages.forEach((page: DynamicFormPage, pageIndex: number) => {
            requiredUpdates.push([]);
            page.items.map(
                (item: Input | TextItem | CopyItem, index: number) => {
                    if ("id" in item && item.id === id) {
                        requiredUpdates[pageIndex].push(index);
                        return;
                    }

                    if ("content" in item && item.content.includes(`[${id}]`)) {
                        requiredUpdates[pageIndex].push(index);
                        return;
                    }
                    let updateFlag: boolean = false;
                    item.visibility?.forEach((rule: Rule) => {
                        if (rule.emptyFields?.includes(id)) {
                            updateFlag = true;
                            requiredUpdates[pageIndex].push(index);
                        } else if (rule.filledFields?.includes(id)) {
                            updateFlag = true;
                            requiredUpdates[pageIndex].push(index);
                        } else {
                            rule.expressions?.forEach((expression: string) => {
                                if (
                                    !updateFlag &&
                                    expression.includes(`[${id}]`)
                                ) {
                                    updateFlag = true;
                                    requiredUpdates[pageIndex].push(index);
                                }
                            });
                        }
                    });
                }
            );
        });
        requiredUpdates.forEach(
            (itemsIndexList: number[], pageIndex: number) => {
                itemsIndexList.forEach((itemIndex: number) => {
                    try {
                        renderCount[pageIndex][itemIndex]++;
                    } catch (e) {
                        /* empty */
                    }
                });
            }
        );
        if (!flag) {
            currentFormState.push({ id: id, value: value });
        }
        updateFormState(JSON.parse(JSON.stringify(currentFormState)));
        setRenderCount(JSON.parse(JSON.stringify(renderCount)));
    }

    function executeValidation(
        items: Validation[],
        currentFormState: FormStateField[]
    ): null | string {
        let flag: boolean = true;
        let message: string = "";
        items.forEach((item: Validation) => {
            if (flag && !isExpressionTrue(item.expression, currentFormState)) {
                flag = false;
                message = item.message == undefined ? "" : item.message;
            }
        });
        return flag ? null : message;
    }

    async function submit(event: FormEvent): Promise<void> {
        event.preventDefault();
        if (data.submitEndpoint === undefined) {
            return;
        }
        setBackdropOpen(true);
        let body = {};
        formState.forEach((item: FormStateField) => {
            body = { ...body, [item.id]: item.value };
        });
        const response = await fetch(data.submitEndpoint, {
            method: "POST",
            headers: new Headers({ "content-type": "application/json" }),
            body: JSON.stringify(body),
            credentials: "include",
        });
        if (
            response.ok &&
            data.onSuccess !== undefined &&
            (response.status === 200 || response.status === 201)
        ) {
            data.onSuccess();
        }
        setBackdropOpen(false);
    }

    const [currentStep, updateCurrentStep] = React.useState<number>(0);

    React.useEffect(() => {
        updateFormState(JSON.parse(JSON.stringify(initialFormState)));
        renderCount.forEach((page: number[], pageIndex: number) => {
            page.forEach((_: number, itemIndex: number) => {
                renderCount[pageIndex][itemIndex]++;
            });
        });
        setRenderCount(JSON.parse(JSON.stringify(renderCount)));
    }, [initialFormState]);

    return (
        <form onSubmit={submit}>
            <Box
                sx={{
                    mb: data.title === undefined ? 0 : 4,
                }}
            >
                <Typography variant="h3" component="span">
                    {data.title}
                </Typography>
            </Box>
            {data.pages.length > 1 ? (
                <Box sx={{ width: "100%", mb: 5 }}>
                    <Stepper activeStep={currentStep}>
                        {data.pages.map(
                            (page: DynamicFormPage, index: number) => {
                                return (
                                    <Step key={index}>
                                        <StepLabel>{page.title}</StepLabel>
                                    </Step>
                                );
                            }
                        )}
                    </Stepper>
                </Box>
            ) : (
                <></>
            )}
            {data.pages.map((page: DynamicFormPage, pageIndex: number) => {
                return (
                    <Box
                        sx={{
                            width: "100%",
                            display:
                                currentStep === pageIndex ? "block" : "none",
                        }}
                        key={pageIndex}
                    >
                        {page.items.map(
                            (
                                item: Input | TextItem | CopyItem,
                                index: number
                            ) => {
                                switch (item.type) {
                                    case "textitem":
                                        return (
                                            <DynamicTextItem
                                                key={index}
                                                item={item}
                                                renderCount={
                                                    renderCount[pageIndex]?.[
                                                        index
                                                    ] ?? 0
                                                }
                                                formState={formState}
                                            />
                                        );
                                    case "checkbox":
                                        return (
                                            <DynamicCheckbox
                                                key={index}
                                                item={item}
                                                renderCount={
                                                    renderCount[pageIndex]?.[
                                                        index
                                                    ] ?? 0
                                                }
                                                formState={formState}
                                                changeInput={changeInput}
                                                executeValidation={
                                                    executeValidation
                                                }
                                            />
                                        );
                                    case "date":
                                        return (
                                            <DynamicDatePicker
                                                key={index}
                                                item={item}
                                                renderCount={
                                                    renderCount[pageIndex]?.[
                                                        index
                                                    ] ?? 0
                                                }
                                                formState={formState}
                                                changeInput={changeInput}
                                                executeValidation={
                                                    executeValidation
                                                }
                                            />
                                        );
                                    case "datetime":
                                        return (
                                            <DynamicDateTimePicker
                                                key={index}
                                                item={item}
                                                renderCount={
                                                    renderCount[pageIndex]?.[
                                                        index
                                                    ] ?? 0
                                                }
                                                formState={formState}
                                                changeInput={changeInput}
                                                executeValidation={
                                                    executeValidation
                                                }
                                            />
                                        );
                                    case "email":
                                        return (
                                            <DynamicEmailInput
                                                key={index}
                                                item={item}
                                                renderCount={
                                                    renderCount[pageIndex]?.[
                                                        index
                                                    ] ?? 0
                                                }
                                                formState={formState}
                                                changeInput={changeInput}
                                                executeValidation={
                                                    executeValidation
                                                }
                                            />
                                        );
                                    case "file":
                                        return (
                                            <DynamicFileUpload
                                                key={index}
                                                item={item}
                                                renderCount={
                                                    renderCount[pageIndex]?.[
                                                        index
                                                    ] ?? 0
                                                }
                                                formState={formState}
                                                changeInput={changeInput}
                                                executeValidation={
                                                    executeValidation
                                                }
                                            />
                                        );
                                    case "number":
                                        return (
                                            <DynamicNumberInput
                                                key={index}
                                                item={item}
                                                renderCount={
                                                    renderCount[pageIndex]?.[
                                                        index
                                                    ] ?? 0
                                                }
                                                formState={formState}
                                                changeInput={changeInput}
                                                executeValidation={
                                                    executeValidation
                                                }
                                            />
                                        );
                                    case "password":
                                        return (
                                            <DynamicPasswordInput
                                                key={index}
                                                item={item}
                                                renderCount={
                                                    renderCount[pageIndex]?.[
                                                        index
                                                    ] ?? 0
                                                }
                                                formState={formState}
                                                changeInput={changeInput}
                                                executeValidation={
                                                    executeValidation
                                                }
                                            />
                                        );
                                    case "phone":
                                        return (
                                            <DynamicPhoneInput
                                                key={index}
                                                item={item}
                                                renderCount={
                                                    renderCount[pageIndex]?.[
                                                        index
                                                    ] ?? 0
                                                }
                                                formState={formState}
                                                changeInput={changeInput}
                                                executeValidation={
                                                    executeValidation
                                                }
                                            />
                                        );
                                    case "radio":
                                        return (
                                            <DynamicRadioButtons
                                                key={index}
                                                item={item}
                                                renderCount={
                                                    renderCount[pageIndex]?.[
                                                        index
                                                    ] ?? 0
                                                }
                                                formState={formState}
                                                changeInput={changeInput}
                                                executeValidation={
                                                    executeValidation
                                                }
                                            />
                                        );
                                    case "select":
                                        return (
                                            <DynamicSelect
                                                key={index}
                                                item={item}
                                                renderCount={
                                                    renderCount[pageIndex]?.[
                                                        index
                                                    ] ?? 0
                                                }
                                                formState={formState}
                                                changeInput={changeInput}
                                                executeValidation={
                                                    executeValidation
                                                }
                                            />
                                        );
                                    case "text":
                                        return (
                                            <DynamicTextInput
                                                key={index}
                                                item={item}
                                                renderCount={
                                                    renderCount[pageIndex]?.[
                                                        index
                                                    ] ?? 0
                                                }
                                                formState={formState}
                                                changeInput={changeInput}
                                                executeValidation={
                                                    executeValidation
                                                }
                                            />
                                        );
                                    case "textarea":
                                        return (
                                            <DynamicTextArea
                                                key={index}
                                                item={item}
                                                renderCount={
                                                    renderCount[pageIndex]?.[
                                                        index
                                                    ] ?? 0
                                                }
                                                formState={formState}
                                                changeInput={changeInput}
                                                executeValidation={
                                                    executeValidation
                                                }
                                            />
                                        );
                                    case "time":
                                        return (
                                            <DynamicTimePicker
                                                key={index}
                                                item={item}
                                                renderCount={
                                                    renderCount[pageIndex]?.[
                                                        index
                                                    ] ?? 0
                                                }
                                                formState={formState}
                                                changeInput={changeInput}
                                                executeValidation={
                                                    executeValidation
                                                }
                                            />
                                        );
                                    case "url":
                                        return (
                                            <DynamicURLInput
                                                key={index}
                                                item={item}
                                                renderCount={
                                                    renderCount[pageIndex]?.[
                                                        index
                                                    ] ?? 0
                                                }
                                                formState={formState}
                                                changeInput={changeInput}
                                                executeValidation={
                                                    executeValidation
                                                }
                                            />
                                        );
                                    case "copyitem":
                                        return (
                                            <DynamicCopyField
                                                key={index}
                                                item={item}
                                                renderCount={
                                                    renderCount[pageIndex]?.[
                                                        index
                                                    ] ?? 0
                                                }
                                                formState={formState}
                                            />
                                        );
                                    default:
                                        return <React.Fragment key={index} />;
                                }
                            }
                        )}
                    </Box>
                );
            })}
            <Box sx={{ width: "100%" }}>
                {data.pages.length === 1 ? (
                    <Button
                        variant="contained"
                        sx={{
                            float: "right",
                            display:
                                data.submitButton === undefined
                                    ? "none"
                                    : "inline-flex",
                        }}
                        type="submit"
                    >
                        {data.submitButton === undefined
                            ? "Submit"
                            : data.submitButton}
                    </Button>
                ) : (
                    <>
                        <Button
                            variant="contained"
                            sx={{ float: "left" }}
                            disabled={currentStep === 0}
                            onClick={() => {
                                updateCurrentStep(Math.max(0, currentStep - 1));
                            }}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="contained"
                            sx={{ float: "right" }}
                            onClick={() => {
                                updateCurrentStep(
                                    Math.min(
                                        data.pages.length - 1,
                                        currentStep + 1
                                    )
                                );
                            }}
                        >
                            {data.pages.length - 1 === currentStep
                                ? data.submitButton === undefined
                                    ? "Submit"
                                    : data.submitButton
                                : "Next"}
                        </Button>
                    </>
                )}
            </Box>
            <Backdrop
                open={backdropOpen}
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
            >
                <CircularProgress color="primary" />
            </Backdrop>
        </form>
    );
}
