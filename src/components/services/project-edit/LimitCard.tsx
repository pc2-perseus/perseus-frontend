// React imports
import React from "react";

// MUI imports
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    InputAdornment,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";

// Icon imports
import AddIcon from "@mui/icons-material/Add";

// Custom imports
import { DateTimePicker } from "@mui/x-date-pickers";
import LimitValue from "../../../interfaces/LimitValue.ts";
import sortLimitValues from "../../../utils/sortLimitValues.ts";
import Limit from "../../../interfaces/Limit.ts";
import LimitCardRow from "./LimitCardRow.tsx";
import limitMatch from "../../../utils/limitMatch.ts";

// Other imports
import dayjs, { Dayjs } from "dayjs";
import DecimalTextField from "../../DecimalTextField.tsx";
import {
    decimalInputToNumber,
    scaledDecimalInputToNumber,
    scaledValueToDecimalString,
} from "../../../utils/decimalUnits.ts";

export default function LimitCard({
    title,
    limitValues,
    limits,
    projectStart,
    projectEnd,
    onChange,
}: {
    title: string;
    limitValues: LimitValue[];
    limits: Limit[];
    projectStart: string | null;
    projectEnd: string | null;
    onChange: (values: LimitValue[]) => void;
}): React.ReactElement {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const [currentValues, setCurrentValues] = React.useState<LimitValue[]>(
        sortLimitValues(limitValues, limits)
    );
    const [openDialog, setOpenDialog] = React.useState<boolean>(false);
    const [newLimitValue, setNewLimitValue] = React.useState<LimitValue>({
        _id: null,
        files: {},
        file_tags: {},
        limit_id: "",
        value: 0,
        start: projectStart === null ? new Date().toISOString() : projectStart,
        end: projectEnd === null ? new Date().toISOString() : projectEnd,
        compute_project_id: null,
        overwrites: [],
        affected_users: [],
    });
    const [newLimitSelection, setNewLimitSelection] =
        React.useState<Limit | null>(null);
    function updateLimitValue(value: LimitValue, index: number) {
        currentValues[index] = value;
        setCurrentValues(
            JSON.parse(JSON.stringify(sortLimitValues(currentValues, limits)))
        );
    }

    function deleteLimitValue(index: number) {
        currentValues.splice(index, 1);
        setCurrentValues(
            JSON.parse(JSON.stringify(sortLimitValues(currentValues, limits)))
        );
    }

    function addLimitValue() {
        currentValues.push(newLimitValue);
        setCurrentValues(
            JSON.parse(JSON.stringify(sortLimitValues(currentValues, limits)))
        );
        setOpenDialog(false);
        setNewLimitValue({
            _id: null,
            files: {},
            file_tags: {},
            limit_id: "",
            value: 0,
            start:
                projectStart === null ? new Date().toISOString() : projectStart,
            end: projectEnd === null ? new Date().toISOString() : projectEnd,
            compute_project_id: null,
            overwrites: [],
            affected_users: [],
        });
        setNewLimitSelection(null);
    }

    React.useEffect(() => {
        onChange(currentValues);
    }, [currentValues]);

    return (
        <Card sx={{ my: 2 }}>
            <CardContent>
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 1,
                        justifyContent: "space-between",
                    }}
                >
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        {title}
                    </Typography>
                    <Button
                        fullWidth={isSmallScreen}
                        onClick={() => {
                            setOpenDialog(true);
                        }}
                    >
                        Add
                        <AddIcon />
                    </Button>
                </Box>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        <TableContainer sx={{ overflowX: "auto" }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Limit</TableCell>
                                        <TableCell>Start (UTC)</TableCell>
                                        <TableCell>End (UTC)</TableCell>
                                        <TableCell>Value</TableCell>
                                        <TableCell />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {currentValues.map(
                                        (lv: LimitValue, index: number) => (
                                            <LimitCardRow
                                                key={index}
                                                index={index}
                                                value={lv}
                                                limits={limits}
                                                onChange={updateLimitValue}
                                                onDelete={deleteLimitValue}
                                                isSmallScreen={isSmallScreen}
                                            />
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            </CardContent>
            <Dialog
                open={openDialog}
                onClose={() => {
                    setOpenDialog(false);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Add limit</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 3 }}>
                        <Autocomplete
                            renderInput={(params) => (
                                <TextField label="Limit" {...params} />
                            )}
                            options={limits}
                            getOptionLabel={(option: Limit) => option.name}
                            value={
                                newLimitValue.limit_id === ""
                                    ? null
                                    : limitMatch(newLimitValue, limits)
                            }
                            onChange={(_, value: Limit | null) => {
                                if (value !== null) {
                                    setNewLimitSelection(value);
                                    newLimitValue.limit_id = value.id;
                                    setNewLimitValue(
                                        JSON.parse(
                                            JSON.stringify(newLimitValue)
                                        )
                                    );
                                }
                            }}
                            fullWidth
                        />
                        <DateTimePicker
                            label="Start (UTC)"
                            value={dayjs(newLimitValue.start)}
                            timezone="UTC"
                            slotProps={{
                                textField: { fullWidth: true },
                            }}
                            onChange={(newValue: Dayjs | null) => {
                                if (newValue !== null) {
                                    newLimitValue.start = newValue
                                        .toDate()
                                        .toISOString();
                                    setNewLimitValue(
                                        JSON.parse(
                                            JSON.stringify(newLimitValue)
                                        )
                                    );
                                }
                            }}
                        />
                        <DateTimePicker
                            label="End (UTC)"
                            value={dayjs(newLimitValue.end)}
                            timezone="UTC"
                            slotProps={{
                                textField: { fullWidth: true },
                            }}
                            onChange={(newValue: Dayjs | null) => {
                                if (newValue !== null) {
                                    newLimitValue.end = newValue
                                        .toDate()
                                        .toISOString();
                                    setNewLimitValue(
                                        JSON.parse(
                                            JSON.stringify(newLimitValue)
                                        )
                                    );
                                }
                            }}
                        />
                        <DecimalTextField
                            label="Value"
                            value={
                                newLimitSelection !== null
                                    ? scaledValueToDecimalString(
                                          newLimitValue.value,
                                          newLimitSelection.display_unit_factor
                                      )
                                    : newLimitValue.value.toString()
                            }
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {newLimitSelection?.display_unit}
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            onValueChange={(newValue: string) => {
                                newLimitValue.value =
                                    newLimitSelection === null
                                        ? decimalInputToNumber(newValue)
                                        : scaledDecimalInputToNumber(
                                              newValue,
                                              newLimitSelection.display_unit_factor
                                          );
                                setNewLimitValue(
                                    JSON.parse(JSON.stringify(newLimitValue))
                                );
                            }}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={addLimitValue}>
                        Add limit
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
