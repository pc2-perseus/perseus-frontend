// React imports
import React from "react";

// MUI imports
import {
    Checkbox,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Menu,
    TextField,
    Typography,
} from "@mui/material";

// Other imports
import _ from "lodash";

export default function ProjectSearchFilter({
    name,
    options,
    updateFilter,
    executeReset,
    preset,
}: {
    name: string;
    options: { label: string; value: boolean | string | number }[];
    updateFilter: (values: (boolean | string | number)[] | undefined) => void;
    executeReset: boolean;
    preset: (boolean | string | number)[] | undefined;
}): React.ReactElement {
    const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
    const [selectedOptions, setSelectedOptions] = React.useState<
        { label: string; value: boolean | string | number }[]
    >(JSON.parse(JSON.stringify(options)));

    function getDisplayedValue() {
        if (selectedOptions.length === options.length) {
            return "all";
        } else if (selectedOptions.length === 0) {
            return "none";
        } else if (selectedOptions.length === 1) {
            return selectedOptions[0].label;
        }
        return (
            selectedOptions[0].label +
            " + " +
            (selectedOptions.length - 1).toString() +
            " more"
        );
    }

    function handleChange(option: {
        label: string;
        value: boolean | string | number;
    }) {
        if (_.some(selectedOptions, option)) {
            _.remove(selectedOptions, option);
        } else {
            selectedOptions.push(option);
        }
        setSelectedOptions(JSON.parse(JSON.stringify(selectedOptions)));
        if (selectedOptions.length === options.length) {
            updateFilter(undefined);
        } else {
            updateFilter(selectedOptions.map((option) => option.value));
        }
    }

    function handleChangeAll(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.currentTarget.checked) {
            setSelectedOptions(JSON.parse(JSON.stringify(options)));
            updateFilter(undefined);
        } else {
            setSelectedOptions([]);
            updateFilter([]);
        }
    }

    React.useEffect(() => {
        if (executeReset) {
            setSelectedOptions(JSON.parse(JSON.stringify(options)));
            updateFilter(undefined);
        }
    }, [executeReset]);

    React.useEffect(() => {
        if (preset !== undefined) {
            options.forEach(
                (option: {
                    label: string;
                    value: boolean | string | number;
                }) => {
                    if (!preset.includes(option.value)) {
                        if (_.some(selectedOptions, option)) {
                            _.remove(selectedOptions, option);
                        }
                    }
                }
            );
        }
    }, []);

    return (
        <>
            <TextField
                InputProps={{
                    readOnly: true,
                }}
                onClick={(e) => {
                    setAnchor(e.currentTarget);
                }}
                label={name}
                value={getDisplayedValue()}
                fullWidth
                focused={false}
                size="small"
                sx={{ input: { cursor: "pointer" } }}
            />
            <Menu
                open={anchor !== null}
                anchorEl={anchor}
                onClose={() => {
                    setAnchor(null);
                }}
                slotProps={{ paper: { sx: { maxHeight: 350 } } }}
                sx={{ py: 0, "& .MuiList-root": { pt: 0 } }}
            >
                <List dense sx={{ py: 0 }}>
                    <ListSubheader sx={{ pl: 0, zIndex: 10 }}>
                        <Checkbox
                            size="small"
                            checked={selectedOptions.length === options.length}
                            indeterminate={
                                selectedOptions.length > 0 &&
                                selectedOptions.length !== options.length
                            }
                            onChange={handleChangeAll}
                        />
                        <Typography variant="caption">
                            Show / hide all
                        </Typography>
                    </ListSubheader>
                    {options.map(
                        (
                            option: {
                                label: string;
                                value: boolean | string | number;
                            },
                            index: number
                        ) => {
                            return (
                                <ListItem
                                    sx={{ px: 0, my: 0, py: 0 }}
                                    key={index}
                                >
                                    <ListItemButton
                                        sx={{ px: 2, py: 0 }}
                                        onClick={() => {
                                            handleChange(option);
                                        }}
                                    >
                                        <ListItemIcon sx={{ mr: 0 }}>
                                            <Checkbox
                                                edge="start"
                                                size="small"
                                                tabIndex={-1}
                                                disableRipple
                                                checked={_.some(
                                                    selectedOptions,
                                                    option
                                                )}
                                            />
                                        </ListItemIcon>
                                        <ListItemText>
                                            {option.label}
                                        </ListItemText>
                                    </ListItemButton>
                                </ListItem>
                            );
                        }
                    )}
                </List>
            </Menu>
        </>
    );
}
