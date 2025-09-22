// Other imports
import dayjs, { Dayjs } from "dayjs";

export default function timeLeftUntil(datetime: Date): string {
    let now: Dayjs = dayjs();
    let until: Dayjs = dayjs(datetime);

    if (now > until) {
        now = until;
        until = dayjs();
    }

    const [years, months, days, hours, minutes, seconds] = [
        "y",
        "M",
        "d",
        "h",
        "m",
        "s",
    ].map((s) => until.diff(now, s as "y" | "M" | "d" | "h" | "m" | "s"));

    if (years > 0) {
        return years.toString() + " year" + (years > 1 ? "s" : "");
    }
    if (months > 0) {
        return months.toString() + " month" + (months > 1 ? "s" : "");
    }
    if (days > 0) {
        return days.toString() + " day" + (days > 1 ? "s" : "");
    }
    if (hours > 0) {
        return hours.toString() + " hour" + (hours > 1 ? "s" : "");
    }
    if (minutes > 0) {
        return minutes.toString() + " minute" + (minutes > 1 ? "s" : "");
    }
    return seconds.toString() + " second" + (seconds > 1 ? "s" : "");
}
