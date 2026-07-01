import DatabaseItem from "./DatabaseItem.ts";
import Source from "./Source.ts";
import ScientificField from "./ScientificField.ts";
import ResourceValue from "./ResourceValue.ts";
import LimitValue from "./LimitValue.ts";
import ComputeProject from "./ComputeProject.ts";
import Publication from "./Publication.ts";
import DataDeletionPeriod from "./DataDeletionPeriod.ts";
import StateMachine from "./StateMachine.ts";

export default interface Project extends DatabaseItem {
    abbreviation: string | null;
    title: string | null;
    description: string | null;
    project_type: string | null;
    call: string | null;
    source: Source | null;
    affiliation_id: string | null;
    principal_investigator_id: string | null;
    person_of_contact_id: string | null;
    member_ids: string[];
    scientific_fields: ScientificField[];
    start: string | null;
    end: string | null;
    requested_resources: ResourceValue[];
    granted_resources: ResourceValue[];
    requested_limits: LimitValue[];
    granted_limits: LimitValue[];
    compute_projects: ComputeProject[];
    publications: Publication[];
    data_deletion_periods: DataDeletionPeriod[];
    state_machine: StateMachine;
    custom_fields: { [key: string]: unknown };
    is_active: boolean;
}
