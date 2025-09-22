import Project from "../interfaces/Project.ts";
import _ from "lodash";
import arrayEquals from "./arrayEquals.ts";
import ScientificField from "../interfaces/ScientificField.ts";
import Person from "../interfaces/Person.ts";
import Publication from "../interfaces/Publication.ts";
import DataDeletionPeriod from "../interfaces/DataDeletionPeriod.ts";
import ResourceValue from "../interfaces/ResourceValue.ts";
import LimitValue from "../interfaces/LimitValue.ts";

function f(
    o:
        | boolean
        | string
        | number
        | null
        | undefined
        | (boolean | string | number | null | undefined)[],
    n:
        | boolean
        | string
        | number
        | null
        | undefined
        | (boolean | string | number | null | undefined)[]
): string {
    return `from ${JSON.stringify(o === undefined ? null : o)} to ${JSON.stringify(n === undefined ? null : n)}`;
}

function resourceValuesDiff(
    oldResourceValues: ResourceValue[],
    newResourceValues: ResourceValue[]
): string[] {
    const diff: string[] = [];

    const copyOldResourceValues: ResourceValue[] = [...oldResourceValues];

    newResourceValues.forEach((rv: ResourceValue) => {
        let found: number | null = null;
        copyOldResourceValues.forEach((old: ResourceValue, index: number) => {
            if (_.isEqual(old, rv)) {
                found = index;
            }
        });
        if (found !== null) {
            copyOldResourceValues.splice(found, 1);
            return;
        }
        copyOldResourceValues.forEach((old: ResourceValue, index: number) => {
            if (
                old.resource_id === rv.resource_id &&
                old.start === rv.start &&
                old.end === rv.end
            ) {
                found = index;

                const simple: {
                    name: string;
                    oldValue: boolean | string | number | null | undefined;
                    newValue: boolean | string | number | null | undefined;
                }[] = [
                    { name: "Value", oldValue: old.value, newValue: rv.value },
                    {
                        name: "Compute project",
                        oldValue: old.compute_project_id,
                        newValue: rv.compute_project_id,
                    },
                    {
                        name: "Priority",
                        oldValue: old.priority,
                        newValue: rv.priority,
                    },
                    {
                        name: "Blocked",
                        oldValue: old.blocked,
                        newValue: rv.blocked,
                    },
                ];

                simple.forEach(
                    (entry: {
                        name: string;
                        oldValue: boolean | string | number | null | undefined;
                        newValue: boolean | string | number | null | undefined;
                    }) => {
                        if (entry.oldValue !== entry.newValue) {
                            diff.push(
                                `${entry.name} of ${rv.resource_id} (${rv.start} - ${rv.end}): ${f(entry.oldValue, entry.newValue)}`
                            );
                        }
                    }
                );

                if (!arrayEquals(old.partitions, rv.partitions)) {
                    diff.push(
                        `Partitions of ${rv.resource_id} (${rv.start} - ${rv.end}): ${f(old.partitions, rv.partitions)}`
                    );
                }

                // TODO: Missing overwrites
            }
        });
        if (found !== null) {
            copyOldResourceValues.splice(found, 1);
            return;
        }
        diff.push(
            `Added new resource ${rv.resource_id} (${rv.start} - ${rv.end}) with ${rv.partitions.length === 0 ? "" : `partitions ${rv.partitions.join(", ")} and `} value ${rv.value}`
        );
    });

    copyOldResourceValues.forEach((old: ResourceValue) => {
        diff.push(
            `Removed resource ${old.resource_id} (${old.start} - ${old.end})`
        );
    });

    return diff;
}

function limitValuesDiff(
    oldLimitValues: LimitValue[],
    newLimitValues: LimitValue[]
): string[] {
    const diff: string[] = [];

    const copyOldLimitValues: LimitValue[] = [...oldLimitValues];

    newLimitValues.forEach((lv: LimitValue) => {
        let found: number | null = null;
        copyOldLimitValues.forEach((old: LimitValue, index: number) => {
            if (_.isEqual(old, lv)) {
                found = index;
            }
        });
        if (found !== null) {
            copyOldLimitValues.splice(found, 1);
            return;
        }
        copyOldLimitValues.forEach((old: LimitValue, index: number) => {
            if (
                old.limit_id === lv.limit_id &&
                old.start === lv.start &&
                old.end === lv.end
            ) {
                found = index;

                const simple: {
                    name: string;
                    oldValue: boolean | string | number | null | undefined;
                    newValue: boolean | string | number | null | undefined;
                }[] = [
                    { name: "Value", oldValue: old.value, newValue: lv.value },
                    {
                        name: "Compute project",
                        oldValue: old.compute_project_id,
                        newValue: lv.compute_project_id,
                    },
                ];

                simple.forEach(
                    (entry: {
                        name: string;
                        oldValue: boolean | string | number | null | undefined;
                        newValue: boolean | string | number | null | undefined;
                    }) => {
                        if (entry.oldValue !== entry.newValue) {
                            diff.push(
                                `${entry.name} of ${lv.limit_id} (${lv.start} - ${lv.end}): ${f(entry.oldValue, entry.newValue)}`
                            );
                        }
                    }
                );

                if (
                    !arrayEquals(
                        old.affected_users === null ? [] : old.affected_users,
                        lv.affected_users === null ? [] : lv.affected_users
                    )
                ) {
                    diff.push(
                        `Affected users of ${lv.limit_id} (${lv.start} - ${lv.end}): ${f(old.affected_users, lv.affected_users)}`
                    );
                }

                // TODO: Missing overwrites
            }
        });
        if (found !== null) {
            copyOldLimitValues.splice(found, 1);
            return;
        }
        diff.push(
            `Added new resource ${lv.limit_id} (${lv.start} - ${lv.end}) with value ${lv.value}`
        );
    });

    copyOldLimitValues.forEach((old: LimitValue) => {
        diff.push(
            `Removed resource ${old.limit_id} (${old.start} - ${old.end})`
        );
    });

    return diff;
}

export default function projectDiff(
    oldProject: Project,
    newProject: Project
): string[] {
    const diff: string[] = [];

    const simple: {
        name: string;
        oldValue: boolean | string | number | null | undefined;
        newValue: boolean | string | number | null | undefined;
    }[] = [
        {
            name: "PERSEUS OID",
            oldValue: oldProject._id,
            newValue: newProject._id,
        },
        {
            name: "Abbreviation",
            oldValue: oldProject.abbreviation,
            newValue: newProject.abbreviation,
        },
        {
            name: "Title",
            oldValue: oldProject.title,
            newValue: newProject.title,
        },
        {
            name: "Description",
            oldValue: oldProject.description,
            newValue: newProject.description,
        },
        {
            name: "Type",
            oldValue: oldProject.project_type,
            newValue: newProject.project_type,
        },
        {
            name: "Call",
            oldValue: oldProject.call,
            newValue: newProject.call,
        },
        {
            name: "Source",
            oldValue: oldProject.source?.name,
            newValue: newProject.source?.name,
        },
        {
            name: "Source ID",
            oldValue: oldProject.source?.foreign_id,
            newValue: newProject.source?.foreign_id,
        },
        {
            name: "Predecessor OID",
            oldValue: oldProject.source?.predecessor_id,
            newValue: newProject.source?.predecessor_id,
        },
        {
            name: "Affiliation OID",
            oldValue: oldProject.affiliation_id,
            newValue: newProject.affiliation_id,
        },
        {
            name: "Principal Investigator OID",
            oldValue: oldProject.principal_investigator_id,
            newValue: newProject.principal_investigator_id,
        },
        {
            name: "Person of Contact OID",
            oldValue: oldProject.person_of_contact_id,
            newValue: newProject.person_of_contact_id,
        },
        {
            name: "Start",
            oldValue: oldProject.start,
            newValue: newProject.start,
        },
        {
            name: "End",
            oldValue: oldProject.end,
            newValue: newProject.end,
        },
        {
            name: "Active",
            oldValue: oldProject.is_active,
            newValue: newProject.is_active,
        },
    ];

    simple.forEach(
        (entry: {
            name: string;
            oldValue: boolean | string | number | null | undefined;
            newValue: boolean | string | number | null | undefined;
        }) => {
            if (entry.oldValue !== entry.newValue) {
                diff.push(
                    `${entry.name}: ${f(entry.oldValue, entry.newValue)}`
                );
            }
        }
    );

    const complex: {
        name: string;
        oldValue: unknown[];
        newValue: unknown[];
        repr: (item: unknown) => string;
    }[] = [
        {
            name: "Members",
            oldValue: oldProject.member_ids,
            newValue: newProject.member_ids,
            repr: (item) =>
                ((item as Person).title === null
                    ? ""
                    : (item as Person).title + " ") +
                (item as Person).firstname +
                " " +
                (item as Person).lastname,
        },
        {
            name: "Scientific fields",
            oldValue: oldProject.scientific_fields,
            newValue: newProject.scientific_fields,
            repr: (item) =>
                (item as ScientificField).version +
                "/" +
                (item as ScientificField).subject_id,
        },
        {
            name: "Publications",
            oldValue: oldProject.publications,
            newValue: newProject.publications,
            repr: (item) => (item as Publication).content,
        },
        {
            name: "Data deletion periods",
            oldValue: oldProject.data_deletion_periods,
            newValue: newProject.data_deletion_periods,
            repr: (item) =>
                (item as DataDeletionPeriod).state_id +
                "/" +
                (item as DataDeletionPeriod).key,
        },
        {
            name: "States",
            oldValue: oldProject.state_machine.current_states,
            newValue: newProject.state_machine.current_states,
            repr: (item) => item as string,
        },
    ];

    complex.forEach(
        (entry: {
            name: string;
            oldValue: unknown[];
            newValue: unknown[];
            repr: (item: unknown) => string;
        }) => {
            if (!arrayEquals(entry.oldValue, entry.newValue)) {
                diff.push(
                    `${entry.name}: ${f(
                        entry.oldValue.map((item) => entry.repr(item)),
                        entry.newValue.map((item) => entry.repr(item))
                    )}`
                );
            }
        }
    );

    const requestedResourceDiff: string[] = resourceValuesDiff(
        oldProject.requested_resources,
        newProject.requested_resources
    );
    if (requestedResourceDiff.length > 0) {
        diff.push("Changes regarding requested resources:");
        diff.push(...requestedResourceDiff);
    }

    const grantedResourceDiff: string[] = resourceValuesDiff(
        oldProject.granted_resources,
        newProject.granted_resources
    );
    if (grantedResourceDiff.length > 0) {
        diff.push("Changes regarding granted resources:");
        diff.push(...grantedResourceDiff);
    }

    const requestedLimitDiff: string[] = limitValuesDiff(
        oldProject.requested_limits,
        newProject.requested_limits
    );
    if (requestedLimitDiff.length > 0) {
        diff.push("Changes regarding requested limits:");
        diff.push(...requestedLimitDiff);
    }

    const grantedLimitDiff: string[] = limitValuesDiff(
        oldProject.granted_limits,
        newProject.granted_limits
    );
    if (grantedLimitDiff.length > 0) {
        diff.push("Changes regarding granted limits:");
        diff.push(...grantedLimitDiff);
    }

    _.keys(newProject.files).forEach((file: string) => {
        if (file in oldProject.files) {
            if (newProject.files[file] !== oldProject.files[file]) {
                diff.push(
                    `File ${file}: ${f(oldProject.files[file], newProject.files[file])}`
                );
            }
        } else {
            diff.push(`New file: ${file}`);
        }
    });
    _.keys(oldProject.files).forEach((file: string) => {
        if (!(file in newProject.files)) {
            diff.push(`Removed file: ${file}`);
        }
    });

    _.keys(newProject.file_tags).forEach((file: string) => {
        if (file in oldProject.file_tags) {
            if (
                !arrayEquals(
                    oldProject.file_tags[file],
                    newProject.file_tags[file]
                )
            ) {
                diff.push(
                    `File tags ${file}: ${f(oldProject.file_tags[file], newProject.file_tags[file])}`
                );
            }
        } else {
            diff.push(
                `New file tags: ${file} (${JSON.stringify(newProject.file_tags[file])})`
            );
        }
    });
    _.keys(oldProject.file_tags).forEach((file: string) => {
        if (!(file in newProject.file_tags)) {
            diff.push(`Removed file tags: ${file}`);
        }
    });

    return diff;
}
