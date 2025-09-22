import DatabaseItem from "./DatabaseItem.ts";
import StateMachine from "./StateMachine.ts";

export default interface StoredStateMachine extends DatabaseItem {
    state_machine_id: string;
    state_machine: StateMachine;
}
