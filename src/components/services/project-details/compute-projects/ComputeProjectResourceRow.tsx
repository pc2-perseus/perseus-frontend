// React imports
import React from "react";

// MUI imports
import {
    Box,
    Button,
    Card,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    LinearProgress,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Theme,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

// Icon imports
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import ErrorIcon from "@mui/icons-material/Error";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import EditIcon from "@mui/icons-material/Edit";
import StopCircleIcon from "@mui/icons-material/StopCircle";

// Other imports
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import updateLocale from "dayjs/plugin/updateLocale";
import "dayjs/locale/de";

// Custom imports
import ResourceValue from "../../../../interfaces/ResourceValue.ts";
import Cluster from "../../../../interfaces/Cluster.ts";
import Resource from "../../../../interfaces/Resource.ts";
import formatNumber from "../../../../utils/formatNumber.ts";
import ResourceValueOverwrite from "../../../../interfaces/ResourceValueOverwrite.ts";
import resourceValueOverwriteName from "../../../../utils/resourceValueOverwriteName.ts";
import timeLeftUntil from "../../../../utils/timeLeftUntil.ts";
import isValueNumeric from "../../../../utils/isValueNumeric.ts";
import {
    scaledDecimalInputToNumber,
    scaledValueToDecimalString,
} from "../../../../utils/decimalUnits.ts";
import LoadingBar from "../../../LoadingBar.tsx";
import ResourcePriority from "../../../../interfaces/ResourcePriority.ts";

dayjs.extend(utc);
dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
    weekStart: 1,
});

export default function ComputeProjectResourceRow({
    resource,
    cluster,
    priorities,
    grantedResourceValue,
    used,
    maxUsed,
    isLast,
    onResourceBlock,
    onResourceUnblock,
    onResourceOverwriteAdd,
    onResourceOverwriteEdit,
    showOverrideActions,
}: {
    resource: Resource | undefined;
    cluster: Cluster | undefined;
    priorities: ResourcePriority[];
    grantedResourceValue: ResourceValue;
    used: number | null | undefined;
    maxUsed: number | null | undefined;
    isLast: boolean;
    onResourceBlock: (resourceValue: ResourceValue) => void;
    onResourceUnblock: (resourceValue: ResourceValue) => void;
    onResourceOverwriteAdd: (
        resourceValue: ResourceValue,
        overwrite: ResourceValueOverwrite
    ) => void;
    onResourceOverwriteEdit: (
        resourceValue: ResourceValue,
        overwrite: ResourceValueOverwrite
    ) => void;
    showOverrideActions: boolean;
}): React.ReactElement {
    const [showEntity, setShowEntity] = React.useState<boolean>(false);
    const [showOverwriteDialog, setShowOverwriteDialog] =
        React.useState<boolean>(false);
    const [workingOverwrite, setWorkingOverwrite] =
        React.useState<ResourceValueOverwrite>({
            overwrite_id: "",
            type: "SET_VALUE",
            start: grantedResourceValue.start,
            end: grantedResourceValue.end,
            value: null,
            comment: null,
        });
    const [overwriteDecimalHelperOn, setOverwriteDecimalHelperOn] =
        React.useState<boolean>(false);

    const theme: Theme = useTheme();

    const resourceName: string =
        resource !== undefined
            ? resource.name
            : grantedResourceValue.resource_id;

    const resourceUnit: string =
        resource?.display_unit === null || resource?.display_unit === undefined
            ? ""
            : resource?.display_unit;

    function realValue(resourceValue: ResourceValue): React.ReactElement {
        let current: number = resourceValue.value;
        let start: number = new Date(resourceValue.start).valueOf();
        activeOverwrites(resourceValue.overwrites).forEach(
            (item: ResourceValueOverwrite) => {
                const itemStart = new Date(item.start).valueOf();
                if (item.type === "SET_VALUE" && start <= itemStart) {
                    current = Number(item.value);
                    start = itemStart;
                }
            }
        );
        const formattedValue: string = formatNumber(
            current /
                (resource?.display_unit_factor !== undefined
                    ? resource?.display_unit_factor
                    : 1)
        );

        return current !== resourceValue.value ? (
            <span style={{ color: theme.palette.info.main }}>
                {formattedValue} {resourceUnit}
            </span>
        ) : (
            <>
                {formattedValue} {resourceUnit}
            </>
        );
    }

    function usageValue(
        resourceValue: ResourceValue,
        value: number | null | undefined
    ): React.ReactElement {
        if (value === undefined) {
            return <LoadingBar />;
        }
        if (value === null || (value === 0 && maxUsed === 0)) {
            return <i>no data available</i>;
        }

        let max: number = resourceValue.value;
        let start: number = new Date(resourceValue.start).valueOf();
        activeOverwrites(resourceValue.overwrites).forEach(
            (item: ResourceValueOverwrite) => {
                const itemStart = new Date(item.start).valueOf();
                if (item.type === "SET_VALUE" && start <= itemStart) {
                    max = Number(item.value);
                    start = itemStart;
                }
            }
        );

        const formattedValue: string = formatNumber(
            value /
                (resource?.display_unit_factor !== undefined
                    ? resource?.display_unit_factor
                    : 1)
        );

        let usedPercent: number = 0;

        let indicatorPercent: number = 0;

        switch (resource?.resource_type) {
            case "cumulative":
                usedPercent = (value / max) * 100;
                indicatorPercent =
                    ((Math.min(
                        Date.now(),
                        new Date(resourceValue.end).valueOf()
                    ) -
                        new Date(resourceValue.start).valueOf()) /
                        (new Date(resourceValue.end).valueOf() -
                            new Date(resourceValue.start).valueOf())) *
                    100;
                break;
            case "snapshot":
                usedPercent = (value / max) * 100;
                indicatorPercent =
                    maxUsed !== null && maxUsed !== undefined
                        ? (maxUsed / max) * 100
                        : 0;
        }

        let barColor: "success" | "warning" | "error" = "success";

        if (resource?.resource_type === "cumulative") {
            barColor =
                usedPercent / indicatorPercent >= 1.5
                    ? "error"
                    : usedPercent / indicatorPercent > 1
                      ? "warning"
                      : "success";
        } else if (resource?.resource_type === "snapshot") {
            barColor =
                usedPercent >= 98
                    ? "error"
                    : usedPercent >= 90
                      ? "warning"
                      : "success";
        }

        return (
            <Box>
                {formattedValue} {resourceUnit}
                <Box sx={{ position: "relative" }}>
                    <LinearProgress
                        variant="determinate"
                        value={Math.min(usedPercent, 100)}
                        color={barColor}
                        sx={{ height: "10px", width: "100%" }}
                    />
                    <Box
                        sx={{
                            position: "absolute",
                            height: "10px",
                            width: "2px",
                            backgroundColor: theme.palette.grey[700],
                            top: 0,
                            left:
                                Math.min(
                                    Math.max(0, indicatorPercent),
                                    100
                                ).toString() + "%",
                        }}
                    />
                    <Box
                        sx={{
                            position: "absolute",
                            height: 0,
                            width: 0,
                            borderLeft: "4px solid transparent",
                            borderRight: "4px solid transparent",
                            borderBottom:
                                "7px solid " +
                                theme.palette.grey[700].toString(),
                            top: "7px",
                            left:
                                Math.min(
                                    Math.max(0, indicatorPercent),
                                    100
                                ).toString() + "%",
                            marginLeft: "-3px",
                        }}
                    />
                    {indicatorPercent > 100 &&
                    resource?.resource_type === "snapshot" ? (
                        <Box
                            sx={{
                                position: "absolute",
                                fontSize: "9px",
                                top: "2px",
                                left: "calc(100% + 5px)",
                            }}
                        >
                            +{Math.round(indicatorPercent - 100).toString()}%
                        </Box>
                    ) : (
                        ""
                    )}
                </Box>
            </Box>
        );
    }

    function realPriority(resourceValue: ResourceValue) {
        let current: number = resourceValue.priority;
        let start: number = new Date(resourceValue.start).valueOf();
        activeOverwrites(resourceValue.overwrites).forEach(
            (item: ResourceValueOverwrite) => {
                const itemStart = new Date(item.start).valueOf();
                if (item.type === "SET_PRIORITY" && start <= itemStart) {
                    current = Number(item.value);
                    start = itemStart;
                }
            }
        );
        let currentName: string | null = null;
        priorities.forEach((priority: ResourcePriority) => {
            if (priority.value === current) {
                currentName = priority.priority_id;
            }
        });
        if (currentName === null) {
            currentName = "unknown";
        }

        if (resourceValue.priority !== current) {
            return (
                <span style={{ color: theme.palette.info.main }}>
                    {currentName}
                </span>
            );
        }

        return currentName;
    }

    function activeOverwrites(
        overwrites: ResourceValueOverwrite[]
    ): ResourceValueOverwrite[] {
        const now = Date.now();
        return overwrites
            .filter(
                (item: ResourceValueOverwrite) =>
                    now >= new Date(item.start).valueOf() &&
                    now <= new Date(item.end).valueOf()
            )
            .sort(
                (ov1: ResourceValueOverwrite, ov2: ResourceValueOverwrite) =>
                    new Date(ov1.start).valueOf() -
                    new Date(ov2.start).valueOf()
            );
    }

    function upcomingOverwrites(
        overwrites: ResourceValueOverwrite[]
    ): ResourceValueOverwrite[] {
        const now = Date.now();
        return overwrites
            .filter(
                (item: ResourceValueOverwrite) =>
                    now <= new Date(item.start).valueOf()
            )
            .sort(
                (ov1: ResourceValueOverwrite, ov2: ResourceValueOverwrite) =>
                    new Date(ov1.start).valueOf() -
                    new Date(ov2.start).valueOf()
            );
    }

    function addOverwrite() {
        setWorkingOverwrite({
            overwrite_id: "",
            type: "SET_VALUE",
            start: grantedResourceValue.start,
            end: grantedResourceValue.end,
            value: null,
            comment: null,
        });
        setShowOverwriteDialog(true);
    }

    function editOverwrite(overwrite: ResourceValueOverwrite) {
        setWorkingOverwrite(overwrite);
        setShowOverwriteDialog(true);
    }

    function stopOverwrite(overwrite: ResourceValueOverwrite) {
        overwrite.end = new Date().toISOString();
        onResourceOverwriteEdit(grantedResourceValue, overwrite);
    }

    function ActivePartitions({
        resourceValue,
    }: {
        resourceValue: ResourceValue;
    }): React.ReactElement {
        const activePartitionOverwrites: ResourceValueOverwrite[] =
            activeOverwrites(resourceValue.overwrites).filter(
                (item: ResourceValueOverwrite) =>
                    item.type === "ADD_PARTITION" ||
                    item.type === "REMOVE_PARTITION"
            );

        const partitions: Set<string> = new Set(resourceValue.partitions);
        activePartitionOverwrites.forEach(
            (overwrite: ResourceValueOverwrite) => {
                if (
                    overwrite.type === "ADD_PARTITION" &&
                    overwrite.value !== null
                ) {
                    partitions.add(overwrite.value.toString());
                }
                if (
                    overwrite.type === "REMOVE_PARTITION" &&
                    overwrite.value !== null
                ) {
                    partitions.delete(overwrite.value.toString());
                }
            }
        );

        if (partitions.size === 0) {
            return (
                <Box
                    sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <i>none</i>
                </Box>
            );
        }

        return (
            <>
                {[...partitions].map((partition: string) => (
                    <pre
                        style={{
                            margin: 0,
                            color: resourceValue.partitions.includes(partition)
                                ? undefined
                                : theme.palette.info.main,
                        }}
                        key={partition}
                    >
                        {partition}
                    </pre>
                ))}
            </>
        );
    }

    function ResourceIcon({
        resourceValue,
    }: {
        resourceValue: ResourceValue;
    }): React.ReactElement {
        if (resourceValue.blocked) {
            return (
                <ErrorIcon
                    color="error"
                    sx={{
                        fontSize: "1.4em",
                    }}
                />
            );
        }
        if (activeOverwrites(resourceValue.overwrites).length > 0) {
            return (
                <InfoIcon
                    color="info"
                    sx={{
                        fontSize: "1.4em",
                    }}
                />
            );
        }
        return (
            <CheckCircleIcon
                color="success"
                sx={{
                    fontSize: "1.4em",
                }}
            />
        );
    }

    function OverwritesTable({
        resourceValue,
    }: {
        resourceValue: ResourceValue;
    }): React.ReactElement {
        const overwrites: ResourceValueOverwrite[] = activeOverwrites(
            resourceValue.overwrites
        );

        const upcoming: ResourceValueOverwrite[] = upcomingOverwrites(
            resourceValue.overwrites
        );

        if ([...overwrites, ...upcoming].length === 0) {
            return (
                <Box
                    sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <i>none</i>
                </Box>
            );
        }

        return (
            <TableContainer
                sx={{
                    height: "100%",
                    overflow: "hidden",
                }}
            >
                <Table
                    sx={{
                        width: "100%",
                        tableLayout: "fixed",
                    }}
                    size="small"
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>Overwrite type</TableCell>
                            <TableCell>Value</TableCell>
                            <TableCell
                                sx={{
                                    width: "33%",
                                }}
                            >
                                Timespan
                            </TableCell>
                            <TableCell
                                sx={{
                                    width: "33%",
                                }}
                            >
                                Comment
                            </TableCell>
                            {showOverrideActions ? (
                                <TableCell
                                    sx={{
                                        width: "10%",
                                    }}
                                />
                            ) : (
                                ""
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {[...overwrites, ...upcoming].map(
                            (overwrite: ResourceValueOverwrite) => {
                                const start = new Date(overwrite.start);
                                const end = new Date(overwrite.end);

                                let realOverwriteValue = overwrite.value;
                                if (
                                    overwrite.type === "SET_VALUE" &&
                                    typeof overwrite.value === "number"
                                ) {
                                    realOverwriteValue =
                                        formatNumber(
                                            overwrite.value /
                                                (resource?.display_unit_factor !==
                                                undefined
                                                    ? resource?.display_unit_factor
                                                    : 1)
                                        ) +
                                        " " +
                                        resourceUnit;
                                }

                                return (
                                    <TableRow
                                        sx={{
                                            "&:last-child td": {
                                                borderBottom: 0,
                                            },
                                        }}
                                        key={overwrite.overwrite_id}
                                    >
                                        <TableCell>
                                            {resourceValueOverwriteName(
                                                overwrite
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {realOverwriteValue}
                                        </TableCell>
                                        <TableCell>
                                            {Date.now() > start.valueOf()
                                                ? timeLeftUntil(end) + " left"
                                                : "starts in " +
                                                  timeLeftUntil(start)}
                                            <br />
                                            Start: {start.toUTCString()}
                                            <br />
                                            End: {end.toUTCString()}
                                        </TableCell>
                                        <TableCell>
                                            {overwrite.comment}
                                        </TableCell>
                                        {showOverrideActions ? (
                                            <TableCell
                                                sx={{
                                                    textAlign: "right",
                                                    gap: "5px",
                                                    pr: "3px",
                                                }}
                                            >
                                                <Tooltip
                                                    title="Edit overwrite"
                                                    placement="top"
                                                >
                                                    <Button
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => {
                                                            editOverwrite(
                                                                overwrite
                                                            );
                                                        }}
                                                        sx={{
                                                            minWidth: "2.25em",
                                                            maxWidth: "2.25em",
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </Button>
                                                </Tooltip>
                                                {start.valueOf() <=
                                                Date.now() ? (
                                                    <Tooltip
                                                        title="Stop overwrite"
                                                        placement="top"
                                                    >
                                                        <Button
                                                            size="small"
                                                            color="error"
                                                            onClick={() => {
                                                                stopOverwrite(
                                                                    overwrite
                                                                );
                                                            }}
                                                            sx={{
                                                                minWidth:
                                                                    "2.25em",
                                                                maxWidth:
                                                                    "2.25em",
                                                            }}
                                                        >
                                                            <StopCircleIcon fontSize="small" />
                                                        </Button>
                                                    </Tooltip>
                                                ) : (
                                                    <></>
                                                )}
                                            </TableCell>
                                        ) : (
                                            ""
                                        )}
                                    </TableRow>
                                );
                            }
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    return (
        <>
            <TableRow
                sx={{
                    "&:last-child td": {
                        borderBottom: 0,
                    },
                }}
            >
                <TableCell
                    sx={{
                        width: "1.4em",
                        lineHeight: "100%",
                        verticalAlign: "middle",
                        borderBottom: "none",
                    }}
                >
                    <ResourceIcon resourceValue={grantedResourceValue} />
                </TableCell>
                <TableCell sx={{ borderBottom: "none" }}>
                    {resourceName}
                </TableCell>
                <TableCell sx={{ borderBottom: "none" }}>
                    {cluster !== undefined ? cluster.name : <i>unknown</i>}
                </TableCell>
                <TableCell sx={{ borderBottom: "none" }}>
                    {realPriority(grantedResourceValue)}
                </TableCell>
                <TableCell sx={{ borderBottom: "none" }}>
                    {realValue(grantedResourceValue)}
                </TableCell>
                <TableCell sx={{ borderBottom: "none" }}>
                    {usageValue(grantedResourceValue, used)}
                </TableCell>

                <TableCell sx={{ borderBottom: "none" }}>
                    <IconButton
                        size="small"
                        onClick={() => setShowEntity(!showEntity)}
                        sx={{
                            float: "right",
                            height: "24px",
                            width: "24px",
                        }}
                    >
                        {showEntity ? (
                            <KeyboardArrowUpIcon />
                        ) : (
                            <KeyboardArrowDownIcon />
                        )}
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell
                    sx={{ py: 0, borderBottom: isLast ? "none" : undefined }}
                />
                <TableCell
                    colSpan={6}
                    sx={{
                        py: 0,
                        pr: 0,
                        borderBottom: isLast ? "none" : undefined,
                    }}
                >
                    <Collapse in={showEntity}>
                        <Divider />
                        <Box
                            sx={{
                                py: 1,
                                pr: 2,
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    component="div"
                                    sx={{
                                        opacity: 0.6,
                                        mb: 1,
                                        pr: 1,
                                    }}
                                >
                                    Active partitions
                                </Typography>
                                <Card
                                    variant="outlined"
                                    sx={{ p: 1, flexGrow: 1 }}
                                >
                                    <ActivePartitions
                                        resourceValue={grantedResourceValue}
                                    />
                                </Card>
                            </Box>
                            <Box
                                sx={{
                                    mx: showOverrideActions ? 1 : undefined,
                                    ml: showOverrideActions ? undefined : 1,
                                    flexGrow: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    component="div"
                                    sx={{
                                        opacity: 0.6,
                                        mb: 1,
                                    }}
                                >
                                    Active & upcoming overwrites
                                </Typography>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        width: "100%",
                                        flexGrow: 1,
                                        overflow: "hidden",
                                    }}
                                >
                                    <OverwritesTable
                                        resourceValue={grantedResourceValue}
                                    />
                                </Card>
                            </Box>
                            {showOverrideActions ? (
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        component="div"
                                        sx={{
                                            opacity: 0.6,
                                            mb: 1,
                                        }}
                                    >
                                        Actions
                                    </Typography>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        onClick={addOverwrite}
                                        sx={{ flexGrow: 1, mb: 0.5 }}
                                    >
                                        Add overwrite
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color={
                                            grantedResourceValue.blocked
                                                ? "success"
                                                : "error"
                                        }
                                        onClick={() => {
                                            grantedResourceValue.blocked
                                                ? onResourceUnblock(
                                                      grantedResourceValue
                                                  )
                                                : onResourceBlock(
                                                      grantedResourceValue
                                                  );
                                        }}
                                        fullWidth
                                        sx={{ flexGrow: 1 }}
                                    >
                                        {grantedResourceValue.blocked
                                            ? "Unblock"
                                            : "Block"}{" "}
                                        resource
                                    </Button>
                                </Box>
                            ) : (
                                <></>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
            <Dialog
                open={showOverwriteDialog}
                onClose={() => {
                    setShowOverwriteDialog(false);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {workingOverwrite.overwrite_id.length === 0
                        ? "Add"
                        : "Edit"}{" "}
                    overwrite
                </DialogTitle>
                <DialogContent>
                    <Stack gap={3}>
                        <LocalizationProvider
                            dateAdapter={AdapterDayjs}
                            adapterLocale="de"
                        >
                            <DateTimePicker
                                label="Start (UTC)"
                                ampm={false}
                                sx={{ mt: 2 }}
                                slotProps={{ textField: { fullWidth: true } }}
                                value={dayjs(new Date(workingOverwrite.start))}
                                timezone="UTC"
                                onChange={(newValue) => {
                                    workingOverwrite.start =
                                        newValue === null
                                            ? grantedResourceValue.start
                                            : newValue.toDate().toISOString();
                                    setWorkingOverwrite(
                                        JSON.parse(
                                            JSON.stringify(workingOverwrite)
                                        )
                                    );
                                }}
                            />
                        </LocalizationProvider>
                        <LocalizationProvider
                            dateAdapter={AdapterDayjs}
                            adapterLocale="de"
                        >
                            <DateTimePicker
                                label="End (UTC)"
                                ampm={false}
                                slotProps={{ textField: { fullWidth: true } }}
                                value={dayjs(new Date(workingOverwrite.end))}
                                timezone="UTC"
                                onChange={(newValue) => {
                                    workingOverwrite.end =
                                        newValue === null
                                            ? grantedResourceValue.end
                                            : newValue.toDate().toISOString();
                                    setWorkingOverwrite(
                                        JSON.parse(
                                            JSON.stringify(workingOverwrite)
                                        )
                                    );
                                }}
                            />
                        </LocalizationProvider>
                        <FormControl fullWidth>
                            <InputLabel>Overwrite type</InputLabel>
                            <Select
                                label="Overwrite type"
                                value={workingOverwrite.type}
                                onChange={(e) => {
                                    workingOverwrite.type = e.target.value as
                                        | "ADD_PARTITION"
                                        | "REMOVE_PARTITION"
                                        | "SET_PRIORITY"
                                        | "SET_VALUE";
                                    setWorkingOverwrite(
                                        JSON.parse(
                                            JSON.stringify(workingOverwrite)
                                        )
                                    );
                                }}
                            >
                                <MenuItem value="ADD_PARTITION">
                                    Enable partition
                                </MenuItem>
                                <MenuItem value="REMOVE_PARTITION">
                                    Disable partition
                                </MenuItem>
                                <MenuItem value="SET_PRIORITY">
                                    Set priority
                                </MenuItem>
                                <MenuItem value="SET_VALUE">
                                    Change value
                                </MenuItem>
                            </Select>
                        </FormControl>
                        {workingOverwrite.type === "SET_PRIORITY" ? (
                            <FormControl fullWidth>
                                <InputLabel>Value</InputLabel>
                                <Select
                                    variant="outlined"
                                    label="Value"
                                    value={
                                        workingOverwrite.value === null
                                            ? ""
                                            : workingOverwrite.value
                                    }
                                    onChange={(e) => {
                                        workingOverwrite.value = Number(
                                            e.target.value
                                        );
                                        setWorkingOverwrite(
                                            JSON.parse(
                                                JSON.stringify(workingOverwrite)
                                            )
                                        );
                                    }}
                                    fullWidth
                                >
                                    {priorities.map(
                                        (priority: ResourcePriority) => {
                                            return (
                                                <MenuItem
                                                    key={priority._id}
                                                    value={priority.value}
                                                >
                                                    {priority.priority_id}
                                                </MenuItem>
                                            );
                                        }
                                    )}
                                </Select>
                            </FormControl>
                        ) : (
                            <TextField
                                variant="outlined"
                                label="Value"
                                slotProps={{
                                    input: {
                                        endAdornment:
                                            workingOverwrite.type ===
                                            "SET_VALUE" ? (
                                                <InputAdornment position="end">
                                                    {resourceUnit}
                                                </InputAdornment>
                                            ) : undefined,
                                    },
                                }}
                                value={
                                    workingOverwrite.value === null
                                        ? ""
                                        : workingOverwrite.type ===
                                                "SET_VALUE" &&
                                            isValueNumeric(
                                                workingOverwrite.value
                                            ) &&
                                            resource !== undefined
                                          ? scaledValueToDecimalString(
                                                Number(workingOverwrite.value),
                                                resource.display_unit_factor
                                            ) +
                                            (overwriteDecimalHelperOn
                                                ? "."
                                                : "")
                                          : workingOverwrite.value
                                }
                                onChange={(e) => {
                                    workingOverwrite.value =
                                        e.currentTarget.value.replaceAll(
                                            ",",
                                            "."
                                        );
                                    if (
                                        workingOverwrite.type === "SET_VALUE" &&
                                        isValueNumeric(workingOverwrite.value)
                                    ) {
                                        workingOverwrite.value =
                                            scaledDecimalInputToNumber(
                                                String(workingOverwrite.value),
                                                resource !== undefined
                                                    ? resource.display_unit_factor
                                                    : 1
                                            );
                                        setOverwriteDecimalHelperOn(
                                            e.currentTarget.value.slice(-1) ===
                                                "." ||
                                                e.currentTarget.value.slice(
                                                    -1
                                                ) === ","
                                        );
                                    }
                                    setWorkingOverwrite(
                                        JSON.parse(
                                            JSON.stringify(workingOverwrite)
                                        )
                                    );
                                }}
                                fullWidth
                            />
                        )}

                        <TextField
                            variant="outlined"
                            label="Comment"
                            value={
                                workingOverwrite.comment === null
                                    ? ""
                                    : workingOverwrite.comment
                            }
                            onChange={(e) => {
                                workingOverwrite.comment =
                                    e.currentTarget.value;
                                setWorkingOverwrite(
                                    JSON.parse(JSON.stringify(workingOverwrite))
                                );
                            }}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setShowOverwriteDialog(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setShowOverwriteDialog(false);
                            if (workingOverwrite.overwrite_id.length === 0) {
                                onResourceOverwriteAdd(
                                    grantedResourceValue,
                                    workingOverwrite
                                );
                            } else {
                                onResourceOverwriteEdit(
                                    grantedResourceValue,
                                    workingOverwrite
                                );
                            }
                        }}
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
