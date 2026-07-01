import type { JobState } from "../../../../interfaces/JobState.ts";

export default function useJobStateColor(
    state: JobState | null
): "success" | "warning" | "error" | "info" {
    switch (state) {
        case "RUNNING":
        case "COMPLETED":
            return "success";
        case "PENDING":
        case "SUSPENDED":
            return "warning";
        case "BOOT_FAIL":
        case "CANCELLED":
        case "DEADLINE":
        case "FAILED":
        case "NODE_FAIL":
        case "OUT_OF_MEMORY":
        case "PREEMPTED":
        case "TIMEOUT":
            return "error";
        default:
            return "info";
    }
}
