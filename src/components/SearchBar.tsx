// React imports
import React from "react";

// MUI imports
import { Button, Grid, InputAdornment, TextField } from "@mui/material";

// Icon imports
import SearchIcon from "@mui/icons-material/Search";

export default function SearchBar({
    onSearch,
    actionTitle,
    actionIcon,
    onAction,
}: {
    onSearch: (value: string) => void;
    actionTitle?: string;
    actionIcon?: React.ReactElement;
    onAction?: () => void;
}): React.ReactElement {
    const [searchFilter, setSearchFilter] = React.useState<string>("");

    const showActionButton: boolean =
        actionTitle !== undefined || actionIcon !== undefined;

    return (
        <Grid container spacing={2}>
            <Grid
                size={{
                    xs: 12,
                    md: showActionButton ? 8 : 12,
                    lg: showActionButton ? 9 : 12,
                }}
            >
                <TextField
                    label="Search"
                    autoComplete="off"
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        },
                    }}
                    variant="outlined"
                    onChange={(e) => {
                        setSearchFilter(e.currentTarget.value);
                        onSearch(e.currentTarget.value);
                    }}
                    value={searchFilter}
                    fullWidth
                />
            </Grid>
            {showActionButton && (
                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        sx={{ height: "100%" }}
                        onClick={onAction}
                    >
                        {actionIcon}
                        {actionTitle}
                    </Button>
                </Grid>
            )}
        </Grid>
    );
}
