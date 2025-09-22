// Custom imports
import makeAPICall from "./makeAPICall.ts";
import HTTPMethod from "./HTTPMethod.ts";
import APIResponse from "./APIResponse.ts";

export default async function postPublication(
    project_oid: string,
    publication: {
        type: "bibtex" | "doi";
        content: string;
    }
): Promise<boolean> {
    const call: APIResponse<{ result: boolean }> = await makeAPICall<{
        result: boolean;
    }>(HTTPMethod.POST, "/service/Publications/add", {
        project_oid: project_oid,
        ptype: publication.type,
        content: publication.content,
    });

    return call.statusCode === 200 && call.value !== null
        ? call.value.result
        : false;
}
