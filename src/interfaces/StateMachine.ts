import Event from "./Event.ts";

export default interface StateMachine {
    current_states: string[];
    events: Event[];
    graph: string;
}
