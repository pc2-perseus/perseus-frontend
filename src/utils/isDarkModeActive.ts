export default function isDarkModeActive(): boolean | null {
    if (localStorage.getItem("perseus.isDarkMode") === null) {
        return null;
    } else {
        return localStorage.getItem("perseus.isDarkMode") === "y";
    }
}

export function setDarkMode(active: boolean): void {
    localStorage.setItem("perseus.isDarkMode", active ? "y" : "n");
}
