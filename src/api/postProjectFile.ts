import CONFIG from "../config.ts";
import HTTPMethod from "./HTTPMethod.ts";

export default async function postProjectFile(
    file: File,
    project_id: string,
    tags?: string[]
): Promise<boolean> {
    const bodyData = new FormData();
    bodyData.append("file", file);
    const call: globalThis.Response = await fetch(
        CONFIG.CORE_URL +
            "/file/project/" +
            project_id +
            (tags === undefined ? "" : "?tags=" + tags.join(",")),
        {
            method: HTTPMethod.POST,
            body: bodyData,
            credentials: "include",
        }
    );
    const response: { response: boolean } = await call.json();
    return call.status == 200 && response.response;
}
