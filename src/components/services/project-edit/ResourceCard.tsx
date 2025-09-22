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
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";

// Icon imports
import AddIcon from "@mui/icons-material/Add";

// Custom imports
import sortResourceValues from "../../../utils/sortResourceValues.ts";
import ResourceValue from "../../../interfaces/ResourceValue.ts";
import Resource from "../../../interfaces/Resource.ts";
import Cluster from "../../../interfaces/Cluster.ts";
import ResourceCardRow from "./ResourceCardRow.tsx";
import clusterMatch from "../../../utils/clusterMatch.ts";
import resourceMatch from "../../../utils/resourceMatch.ts";

// Other imports
import dayjs, { Dayjs } from "dayjs";
import ResourcePriority from "../../../interfaces/ResourcePriority.ts";

export default function ResourceCard({
    title,
    resourceValues,
    clusters,
    resources,
    priorities,
    projectStart,
    projectEnd,
    onChange,
}: {
    title: string;
    resourceValues: ResourceValue[];
    clusters: Cluster[];
    resources: Resource[];
    priorities: ResourcePriority[];
    projectStart: string | null;
    projectEnd: string | null;
    onChange: (values: ResourceValue[]) => void;
}): React.ReactElement {
    const [currentValues, setCurrentValues] = React.useState<ResourceValue[]>(
        sortResourceValues(resourceValues, resources, clusters)
    );
    const [openDialog, setOpenDialog] = React.useState<boolean>(false);
    const [newResourceValue, setNewResourceValue] =
        React.useState<ResourceValue>({
            _id: null,
            files: {},
            file_tags: {},
            resource_id: "",
            value: 0,
            start:
                projectStart === null ? new Date().toISOString() : projectStart,
            end: projectEnd === null ? new Date().toISOString() : projectEnd,
            compute_project_id: null,
            partitions: [],
            overwrites: [],
            priority: 0,
            blocked: false,
        });
    const [newResourceSelection, setNewResourceSelection] =
        React.useState<Resource | null>(null);
    const [decimalHelperOn, setDecimalHelperOn] =
        React.useState<boolean>(false);

    function updateResourceValue(value: ResourceValue, index: number) {
        currentValues[index] = value;
        setCurrentValues(
            JSON.parse(
                JSON.stringify(
                    sortResourceValues(currentValues, resources, clusters)
                )
            )
        );
    }

    function deleteResourceValue(index: number) {
        currentValues.splice(index, 1);
        setCurrentValues(
            JSON.parse(
                JSON.stringify(
                    sortResourceValues(currentValues, resources, clusters)
                )
            )
        );
    }

    function addResourceValue() {
        currentValues.push(newResourceValue);
        setCurrentValues(
            JSON.parse(
                JSON.stringify(
                    sortResourceValues(currentValues, resources, clusters)
                )
            )
        );
        setOpenDialog(false);
        setNewResourceValue({
            _id: null,
            files: {},
            file_tags: {},
            resource_id: "",
            value: 0,
            start:
                projectStart === null ? new Date().toISOString() : projectStart,
            end: projectEnd === null ? new Date().toISOString() : projectEnd,
            compute_project_id: null,
            partitions: [],
            overwrites: [],
            priority: 0,
            blocked: false,
        });
        setNewResourceSelection(null);
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
                        justifyContent: "space-between",
                    }}
                >
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        {title}
                    </Typography>
                    <Button
                        onClick={() => {
                            setOpenDialog(true);
                        }}
                    >
                        <AddIcon />
                    </Button>
                </Box>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Resource</TableCell>
                                        <TableCell>Cluster</TableCell>
                                        <TableCell>Compute Project</TableCell>
                                        <TableCell>Start (UTC)</TableCell>
                                        <TableCell>End (UTC)</TableCell>
                                        <TableCell>Partitions</TableCell>
                                        <TableCell>Priority</TableCell>
                                        <TableCell>Value</TableCell>
                                        <TableCell />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {currentValues.map(
                                        (rv: ResourceValue, index: number) => (
                                            <ResourceCardRow
                                                key={index}
                                                index={index}
                                                value={rv}
                                                resources={resources}
                                                clusters={clusters}
                                                priorities={priorities}
                                                onChange={updateResourceValue}
                                                onDelete={deleteResourceValue}
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
                <DialogTitle>Add resource</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 3 }}>
                        <Autocomplete
                            renderInput={(params) => (
                                <TextField label="Resource" {...params} />
                            )}
                            options={resources}
                            getOptionLabel={(option: Resource) =>
                                clusterMatch(
                                    { resource_id: option.id },
                                    resources,
                                    clusters
                                )?.name +
                                " - " +
                                option.name
                            }
                            value={
                                newResourceValue.resource_id === ""
                                    ? null
                                    : resourceMatch(newResourceValue, resources)
                            }
                            onChange={(_, value: Resource | null) => {
                                if (value !== null) {
                                    setNewResourceSelection(value);
                                    newResourceValue.resource_id = value.id;
                                    setNewResourceValue(
                                        JSON.parse(
                                            JSON.stringify(newResourceValue)
                                        )
                                    );
                                }
                            }}
                            fullWidth
                        />
                        <DateTimePicker
                            label="Start (UTC)"
                            value={dayjs(newResourceValue.start)}
                            timezone="UTC"
                            slotProps={{
                                textField: { fullWidth: true },
                            }}
                            onChange={(newValue: Dayjs | null) => {
                                if (newValue !== null) {
                                    newResourceValue.start = newValue
                                        .toDate()
                                        .toISOString();
                                    setNewResourceValue(
                                        JSON.parse(
                                            JSON.stringify(newResourceValue)
                                        )
                                    );
                                }
                            }}
                        />
                        <DateTimePicker
                            label="Start (UTC)"
                            value={dayjs(newResourceValue.end)}
                            timezone="UTC"
                            slotProps={{
                                textField: { fullWidth: true },
                            }}
                            onChange={(newValue: Dayjs | null) => {
                                if (newValue !== null) {
                                    newResourceValue.end = newValue
                                        .toDate()
                                        .toISOString();
                                    setNewResourceValue(
                                        JSON.parse(
                                            JSON.stringify(newResourceValue)
                                        )
                                    );
                                }
                            }}
                        />
                        <Autocomplete
                            renderInput={(params) => (
                                <TextField {...params} label="Partitions" />
                            )}
                            multiple
                            value={newResourceValue.partitions}
                            options={[]}
                            onChange={(_, values: string[] | null) => {
                                if (values === null) {
                                    values = [];
                                }
                                newResourceValue.partitions = values;
                                setNewResourceValue(
                                    JSON.parse(JSON.stringify(newResourceValue))
                                );
                            }}
                            freeSolo
                            fullWidth
                        />
                        <TextField
                            label="Value"
                            value={
                                (newResourceSelection !== null
                                    ? Math.round(
                                          (newResourceValue.value /
                                              newResourceSelection.display_unit_factor) *
                                              1000
                                      ) / 1000
                                    : newResourceValue.value
                                ).toString() + (decimalHelperOn ? "." : "")
                            }
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {newResourceSelection?.display_unit}
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            onChange={(e) => {
                                newResourceValue.value =
                                    Number(
                                        e.currentTarget.value.replaceAll(
                                            ",",
                                            "."
                                        )
                                    ) *
                                    (newResourceSelection === null
                                        ? 1
                                        : newResourceSelection.display_unit_factor);
                                setDecimalHelperOn(
                                    e.currentTarget.value.slice(-1) === "." ||
                                        e.currentTarget.value.slice(-1) === ","
                                );
                                setNewResourceValue(
                                    JSON.parse(JSON.stringify(newResourceValue))
                                );
                            }}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={addResourceValue}>
                        Add resource
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
