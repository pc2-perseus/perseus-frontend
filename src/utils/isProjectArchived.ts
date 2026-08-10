import Project from "../interfaces/Project.ts";

export default function isProjectArchived(project: Project): boolean {
    return (
        project.state_machine.current_states.length === 1 &&
        project.state_machine.current_states[0] === "Archive"
    );
}
