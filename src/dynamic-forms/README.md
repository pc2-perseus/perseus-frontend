# Dynamic Forms

## Input fields

All objects containing an input field share the following properties:

```typescript
interface MetaInput {
    type: string;
    id: string;
    label?: string; // default is ""
    value?: any; // default is undefined
    helperText?: string; // default is ""
    required?: boolean; // default is false
    visibility?: Rule[]; // default is []
    validation?: Validation[]; // default is []
}
```

`type` contains a string, indicating the input type ([see table below](#input-types))

`id` is a string that can be used to refer to this fields value in an [expression](#expressions)

`label` represents the HTML label for this field

`value` holds the default value for this field; its type is input type dependent ([see table below](#input-types))

`helperText` is displayed below the input field as muted text

`required` indicates if the user has to fill this input field before submitting the form

`visibility` contains an array of [rules](#rules), which decide when to display this field

`validation` contains an array of [validation items](#validation), which decide when to display an error and what error message should be displayed

Only `type` and `id` are required properties for most of the input types (some require additional properties to work, [see table below](#input-types))

### Input types

| Type      | value for `type` property | data type for `value` property         | additional properties                                                                                                           |
| --------- | ------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Checkbox  | `"checkbox"`              | `boolean`                              |                                                                                                                                 |
| Date      | `"date"`                  | `string` (format: YYYY-MM-DD)          |                                                                                                                                 |
| Datetime  | `"datetime"`              | `string` (format: YYYY-MM-DD HH:mm:ss) |                                                                                                                                 |
| Email     | `"email"`                 | `string`                               |                                                                                                                                 |
| File      | `"file"`                  | no default value possible              | `accept?: string \| string[];`<br/>indicates which files can be uploaded (optional)                                             |
| Number    | `"number"`                | `number`                               |                                                                                                                                 |
| Password  | `"password"`              | `string`                               |                                                                                                                                 |
| Phone     | `"phone"`                 | `string`                               |                                                                                                                                 |
| Radio     | `"radio"`                 | `string`                               | `options: { label: string; value: string }[];`<br/>the available options, each of them will result in a radio button (required) |
| Select    | `"select"`                | `string`                               | `options: { label: string; value: string }[];`<br/>the available options, each of them will result in a radio button (required) |
| Text      | `"text"`                  | `string`                               |                                                                                                                                 |
| Text area | `"textarea"`              | `string`                               |                                                                                                                                 |
| Time      | `"time"`                  | `string` (format: HH:mm:ss)            |                                                                                                                                 |
| URL       | `"url"`                   | `string`                               |                                                                                                                                 |

### JSON Examples

#### Checkbox

```json
{
    "type": "checkbox",
    "id": "terms",
    "label": "I agree to the terms of service",
    "value": false,
    "helperText": "You have to agree to be able to order",
    "required": true
}
```

#### Date

```json
{
    "type": "date",
    "id": "start",
    "label": "Start date",
    "value": "2024-02-17",
    "helperText": "Select on which day you want to start your trip",
    "required": true
}
```

#### Number

```json
{
    "type": "number",
    "id": "cores",
    "label": "Cores",
    "value": 420,
    "helperText": "Select how many cores you want to use",
    "required": false
}
```

#### Radio

```json
{
    "type": "radio",
    "id": "newsletter",
    "label": "Subscribe to our newsletter?",
    "options": [
        {
            "label": "yes please!",
            "value": "yes"
        },
        {
            "label": "no thanks",
            "value": "no"
        }
    ],
    "value": "yes",
    "required": false
}
```

#### Text

```json
{
    "type": "text",
    "id": "name",
    "label": "Name",
    "helperText": "Please enter your name",
    "required": true
}
```

## Other items

### Text items

Text items can be used to display text inside the form.

```typescript
interface TextItem {
    type: "textitem";
    content: string;
    visibility?: Rule[]; // default is []
}
```

`type` has to be `"textitem"` (required).

`content` is a string that will be printed (required). You can use markdown as well as [Expressions](#expressions).

`visibility` is an array of [Rules](#rules). If this array is interpreted as `true`, the item will be shown; if it is interpreted as `false`, it will be hidden.

To demonstrate this, the example

```json
{
    "type": "textitem",
    "content": "Welcome to our <u>**business form v2**</u>!"
}
```

would print the string "Welcome to our <u>**business form v2**</u>!"

## Rules

A rule can be used to determine if a certain condition is fulfilled or not. The schema is as follows:

```typescript
interface Rule {
    empyFields?: string[]; // default is []
    filledFields?: string[]; // default is []
    expressions?: string[]; // default is []
    external?: string; // default is []
}
```

`emptyFields` contains an array of strings, which are IDs of fields in the form. It returns to `true`, if all of these fields are empty.

`filledFields` contains an array of strings, which are IDs of fields in the form. It returns to `true`, if all of these fields are filled by the user.

`expressions` contains an array of strings, which are expressions as described below. It returns to `true`, if all of these expressions are compiled to `true`.

`external` is a string which holds a URL. This endpoint will be called using GET, and it will receive the current status of the form as an array with the following schema:

```typescript
interface FormStateField {
    id: string;
    value: any;
}
[];
```

If the endpoint returns `true`, it will also be considered `true` in the rule. Any other return value will be considered as `false`.

A rule is only considered as fulfilled if every aspect within the rule is true (AND operator).

Most of the time, you can pass an array of rules instead of just one. If this is the case, multiple rules are connected with the OR operator. Therefore, only one rule has to be fulfilled for the whole array to be considered as fulfilled.

Empty rules are always fulfilled.

## Validation

## Expressions

Expressions have to be written within double curly brackets `{{ ... }}`.
You can combine and nest as many expression types as you want. Do not nest the curly brackets but only the functions and operators itself. You can open and close multiple expressions in one string.

### Where to use expressions

Expressions can be used in the following places:

- in the content of [text items](#text-items)
- in the expressions property of [rules](#rules)

### Operators and functions

| Type                 | Example                                       | Comment                                                                                                                            |
| -------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Input value          | `{{ [myID] }}`                                | use the id of the input that you want to insert                                                                                    |
| Add                  | ` {{ [x] + 4 }}`                              |                                                                                                                                    |
| Subtract             | ` {{ 10 - [x] }}`                             |                                                                                                                                    |
| Multiply             | ` {{ [x] * 5 }}`                              |                                                                                                                                    |
| Divide               | ` {{ [x] / 5 }}`                              |                                                                                                                                    |
| Modulus              | ` {{ [x] % 3 }}`                              |                                                                                                                                    |
| Power                | ` {{ [x] ^ 2 }}`                              |                                                                                                                                    |
| Smaller              | ` {{ [x] < 2 }}`                              | Only for numbers                                                                                                                   |
| Smaller or equal     | ` {{ [x] <= 2 }}`                             | Only for numbers                                                                                                                   |
| Greater              | ` {{ [x] > 2 }}`                              | Only for numbers                                                                                                                   |
| Greater or equal     | ` {{ [x] >= 2 }}`                             | Only for numbers                                                                                                                   |
| Equal (numbers)      | ` {{ [x] == 2 }}`                             | Only for numbers                                                                                                                   |
| Not equal (numbers)  | ` {{ [x] != 2 }}`                             | Only for numbers                                                                                                                   |
| Condition            | ` {{ [x] > 5 ? 10 : 0 }}`                     |                                                                                                                                    |
| Round                | `{{ round([x] / 7) }}`                        |                                                                                                                                    |
| Round up             | `{{ ceil([x] / 7) }}`                         |                                                                                                                                    |
| Round down           | `{{ floor([x] / 7) }}`                        |                                                                                                                                    |
| Square root          | `{{ sqrt([x]) }}`                             |                                                                                                                                    |
| Minimum              | `{{ min([x], [y]) }}`                         |                                                                                                                                    |
| Maximum              | `{{ max([x], [y]) }}`                         |                                                                                                                                    |
| String length        | `{{ length("[x]") }}`                         | Add quotes (`'` or `"`) so that the value is interpreted as string                                                                 |
| String concatenation | `{{ concat("[x]", "[y]") }}`                  |                                                                                                                                    |
| Substring            | `{{ ("[x]"[1:5]  }}`<br/>`{{ "[x]"[1] }}`     | Index starts at 1                                                                                                                  |
| Split before         | `{{ splitBefore("[x]", "-")  }}`              | Returns the substring until the first occurrence of the second parameter                                                           |
| Split after          | `{{ splitAfter("[x]", "-")  }}`               | Returns the substring after the first occurrence of the second parameter                                                           |
| Split item           | `{{ splitItem("[x]", "-", 1)  }}`             | Returns the nth (third parameter) substring when splitting the string at every occurrence of the second parameter, starting with 0 |
| Replace              | `{{ replace("Hello World", " ", ", my ")  }}` |                                                                                                                                    |
| Includes             | `{{ includes("Hello World", "World")  }}`     |                                                                                                                                    |
| Equals               | `{{ equals("[x]", "GPU") }}`                  | Works with every data type                                                                                                         |
| And                  | `{{ [x] == 5 and [y] != 5 }}`                 |                                                                                                                                    |
| Or                   | `{{ [x] == 5 or [y] < 8 }}`                   |                                                                                                                                    |
| Xor                  | `{{ [x] == 5 xor [y] > 8 }}`                  |                                                                                                                                    |
| Not                  | `{{ not [x] == 5 }}`                          |                                                                                                                                    |
| Grouping             | `{{ ([x] + 5) * 10 }}`                        | Use `()` to prioritize certain parts of an expression                                                                              |
