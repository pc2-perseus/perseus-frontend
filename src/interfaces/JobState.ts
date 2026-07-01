const JOB_STATES = [
    "BOOT_FAIL",
    "CANCELLED",
    "COMPLETED",
    "DEADLINE",
    "FAILED",
    "NODE_FAIL",
    "OUT_OF_MEMORY",
    "PENDING",
    "PREEMPTED",
    "RUNNING",
    "SUSPENDED",
    "TIMEOUT",
] as const;

type JobState = (typeof JOB_STATES)[number];

export { JOB_STATES };
export type { JobState };
