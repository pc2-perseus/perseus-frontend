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

// Icon imports
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

// Custom imports
import LimitValue from "../../../interfaces/LimitValue.ts";
import Limit from "../../../interfaces/Limit.ts";
import formatNumber from "../../../utils/formatNumber.ts";
import LimitValueOverwrite from "../../../interfaces/LimitValueOverwrite.ts";
import timeLeftUntil from "../../../utils/timeLeftUntil.ts";
import resourceValueOverwriteName from "../../../utils/resourceValueOverwriteName.ts";
import EditIcon from "@mui/icons-material/Edit";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import isValueNumeric from "../../../utils/isValueNumeric.ts";
import ResourceValueOverwrite from "../../../interfaces/ResourceValueOverwrite.ts";

export default function ComputeProjectLimitRow({
    limit,
    grantedLimitValue,
    onLimitOverwriteAdd,
    onLimitOverwriteEdit,
    showOverrideActions,
    isLast,
}: {
    limit: Limit | undefined;
    grantedLimitValue: LimitValue;
    onLimitOverwriteAdd: (
        limitValue: LimitValue,
        overwrite: LimitValueOverwrite
    ) => void;
    onLimitOverwriteEdit: (
        limitValue: LimitValue,
        overwrite: LimitValueOverwrite
    ) => void;
    showOverrideActions: boolean;
    isLast: boolean;
}): React.ReactElement {
    const [showEntity, setShowEntity] = React.useState<boolean>(false);
    const [showOverwriteDialog, setShowOverwriteDialog] =
        React.useState<boolean>(false);
    const [workingOverwrite, setWorkingOverwrite] =
        React.useState<LimitValueOverwrite>({
            overwrite_id: "",
            type: "SET_VALUE",
            start: grantedLimitValue.start,
            end: grantedLimitValue.end,
            value: null,
            comment: null,
        });

    const theme: Theme = useTheme();

    const limitName: string =
        limit !== undefined ? limit.name : grantedLimitValue.limit_id;

    const limitUnit: string =
        limit?.display_unit === null || limit?.display_unit === undefined
            ? ""
            : limit?.display_unit;

    function activeOverwrites(
        overwrites: LimitValueOverwrite[]
    ): LimitValueOverwrite[] {
        const now = Date.now();
        return overwrites
            .filter(
                (item: LimitValueOverwrite) =>
                    now >= new Date(item.start).valueOf() &&
                    now <= new Date(item.end).valueOf()
            )
            .sort(
                (ov1: LimitValueOverwrite, ov2: LimitValueOverwrite) =>
                    new Date(ov1.start).valueOf() -
                    new Date(ov2.start).valueOf()
            );
    }

    function upcomingOverwrites(
        overwrites: LimitValueOverwrite[]
    ): LimitValueOverwrite[] {
        const now = Date.now();
        return overwrites
            .filter(
                (item: LimitValueOverwrite) =>
                    now <= new Date(item.start).valueOf()
            )
            .sort(
                (ov1: LimitValueOverwrite, ov2: LimitValueOverwrite) =>
                    new Date(ov1.start).valueOf() -
                    new Date(ov2.start).valueOf()
            );
    }

    function realValue(limitValue: LimitValue): React.ReactElement {
        let current: number = limitValue.value;
        let start: number = new Date(limitValue.start).valueOf();
        activeOverwrites(limitValue.overwrites).forEach(
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
                (limit?.display_unit_factor !== undefined
                    ? limit?.display_unit_factor
                    : 1)
        );

        return current !== limitValue.value ? (
            <span style={{ color: theme.palette.info.main }}>
                {formattedValue} {limitUnit}
            </span>
        ) : (
            <>
                {formattedValue} {limitUnit}
            </>
        );
    }

    function addOverwrite() {
        setWorkingOverwrite({
            overwrite_id: "",
            type: "SET_VALUE",
            start: grantedLimitValue.start,
            end: grantedLimitValue.end,
            value: null,
            comment: null,
        });
        setShowOverwriteDialog(true);
    }

    function editOverwrite(overwrite: LimitValueOverwrite) {
        setWorkingOverwrite(overwrite);
        setShowOverwriteDialog(true);
    }

    function stopOverwrite(overwrite: LimitValueOverwrite) {
        overwrite.end = new Date().toISOString();
        onLimitOverwriteEdit(grantedLimitValue, overwrite);
    }

    function LimitIcon({
        limitValue,
    }: {
        limitValue: LimitValue;
    }): React.ReactElement {
        if (activeOverwrites(limitValue.overwrites).length > 0) {
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
        limitValue,
    }: {
        limitValue: LimitValue;
    }): React.ReactElement {
        const overwrites: LimitValueOverwrite[] = activeOverwrites(
            limitValue.overwrites
        );

        const upcoming: LimitValueOverwrite[] = upcomingOverwrites(
            limitValue.overwrites
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
                            (overwrite: LimitValueOverwrite) => {
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
                                                (limit?.display_unit_factor !==
                                                undefined
                                                    ? limit?.display_unit_factor
                                                    : 1)
                                        ) +
                                        " " +
                                        limitUnit;
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
                                                    display: "flex",
                                                    justifyContent: "end",
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
                    <LimitIcon limitValue={grantedLimitValue} />
                </TableCell>
                <TableCell sx={{ borderBottom: "none" }}>{limitName}</TableCell>
                <TableCell sx={{ borderBottom: "none" }}>-</TableCell>
                <TableCell sx={{ borderBottom: "none" }}>-</TableCell>
                <TableCell sx={{ borderBottom: "none" }}>
                    {realValue(grantedLimitValue)}
                </TableCell>
                <TableCell sx={{ borderBottom: "none" }}>
                    <i>coming soon</i>
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
                                        limitValue={grantedLimitValue}
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
                                            ? grantedLimitValue.start
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
                                            ? grantedLimitValue.end
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
                                    workingOverwrite.type = e.target
                                        .value as "SET_VALUE";
                                    setWorkingOverwrite(
                                        JSON.parse(
                                            JSON.stringify(workingOverwrite)
                                        )
                                    );
                                }}
                            >
                                <MenuItem value="SET_VALUE">
                                    Change value
                                </MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            variant="outlined"
                            label="Value"
                            InputProps={{
                                endAdornment:
                                    workingOverwrite.type === "SET_VALUE" ? (
                                        <InputAdornment position="end">
                                            {limitUnit}
                                        </InputAdornment>
                                    ) : undefined,
                            }}
                            value={
                                workingOverwrite.value === null
                                    ? ""
                                    : workingOverwrite.type === "SET_VALUE" &&
                                        isValueNumeric(
                                            workingOverwrite.value
                                        ) &&
                                        limit !== undefined
                                      ? Number(workingOverwrite.value) /
                                        limit.display_unit_factor
                                      : workingOverwrite.value
                            }
                            onChange={(e) => {
                                workingOverwrite.value = e.currentTarget.value;
                                if (
                                    workingOverwrite.type === "SET_VALUE" &&
                                    isValueNumeric(workingOverwrite.value)
                                ) {
                                    workingOverwrite.value =
                                        Number(workingOverwrite.value) *
                                        (limit !== undefined
                                            ? limit?.display_unit_factor
                                            : 1);
                                }
                                setWorkingOverwrite(
                                    JSON.parse(JSON.stringify(workingOverwrite))
                                );
                            }}
                            fullWidth
                        />
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
                                onLimitOverwriteAdd(
                                    grantedLimitValue,
                                    workingOverwrite
                                );
                            } else {
                                onLimitOverwriteEdit(
                                    grantedLimitValue,
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
