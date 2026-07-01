export default function isDrawerCollapsed(): boolean {
    return localStorage.getItem("perseus.isDrawerCollapsed") === "y";
}

export function setDrawerCollapsed(collapsed: boolean): void {
    localStorage.setItem("perseus.isDrawerCollapsed", collapsed ? "y" : "n");
}
