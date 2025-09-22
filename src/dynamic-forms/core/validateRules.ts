// Custom imports
import Rule from "../interfaces/Rule";
import { isExpressionTrue } from "./compileExpressions";
import FormStateField from "../interfaces/FormStateField";

function validateField(
    func: (field: FormStateField) => boolean,
    formState: FormStateField[]
): boolean {
    let flag: boolean = true;
    for (let i: number = 0; i < formState.length; i++) {
        if (!func(formState[i])) {
            flag = false;
            break;
        }
    }
    return flag;
}

function isEmpty(value: unknown): boolean {
    return value === undefined || value === null || value == "";
}

function validateProperty(
    func: (item: unknown) => boolean,
    items: unknown[]
): boolean {
    let flag: boolean = true;
    for (let i: number = 0; i < items.length; i++) {
        if (!func(items[i])) {
            flag = false;
            break;
        }
    }
    return flag;
}

function validateRule(rule: Rule, formState: FormStateField[]): boolean {
    if (rule.emptyFields) {
        const func = (field: FormStateField): boolean => {
            return (
                !rule.emptyFields?.includes(field.id) || isEmpty(field.value)
            );
        };

        if (!validateField(func, formState)) {
            return false;
        }
    }
    if (rule.filledFields) {
        const func = (item: unknown): boolean => {
            const field: FormStateField[] = formState.filter(
                (element: FormStateField) => element.id === item
            );
            return field.length > 0 && !isEmpty(field[0].value);
        };

        if (!validateProperty(func, rule.filledFields)) {
            return false;
        }
    }
    if (rule.expressions) {
        let flag: boolean = true;
        for (let i: number = 0; i < rule.expressions.length; i++) {
            if (flag && !isExpressionTrue(rule.expressions[i], formState)) {
                flag = false;
                break;
            }
        }
        if (!flag) {
            return false;
        }
    }
    if (rule.external) {
        let externalFlag: boolean = false;
        try {
            fetch(rule.external, {
                cache: "no-cache",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formState),
            }).then((data) => {
                data.json().then((fetchedFlag: boolean) => {
                    externalFlag = fetchedFlag;
                });
            });
        } catch (e) {
            /* empty */
        }
        if (!externalFlag) {
            return false;
        }
    }
    return true;
}

export default function validateRules(
    rules: Rule[],
    formState: FormStateField[]
): boolean {
    let flag: boolean = false;
    for (let i: number = 0; i < rules.length; i++) {
        if (!flag && validateRule(rules[i], formState)) {
            flag = true;
            break;
        }
    }
    return flag;
}
