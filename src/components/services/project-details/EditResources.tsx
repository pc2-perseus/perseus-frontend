// React imports
import React from "react";

// MUI imports
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Tab,
    Tabs,
    Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ResourceValue from "../../../interfaces/ResourceValue.ts";
import Resource from "../../../interfaces/Resource.ts";
import Cluster from "../../../interfaces/Cluster.ts";
import EditResourcePreset from "../../../interfaces/EditResourcePreset.ts";
import IncreasePercent, {
    increasePercentNote,
    increasePercentSubmitFormat,
} from "./edit-resources-presets/IncreasePercent.tsx";
import editResources from "../../../api/editResources.ts";
import IncreasePercentCumulative, {
    increasePercentCumulativeNote,
    increasePercentCumulativeSubmitFormat,
} from "./edit-resources-presets/IncreasePercentCumulative.tsx";
import IncreasePercentSnapshot, {
    increasePercentSnapshotNote,
    increasePercentSnapshotSubmitFormat,
} from "./edit-resources-presets/IncreasePercentSnapshot.tsx";
import ExtendLastPhase, {
    extendLastPhaseNote,
    extendLastPhaseSubmitFormat,
} from "./edit-resources-presets/ExtendLastPhase.tsx";

export default function EditResources({
    projectId,
    resourceValues,
    resources,
    clusters,
}: {
    projectId: string;
    resourceValues: ResourceValue[];
    resources: Resource[];
    clusters: Cluster[];
}): React.ReactElement {
    const [showDialog, setShowDialog] = React.useState<boolean>(false);
    const [currentTab, setCurrentTab] = React.useState<number>(0);
    const [currentPreset, setCurrentPreset] = React.useState<string>("");
    const [presetData, setPresetData] = React.useState<{
        [key: string]: unknown;
    }>({});

    function updatePresetData(id: string, value: unknown) {
        presetData[id] = value;
        setPresetData(JSON.parse(JSON.stringify(presetData)));
    }

    function submitPreset() {
        let data: {
            resource_id: string;
            compute_project_id: string | null;
            start: string;
            end: string;
            value: number;
        }[] = [];
        let note: string | null = null;
        presets.forEach((preset: EditResourcePreset) => {
            if (preset.id === currentPreset) {
                data = preset.submitFormat(
                    presetData,
                    resourceValues,
                    resources,
                    clusters
                );
                if (preset.note !== undefined) {
                    note = preset.note(
                        presetData,
                        resourceValues,
                        resources,
                        clusters
                    );
                }
            }
        });

        editResources(projectId, note, data).then((result: boolean) => {
            if (result) {
                window.location.reload();
            }
        });
    }

    const presets: EditResourcePreset[] = [
        {
            id: "increase-percent",
            name: "Increase all resources by a percentage",
            component: IncreasePercent,
            submitFormat: increasePercentSubmitFormat,
            note: increasePercentNote,
        },
        {
            id: "increase-percent-cumulative",
            name: "Increase all cumulative resources by a percentage",
            component: IncreasePercentCumulative,
            submitFormat: increasePercentCumulativeSubmitFormat,
            note: increasePercentCumulativeNote,
        },
        {
            id: "increase-percent-snapshot",
            name: "Increase all snapshot resources by a percentage",
            component: IncreasePercentSnapshot,
            submitFormat: increasePercentSnapshotSubmitFormat,
            note: increasePercentSnapshotNote,
        },
        {
            id: "extend-last-phase",
            name: "Extend last phase",
            component: ExtendLastPhase,
            submitFormat: extendLastPhaseSubmitFormat,
            note: extendLastPhaseNote,
        },
    ];

    return (
        <>
            <Tooltip title="Edit" placement="top">
                <Button
                    size="small"
                    sx={{
                        minWidth: "2.25em",
                        maxWidth: "2.25em",
                    }}
                    onClick={() => {
                        setShowDialog(true);
                    }}
                >
                    <EditIcon fontSize="small" />
                </Button>
            </Tooltip>
            <Dialog
                open={showDialog}
                onClose={() => {
                    setShowDialog(false);
                }}
                maxWidth="md"
                fullWidth
                scroll="paper"
            >
                <DialogTitle sx={{ pb: 0 }}>
                    Edit granted resources
                    <Tabs
                        value={currentTab}
                        onChange={(_, value: number) => {
                            setCurrentTab(value);
                        }}
                    >
                        <Tab label="Presets" />
                        <Tab label="Manual edit" />
                    </Tabs>
                </DialogTitle>
                <DialogContent dividers>
                    <Box>
                        <div
                            role="tabpanel"
                            hidden={currentTab !== 0}
                            style={{ position: "relative" }}
                        >
                            <FormControl fullWidth sx={{ mt: 2 }}>
                                <InputLabel>Select preset</InputLabel>
                                <Select
                                    label="Select preset"
                                    variant="outlined"
                                    value={currentPreset}
                                    onChange={(e: SelectChangeEvent) => {
                                        setCurrentPreset(e.target.value);
                                    }}
                                >
                                    {presets.map(
                                        (preset: EditResourcePreset) => (
                                            <MenuItem
                                                key={preset.id}
                                                value={preset.id}
                                            >
                                                {preset.name}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>
                            <Divider
                                orientation="horizontal"
                                sx={{
                                    my: 2,
                                    display:
                                        currentPreset === ""
                                            ? "none"
                                            : undefined,
                                }}
                            />
                            {presets.map((preset: EditResourcePreset) => {
                                return (
                                    <Box
                                        key={preset.id}
                                        sx={{
                                            display:
                                                currentPreset === preset.id
                                                    ? undefined
                                                    : "none",
                                        }}
                                    >
                                        <preset.component
                                            resources={resources}
                                            clusters={clusters}
                                            resourceValues={resourceValues}
                                            updatePresetData={updatePresetData}
                                        />
                                    </Box>
                                );
                            })}
                        </div>
                        <div
                            role="tabpanel"
                            hidden={currentTab !== 1}
                            style={{ position: "relative" }}
                        >
                            <i>Coming soon</i>
                        </div>
                    </Box>
                </DialogContent>
                <DialogActions>
                    {currentTab === 0 && currentPreset !== "" ? (
                        <Button variant="contained" onClick={submitPreset}>
                            Submit
                        </Button>
                    ) : (
                        ""
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
}
