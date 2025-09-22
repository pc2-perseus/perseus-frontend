# PERSEUS frontend

PERSEUS is a compute project management software for scientific HPC centers. It allows you to
* professionalize your workflows
* deploy center-wide automation
* fully customize workflow items (states), (micro)services and reports

To learn more about PERSEUS, please visit the following:
* [PERSEUS main repository](https://github.com/pc2-perseus/perseus)
* [Documentation](https://perseus-project.pc2.uni-paderborn.de/docs/)
* [Live demo](https://perseus-project.pc2.uni-paderborn.de/preview/)

## Development
For the development of PERSEUS frontend you need a running instance of the PERSEUS core. To avoid CORS issues, you need to run the core on the same domain as the frontend. The easiest way to do this is to use Vite as a proxy.

You can add a file `vite.proxy.local.ts` to configure the proxy. It is automatically loaded if it exists.
The content of the file can look like this:

```ts
import type { ProxyOptions } from "vite";

export const proxy: Record<string, string | ProxyOptions> = {
    "/api": {
        target: "http://perseus.localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
    },
};
```

Replace `perseus.localhost` with the domain of your PERSEUS core instance.

## License

This project is licensed under the terms of the **MIT License**.
See the [LICENSE](./LICENSE) file for details.