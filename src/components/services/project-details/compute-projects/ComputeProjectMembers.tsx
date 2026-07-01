// React imports
import React from "react";

// MUI imports
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fab,
    Fade,
    FormControl,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Theme,
    useTheme,
} from "@mui/material";

// Icon imports
import CloseIcon from "@mui/icons-material/Close";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";

// Custom imports
import getPersonDetails from "../../../../api/person-search/getPersonDetails.ts";
import Person from "../../../../interfaces/Person.ts";
import personFullName from "../../../../utils/personFullName.ts";
import getUsageSeries from "../../../../api/project-details/getUsageSeries.ts";
import ResourceUsage from "../../../../interfaces/ResourceUsage.ts";
import Resource from "../../../../interfaces/Resource.ts";
import formatNumber from "../../../../utils/formatNumber.ts";
import Cluster from "../../../../interfaces/Cluster.ts";
import ResourceValue from "../../../../interfaces/ResourceValue.ts";
import sortResourceValues from "../../../../utils/sortResourceValues.ts";
import clusterMatch from "../../../../utils/clusterMatch.ts";
import resourceMatch from "../../../../utils/resourceMatch.ts";

// Other imports
import _ from "lodash";
import removeComputeProjectMember from "../../../../api/compute-projects/removeComputeProjectMember.ts";
import ComputeProjectAddMemberDialog from "./ComputeProjectAddMemberDialog.tsx";
import addComputeProjectMember from "../../../../api/compute-projects/addComputeProjectMember.ts";
import checkServicePermission from "../../../../api/checkServicePermission.ts";
import getProject from "../../../../api/project-details/getProject.ts";
import Project from "../../../../interfaces/Project.ts";
import ComputeProject from "../../../../interfaces/ComputeProject.ts";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function ComputeProjectMembers({
    projectId,
    computeProjectId,
    clusters,
    resources,
    grantedResources,
    onClose,
}: {
    projectId: string;
    computeProjectId: string;
    clusters: Cluster[];
    resources: Resource[];
    grantedResources: ResourceValue[];
    onClose: () => void;
}): React.ReactElement {
    const [checkEdit, setCheckEdit] = React.useState<boolean>(false);
    const [members, setMembers] = React.useState<Person[] | null | undefined>(
        null
    );
    const [usageData, setUsageData] = React.useState<ResourceUsage[] | null>(
        null
    );
    const [columnSelection, setColumnSelection] =
        React.useState<string>("$last-active");
    const [dataColumnValues, setDataColumnValues] = React.useState<{
        [key: string]: { [key: string]: number | null };
    }>({});
    const [sorting, setSorting] = React.useState<{
        column: string;
        direction: "ASC" | "DESC";
    }>({ column: "lastname", direction: "ASC" });
    const [memberToRemove, setMemberToRemove] = React.useState<Person | null>(
        null
    );
    const [addMemberOpen, setAddMemberOpen] = React.useState<boolean>(false);

    const [showScrollButton, setShowScrollButton] =
        React.useState<boolean>(false);
    const scrollRef = React.useRef<HTMLDivElement | null>(null);

    const theme: Theme = useTheme();
    const resourceOptions: { resource: Resource; cluster: Cluster }[] = [];

    Array.from(
        new Map(
            sortResourceValues(grantedResources, resources, clusters).map(
                (rv) => [rv.resource_id, rv]
            )
        ).values()
    ).forEach((rv: ResourceValue) => {
        const resource: Resource | undefined = resourceMatch(rv, resources);
        const cluster: Cluster | undefined = clusterMatch(
            rv,
            resources,
            clusters
        );
        if (resource !== undefined && cluster !== undefined) {
            resourceOptions.push({
                resource: resource,
                cluster: cluster,
            });
        }
    });

    function userLastActive(username: string | null): string {
        if (
            username === null ||
            !(username in dataColumnValues) ||
            dataColumnValues[username]["$last-active"] === null
        ) {
            return "N/A";
        }

        const lastActive: Date = new Date(
            dataColumnValues[username]["$last-active"]
        );

        const todayMidnight = new Date();
        todayMidnight.setHours(0, 0, 0, 0);

        if (todayMidnight < lastActive) {
            return "today";
        }

        const dayMilliseconds: number = 24 * 60 * 60 * 1000;

        if (new Date(todayMidnight.getTime() - dayMilliseconds) < lastActive) {
            return "yesterday";
        }

        if (
            new Date(todayMidnight.getTime() - 7 * dayMilliseconds) < lastActive
        ) {
            return "last 7 days";
        }

        if (
            new Date(todayMidnight.getTime() - 30 * dayMilliseconds) <
            lastActive
        ) {
            return "last 30 days";
        }

        return "more than 30 days ago";
    }

    function userResourceUsage(
        username: string | null,
        resource_id: string
    ): React.ReactElement {
        if (
            username === null ||
            dataColumnValues[username][resource_id] === null
        ) {
            return <i>N/A</i>;
        }

        const resource: Resource | undefined = resourceMatch(
            { resource_id: resource_id },
            resources
        );

        if (resource === undefined) {
            return <>{formatNumber(dataColumnValues[username][resource_id])}</>;
        }

        return (
            <>
                {formatNumber(
                    dataColumnValues[username][resource_id] /
                        resource.display_unit_factor
                )}
                {resource.display_unit !== null && ` ${resource.display_unit}`}
            </>
        );
    }

    function sortMembers(member1: Person, member2: Person): number {
        const factor: number = sorting.direction === "ASC" ? 1 : -1;
        if (sorting.column === "username") {
            if (member1.username === null && member2.username === null) {
                return (
                    factor * member1.lastname.localeCompare(member2.lastname)
                );
            }
            if (member1.username === null) {
                return factor;
            }
            if (member2.username === null) {
                return factor * -1;
            }
            return member1.username.localeCompare(member2.username);
        }
        if (sorting.column === "lastname") {
            return factor * member1.lastname.localeCompare(member2.lastname);
        }
        if (sorting.column === "data") {
            if (member1.username === null && member2.username === null) {
                return (
                    factor * member1.lastname.localeCompare(member2.lastname)
                );
            }
            if (
                member1.username === null ||
                !(member1.username in dataColumnValues)
            ) {
                return factor * -1;
            }
            if (
                member2.username === null ||
                !(member2.username in dataColumnValues)
            ) {
                return factor;
            }
            return (
                factor *
                (Number(dataColumnValues[member1.username][columnSelection]) -
                    Number(dataColumnValues[member2.username][columnSelection]))
            );
        }
        return 0;
    }

    function selectSorting(column: string) {
        if (column === sorting.column) {
            setSorting({
                column: column,
                direction: sorting.direction === "ASC" ? "DESC" : "ASC",
            });
            return;
        }
        setSorting({
            column: column,
            direction: column === "data" ? "DESC" : "ASC",
        });
    }

    function addMembers(persons: Person[]) {
        const toAdd: Promise<boolean>[] = persons.map((person: Person) =>
            addComputeProjectMember(
                person._id === null ? "" : person._id,
                computeProjectId,
                projectId
            )
        );
        Promise.all(toAdd).then((results: boolean[]) => {
            if (results.every((r) => r)) {
                if (members === null || members === undefined) {
                    setMembers([...persons]);
                } else {
                    setMembers([...members, ...persons]);
                }

                setAddMemberOpen(false);
            }
        });
    }

    function removeMember() {
        if (memberToRemove !== null && memberToRemove._id !== null) {
            removeComputeProjectMember(
                memberToRemove._id,
                computeProjectId,
                projectId
            ).then((result: boolean) => {
                if (result) {
                    setMembers(
                        members?.filter(
                            (member: Person) =>
                                member._id !== memberToRemove._id
                        )
                    );

                    setMemberToRemove(null);
                }
            });
        }
    }

    const checkScrollState = () => {
        const el = scrollRef.current;
        if (!el) return;

        const canScroll = el.scrollHeight > el.clientHeight;
        const isAtBottom =
            el.scrollHeight - el.scrollTop <= el.clientHeight + 10;

        setShowScrollButton(canScroll && !isAtBottom);
    };

    function scrollToBottom() {
        const el = scrollRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }

    React.useEffect(() => {
        if (members !== null && members !== undefined) {
            const newValues: {
                [key: string]: { [key: string]: number | null };
            } = {};
            members.forEach((member: Person) => {
                if (member.username === null) {
                    return;
                }
                if (!(member.username in newValues)) {
                    newValues[member.username] = {};
                }

                if (usageData === null) {
                    newValues[member.username]["$last-active"] = null;
                    return;
                }
                const userUsage: ResourceUsage[] = usageData.filter(
                    (usage: ResourceUsage) => usage.user === member.username
                );

                if (userUsage.length === 0) {
                    newValues[member.username]["$last-active"] = null;
                    return;
                }

                newValues[member.username]["$last-active"] = new Date(
                    userUsage.sort(
                        (usage1, usage2) =>
                            new Date(usage1.start).valueOf() -
                            new Date(usage2.start).valueOf()
                    )[0].start
                ).valueOf();
            });
            members.forEach((member: Person) => {
                resourceOptions.forEach((item) => {
                    if (member.username === null) {
                        return;
                    }
                    if (!(member.username in newValues)) {
                        newValues[member.username] = {};
                    }
                    if (usageData === null) {
                        newValues[member.username][item.resource.id] = null;
                        return;
                    }
                    const anyUserUsage: ResourceUsage[] = usageData.filter(
                        (usage: ResourceUsage) =>
                            usage.resource_id === item.resource.id &&
                            usage.user !== null
                    );

                    if (anyUserUsage.length === 0) {
                        newValues[member.username][item.resource.id] = null;
                        return;
                    }

                    const userUsage: number[] = anyUserUsage
                        .filter(
                            (usage: ResourceUsage) =>
                                usage.user === member.username
                        )
                        .map(
                            (usage: ResourceUsage) =>
                                usage.value * usage.contingent_factor
                        );

                    if (userUsage.length === 0) {
                        newValues[member.username][item.resource.id] = 0;
                    }

                    newValues[member.username][item.resource.id] =
                        _.sum(userUsage);
                });
            });
            setDataColumnValues(newValues);
        }
    }, [members, usageData]);

    React.useEffect(() => {
        checkScrollState();
        const el = scrollRef.current;
        if (!el) return;

        el.addEventListener("scroll", checkScrollState);
        const resizeObserver = new ResizeObserver(checkScrollState);
        resizeObserver.observe(el);

        return () => {
            el.removeEventListener("scroll", checkScrollState);
            resizeObserver.disconnect();
        };
    }, []);

    React.useEffect(() => {
        getProject(projectId).then((project: Project | null) => {
            if (project !== null) {
                if (
                    project.compute_projects.filter(
                        (cp: ComputeProject) =>
                            cp.compute_project_id === computeProjectId
                    ).length === 1
                ) {
                    const toFetch: Promise<Person | null>[] =
                        project.compute_projects
                            .filter(
                                (cp: ComputeProject) =>
                                    cp.compute_project_id === computeProjectId
                            )[0]
                            .member_ids.map((memberId: string) =>
                                getPersonDetails(memberId)
                            );
                    Promise.all(toFetch)
                        .then((data: (Person | null)[]) => {
                            setMembers(
                                data.filter(
                                    (person: Person | null) => person !== null
                                )
                            );
                        })
                        .finally(checkScrollState);
                }
            }
        });
    }, []);

    React.useEffect(() => {
        checkServicePermission("ProjectMembers").then((result: boolean) =>
            setCheckEdit(result)
        );
        getUsageSeries(projectId, computeProjectId).then(
            (used: ResourceUsage[] | null) => {
                setUsageData(used);
            }
        );
    }, []);

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                position: "relative",
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                    overflowY: "scroll",
                    scrollbarWidth: "none",
                }}
                ref={scrollRef}
            >
                <Box sx={{ pt: "1.5em" }}>
                    <Button
                        size="small"
                        sx={{
                            minWidth: "2.25em",
                            maxWidth: "2.25em",
                            cursor: "pointer",
                            position: "absolute",
                            ml: "0.5em",
                            mt: "-1.5em",
                            zIndex: 10,
                        }}
                        onClick={onClose}
                    >
                        <CloseIcon fontSize="small" />
                    </Button>

                    <TableContainer>
                        <Table sx={{ width: "100%" }} size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            verticalAlign: "bottom",
                                        }}
                                    >
                                        <ArrowDownwardIcon
                                            sx={{
                                                fontSize: "1em",
                                                verticalAlign: "text-top",
                                                mr: "3px",
                                                cursor: "pointer",
                                                color:
                                                    sorting.column ===
                                                    "lastname"
                                                        ? theme.palette.primary
                                                              .main
                                                        : theme.palette.text
                                                              .disabled,
                                                transform:
                                                    sorting.column ===
                                                        "lastname" &&
                                                    sorting.direction === "DESC"
                                                        ? "rotate(180deg)"
                                                        : undefined,
                                                "&:hover": {
                                                    color: theme.palette.text
                                                        .primary,
                                                },
                                            }}
                                            onClick={() =>
                                                selectSorting("lastname")
                                            }
                                        />
                                        Full name
                                    </TableCell>
                                    <TableCell sx={{ verticalAlign: "bottom" }}>
                                        <ArrowDownwardIcon
                                            sx={{
                                                fontSize: "1em",
                                                verticalAlign: "text-top",
                                                mr: "3px",
                                                cursor: "pointer",
                                                color:
                                                    sorting.column ===
                                                    "username"
                                                        ? theme.palette.primary
                                                              .main
                                                        : theme.palette.text
                                                              .disabled,
                                                transform:
                                                    sorting.column ===
                                                        "username" &&
                                                    sorting.direction === "DESC"
                                                        ? "rotate(180deg)"
                                                        : undefined,
                                                "&:hover": {
                                                    color: theme.palette.text
                                                        .primary,
                                                },
                                            }}
                                            onClick={() =>
                                                selectSorting("username")
                                            }
                                        />
                                        Username
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex" }}>
                                            <ArrowDownwardIcon
                                                sx={{
                                                    fontSize: "1em",
                                                    mr: "6px",
                                                    verticalAlign: "bottom",
                                                    alignSelf: "center",
                                                    mt: "0.7em",
                                                    cursor: "pointer",
                                                    color:
                                                        sorting.column ===
                                                        "data"
                                                            ? theme.palette
                                                                  .primary.main
                                                            : theme.palette.text
                                                                  .disabled,
                                                    transform:
                                                        sorting.column ===
                                                            "data" &&
                                                        sorting.direction ===
                                                            "ASC"
                                                            ? undefined
                                                            : "rotate(180deg)",
                                                    "&:hover": {
                                                        color: theme.palette
                                                            .text.primary,
                                                    },
                                                }}
                                                onClick={() =>
                                                    selectSorting("data")
                                                }
                                            />

                                            <FormControl
                                                size="small"
                                                sx={{
                                                    mr: 1,
                                                    mt: 1,
                                                    flexGrow: 1,
                                                    "& .MuiInputBase-root": {
                                                        fontSize: "0.8rem",
                                                        height: "28px",
                                                    },
                                                    "& .MuiSelect-select": {
                                                        padding: "2px 8px",
                                                    },
                                                }}
                                            >
                                                <Select
                                                    variant="outlined"
                                                    value={columnSelection}
                                                    onChange={(e) =>
                                                        setColumnSelection(
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <MenuItem
                                                        value="$last-active"
                                                        sx={{
                                                            fontSize: "0.8rem",
                                                            minHeight: "24px",
                                                            padding: "2px 8px",
                                                        }}
                                                    >
                                                        last usage
                                                    </MenuItem>
                                                    {resourceOptions.map(
                                                        (item) => (
                                                            <MenuItem
                                                                key={
                                                                    item
                                                                        .resource
                                                                        .id
                                                                }
                                                                value={
                                                                    item
                                                                        .resource
                                                                        .id
                                                                }
                                                                sx={{
                                                                    fontSize:
                                                                        "0.8rem",
                                                                    minHeight:
                                                                        "24px",
                                                                    padding:
                                                                        "2px 8px",
                                                                }}
                                                            >
                                                                {
                                                                    item.cluster
                                                                        .name
                                                                }{" "}
                                                                -{" "}
                                                                {
                                                                    item
                                                                        .resource
                                                                        .name
                                                                }
                                                            </MenuItem>
                                                        )
                                                    )}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    </TableCell>
                                    {checkEdit && <TableCell />}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {members === undefined ||
                                members === null ||
                                members.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            sx={{ textAlign: "center" }}
                                        >
                                            {members === undefined ||
                                            members?.length === 0 ? (
                                                <i>no users available</i>
                                            ) : (
                                                <CircularProgress
                                                    color="primary"
                                                    size="2em"
                                                />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <>
                                        {members
                                            .sort(sortMembers)
                                            .map((person: Person) => (
                                                <TableRow key={person._id}>
                                                    <TableCell>
                                                        {personFullName(person)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {person.username ===
                                                        null ? (
                                                            <i>unknown</i>
                                                        ) : (
                                                            person.username
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {columnSelection ===
                                                        "$last-active" ? (
                                                            <>
                                                                {person.username ===
                                                                null ? (
                                                                    <i>N/A</i>
                                                                ) : (
                                                                    userLastActive(
                                                                        person.username
                                                                    )
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                {userResourceUsage(
                                                                    person.username,
                                                                    columnSelection
                                                                )}
                                                            </>
                                                        )}
                                                    </TableCell>
                                                    {checkEdit && (
                                                        <TableCell>
                                                            <Button
                                                                color="error"
                                                                sx={{
                                                                    px: "3px",
                                                                    minWidth:
                                                                        "auto",
                                                                    maxWidth:
                                                                        "auto",
                                                                }}
                                                                onClick={() =>
                                                                    setMemberToRemove(
                                                                        person
                                                                    )
                                                                }
                                                            >
                                                                <PersonRemoveIcon fontSize="small" />
                                                            </Button>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))}
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {checkEdit && (
                        <>
                            <Button
                                variant="contained"
                                size="small"
                                sx={{
                                    float: "right",
                                    mx: "7px",
                                    mt: "7px",
                                }}
                                onClick={() => setAddMemberOpen(true)}
                            >
                                Add members
                            </Button>
                            <Box
                                sx={{
                                    float: "right",
                                    height: "7px",
                                    width: "100%",
                                }}
                            />
                        </>
                    )}
                    <ComputeProjectAddMemberDialog
                        open={addMemberOpen}
                        onClose={() => {
                            setAddMemberOpen(false);
                        }}
                        computeProjectId={computeProjectId}
                        addMembers={addMembers}
                    />
                    <Dialog
                        open={memberToRemove !== null}
                        onClose={() => setMemberToRemove(null)}
                    >
                        <DialogTitle>
                            Remove member from compute project
                        </DialogTitle>
                        <DialogContent>
                            Are you sure you want to remove{" "}
                            {memberToRemove !== null
                                ? personFullName(memberToRemove)
                                : ""}{" "}
                            from the compute project {computeProjectId}?
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setMemberToRemove(null)}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={removeMember}
                            >
                                Remove
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Box>
            <Fade in={showScrollButton}>
                <Fab
                    size="small"
                    color="primary"
                    onClick={scrollToBottom}
                    sx={{
                        position: "absolute",
                        bottom: "10px",
                        right: "10px",
                        boxShadow: 3,
                        color: "inherit",
                        backgroundColor:
                            theme.palette.mode === "dark"
                                ? theme.palette.grey[500]
                                : theme.palette.grey[300],
                    }}
                >
                    <KeyboardArrowDownIcon />
                </Fab>
            </Fade>
        </Box>
    );
}
