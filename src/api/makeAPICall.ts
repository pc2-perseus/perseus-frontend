// Custom imports
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";
import CONFIG from "../config.ts";

const abortControllers: Map<string, AbortController> = new Map<
    string,
    AbortController
>();

const relevantEndpoints: string[] = [
    "/service/ProjectSearch/search",
    "/service/PersonSearch/search",
];

/**
 * Makes an API call.
 *
 * @template T - Data type of the API response
 *
 * @param method {HTTPMethod} - The HTTP method to use
 * @param endpoint {string} - The endpoint to call
 * @param payload {undefined | object} - The payload to send with the request
 *
 * @return {Promise<APIResponse<T>>} - A promise containing the API response
 */
export default async function makeAPICall<T>(
    method: HTTPMethod,
    endpoint: string,
    payload: undefined | object = undefined
): Promise<APIResponse<T>> {
    if (
        abortControllers.has(endpoint) &&
        relevantEndpoints.includes(endpoint)
    ) {
        abortControllers.get(endpoint)?.abort();
    }

    const controller = new AbortController();
    abortControllers.set(endpoint, controller);

    const call: globalThis.Response = await fetch(CONFIG.CORE_URL + endpoint, {
        method: method.toString(),
        headers: new Headers({ "content-type": "application/json" }),
        body: payload ? JSON.stringify(payload) : undefined,
        credentials: "include",
        signal: controller.signal,
    });

    abortControllers.delete(endpoint);

    return new APIResponse<T>(call.status, await call.json());
}
