/**
 * Class for responses when calling an API endpoint.
 *
 * @template T - Data type of the response
 */
export default class APIResponse<T> {
    public statusCode: number;
    public value: null | T;

    constructor(statusCode: number, value: null | T = null) {
        this.statusCode = statusCode;
        this.value = value;
    }
}
