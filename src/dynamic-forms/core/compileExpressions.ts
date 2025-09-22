// Custom imports
import FormStateField from "../interfaces/FormStateField";

// Other imports
import { create, all, MathJsInstance, factory } from "mathjs";

const evaluationEngine: MathJsInstance = create(all);
const limitedEvaluate = evaluationEngine.evaluate;

evaluationEngine.import(
    {
        import: function () {
            throw new Error("");
        },
        createUnit: function () {
            throw new Error("");
        },
        evaluate: function () {
            throw new Error("");
        },
        parse: function () {
            throw new Error("");
        },
        simplify: function () {
            throw new Error("");
        },
        derivative: function () {
            throw new Error("");
        },
        length: factory(
            "length",
            [],
            () =>
                function length(a: string) {
                    return a.length;
                }
        ),
        splitBefore: factory(
            "splitBefore",
            [],
            () =>
                function splitBefore(a: string, b: string) {
                    return a.split(b, 2)[0];
                }
        ),
        splitAfter: factory(
            "splitAfter",
            [],
            () =>
                function splitAfter(a: string, b: string) {
                    return a.split(b, 2)[1];
                }
        ),
        splitItem: factory(
            "splitItem",
            [],
            () =>
                function splitItem(a: string, b: string, c: number) {
                    return a.split(b)[c];
                }
        ),
        replace: factory(
            "replace",
            [],
            () =>
                function replace(a: string, b: string, c: string) {
                    return a.replaceAll(b, c);
                }
        ),
        includes: factory(
            "includes",
            [],
            () =>
                function includes(a: string, b: string) {
                    return a.includes(b);
                }
        ),
        equals: factory(
            "equals",
            [],
            () =>
                function equals(a: unknown, b: unknown) {
                    return a === b;
                }
        ),
    },
    { override: true }
);

export default function compileExpressions(
    content: string,
    formState: FormStateField[]
): string {
    const expressions: { original: string; compiled: string }[] = [];
    const split: string[] = content.split("{{");
    split.forEach((item: string) => {
        if (item.includes("}}")) {
            expressions.push({
                original: item.split("}}")[0],
                compiled: "",
            });
        }
    });

    expressions.forEach(
        (expression: { original: string; compiled: string }, index: number) => {
            let compiled: string = expression.original;
            formState.forEach((field: FormStateField) => {
                compiled = compiled.replaceAll(
                    "[" + field.id + "]",
                    field.value === undefined || field.value === null
                        ? ""
                        : field.value.toString()
                );
            });
            try {
                compiled = limitedEvaluate(compiled);
            } catch (e) {
                /* empty */
            }
            expressions[index].compiled = compiled;
        }
    );

    let result: string = content;
    expressions.forEach(
        (expression: { original: string; compiled: string }) => {
            result = result.replaceAll(
                "{{" + expression.original + "}}",
                expression.compiled
            );
        }
    );
    result = result.replaceAll("{{", "").replaceAll("}}", "");
    return result;
}

export function isExpressionTrue(
    expression: string,
    formState: FormStateField[]
): boolean {
    return compileExpressions(expression, formState).trim() === "true";
}
