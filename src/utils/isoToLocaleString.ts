export default function isoToLocaleString(dateString: string): string {
    return new Date(dateString).toUTCString();
}
