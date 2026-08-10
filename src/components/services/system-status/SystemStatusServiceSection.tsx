import React from "react";
import {
    Box,
    Button,
    List,
    ListItemButton,
    ListItemText,
    Paper,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SystemStatusService from "../../../interfaces/SystemStatusService.ts";

export default function SystemStatusServiceSection({
    title,
    services,
    onAdd,
    onSelect,
}: {
    title: string;
    services: SystemStatusService[];
    onAdd: () => void;
    onSelect: (service: SystemStatusService) => void;
}): React.ReactElement {
    return (
        <Paper elevation={16} sx={{ p: 2 }}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    gap: 1,
                }}
            >
                <Typography variant="h5" component="span" gutterBottom>
                    {title}
                </Typography>
                <Button variant="contained" size="small" onClick={onAdd}>
                    <AddIcon />
                </Button>
            </Box>
            <List sx={{ mt: 2, py: 0 }}>
                {services.length === 0 ? (
                    <ListItemText
                        primary="No active services in this section."
                        sx={{ px: 2 }}
                    />
                ) : (
                    services.map((service: SystemStatusService) => (
                        <ListItemButton
                            key={service._id ?? service.name}
                            onClick={() => onSelect(service)}
                        >
                            <ListItemText
                                primary={service.name}
                                secondary={
                                    "Display rank: " +
                                    service.display_rank.toString() +
                                    (service.linked_resource_id === null
                                        ? ""
                                        : " | Resource: " +
                                          service.linked_resource_id)
                                }
                            />
                        </ListItemButton>
                    ))
                )}
            </List>
        </Paper>
    );
}
