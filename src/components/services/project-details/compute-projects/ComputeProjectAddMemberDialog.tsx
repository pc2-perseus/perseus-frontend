// React imports
import React, { ChangeEvent } from "react";

// MUI imports
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    InputAdornment,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    TextField,
} from "@mui/material";

// Icon imports
import SearchIcon from "@mui/icons-material/Search";

// Custom imports
import LoadingBar from "../../../LoadingBar.tsx";
import Person from "../../../../interfaces/Person.ts";
import searchPersons from "../../../../api/person-search/searchPersons.ts";
import personFullName from "../../../../utils/personFullName.ts";

export default function ComputeProjectAddMemberDialog({
    open,
    onClose,
    computeProjectId,
    addMembers,
}: {
    open: boolean;
    onClose: () => void;
    computeProjectId: string;
    addMembers: (persons: Person[]) => void;
}): React.ReactElement {
    const [searchString, setSearchString] = React.useState<string>("");
    const [searchResults, updateSearchResults] = React.useState<Person[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [executeSearch, setExecuteSearch] = React.useState<boolean>(false);

    const [selected, setSelected] = React.useState<Person[]>([]);

    function search(event: ChangeEvent<HTMLInputElement>) {
        setSearchString(event.currentTarget.value);
        if (event.currentTarget.value.trim().length === 0) {
            updateSearchResults([]);
            return;
        } else {
            setLoading(true);
            setExecuteSearch(false);
            window.setTimeout(() => {
                setExecuteSearch(true);
            }, 500);
        }
    }

    function togglePerson(person: Person) {
        if (selected.filter((p: Person) => p._id === person._id).length === 0) {
            setSelected([...selected, person]);
        } else {
            setSelected([
                ...selected.filter((p: Person) => p._id !== person._id),
            ]);
        }
    }

    React.useEffect(() => {
        if (executeSearch) {
            searchPersons(searchString).then((response) => {
                updateSearchResults(response);
                setLoading(false);
            });
        }
    }, [executeSearch]);

    React.useEffect(() => {
        setSelected([]);
    }, [open]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Add members to compute project {computeProjectId}
            </DialogTitle>
            <DialogContent>
                <TextField
                    label="Search"
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        },
                        htmlInput: {
                            form: {
                                autocomplete: "off",
                            },
                        },
                    }}
                    autoComplete="off"
                    variant="outlined"
                    onChange={search}
                    fullWidth
                    value={searchString}
                    sx={{ mt: 3 }}
                />

                <List dense>
                    {selected.map((person: Person) => {
                        return (
                            <ListItem key={person._id} sx={{ py: 0 }}>
                                <ListItemButton
                                    onClick={() => togglePerson(person)}
                                >
                                    <ListItemIcon>
                                        <Checkbox edge="start" checked={true} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={personFullName(person)}
                                        secondary={person.username}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                    {selected.length > 0 && <Divider />}
                    <Box
                        sx={{
                            display: loading ? "block" : "none",
                            width: "100%",
                            mt: 1,
                        }}
                    >
                        <LoadingBar />
                    </Box>
                    <Box sx={{ display: loading ? "none" : "block" }}>
                        {searchResults
                            .filter(
                                (p) =>
                                    !selected
                                        .map((p2) => p2._id)
                                        .includes(p._id)
                            )
                            .map((person: Person) => {
                                return (
                                    <ListItem key={person._id} sx={{ py: 0 }}>
                                        <ListItemButton
                                            onClick={() => togglePerson(person)}
                                        >
                                            <ListItemIcon>
                                                <Checkbox edge="start" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={personFullName(person)}
                                                secondary={person.username}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                    </Box>
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    disabled={selected.length === 0}
                    onClick={() => addMembers(selected)}
                >
                    {selected.length === 0
                        ? "Add members"
                        : `Add ${selected.length} ${selected.length === 1 ? "member" : "members"}`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
