// React imports
import React from "react";

/**
 * Executes a callback function periodically after a specified delay.
 *
 * @param {Function} callback - The callback function to be executed.
 * @param {number} delay - The delay in milliseconds between each execution of the callback function.
 *
 * @return {void}
 */
export function usePeriodicHook(
    callback: () => never | void,
    delay: number
): void {
    const funcRef: React.MutableRefObject<undefined | (() => never | void)> =
        React.useRef<undefined | (() => never)>();

    React.useEffect(() => {
        funcRef.current = callback;
    }, [callback]);

    React.useEffect(() => {
        const tick = () => {
            if (funcRef.current !== undefined) {
                funcRef.current();
            }
        };
        const interval: ReturnType<typeof setInterval> = setInterval(
            tick,
            delay
        );
        return () => clearInterval(interval);
    }, [delay]);
}
