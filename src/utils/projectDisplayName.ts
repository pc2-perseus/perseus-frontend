import Project from "../interfaces/Project.ts";

export default function projectDisplayName(
    project: Project,
    fallback: string = ""
): string {
    return project.abbreviation ?? project.title ?? fallback;
}
