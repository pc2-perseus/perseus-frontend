import React from "react";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import PauseCircleRoundedIcon from "@mui/icons-material/PauseCircleRounded";
import TimelapseRoundedIcon from "@mui/icons-material/TimelapseRounded";
import type { JobState } from "../../../../interfaces/JobState.ts";
import useJobStateColor from "./useJobStateColor.ts";

export default function StateIcon({
    state,
}: {
    state: JobState | null;
}): React.ReactElement {
    const stateColor = useJobStateColor(state);
    const sx = {
        color: `${stateColor}.main`,
        fontSize: 24,
    };

    switch (state) {
        case "RUNNING":
            return <PlayArrowRoundedIcon sx={sx} />;
        case "PENDING":
            return <ScheduleRoundedIcon sx={sx} />;
        case "COMPLETED":
            return <CheckCircleRoundedIcon sx={sx} />;
        case "SUSPENDED":
            return <PauseCircleRoundedIcon sx={sx} />;
        case "CANCELLED":
            return <CancelRoundedIcon sx={sx} />;
        case "BOOT_FAIL":
        case "DEADLINE":
        case "FAILED":
        case "NODE_FAIL":
        case "OUT_OF_MEMORY":
        case "PREEMPTED":
        case "TIMEOUT":
            return <ErrorRoundedIcon sx={sx} />;
        default:
            return <TimelapseRoundedIcon sx={sx} />;
    }
}
