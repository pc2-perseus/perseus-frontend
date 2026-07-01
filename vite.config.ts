import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

async function loadLocalProxy() {
    try {
        const { proxy } = await import("./vite.proxy.local");
        return proxy;
    } catch {
        return undefined;
    }
}

export default defineConfig(async () => {
    const proxy = await loadLocalProxy();
    const base = process.env.BASE_PATH ?? "/";

    return {
        base,
        plugins: [react()],
        server: {
            allowedHosts: ["perseus.localhost", "localhost"],
            port: 5173,
            proxy,
        },
    };
});
