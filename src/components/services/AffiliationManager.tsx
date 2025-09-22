// React imports
import React from "react";

// MUI imports
import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view";

// Icon imports
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import MergeIcon from "@mui/icons-material/Merge";

// Custom imports
import Organization from "../../interfaces/Organization.ts";
import Institute from "../../interfaces/Institute.ts";
import getAffiliations from "../../api/getAffiliations.ts";
import locationToReactElement from "../../utils/locationToReactElement.tsx";
import getCountries from "../../api/getCountries.ts";
import postAffiliationOrganization from "../../api/postAffiliationOrganization.ts";
import postAffiliationInstitute from "../../api/postAffiliationInstitute.ts";
import postAffiliationInstituteMerge from "../../api/postAffiliationInstituteMerge.ts";
import { Country } from "../../interfaces/Country.ts";
import LoadingBar from "../LoadingBar.tsx";
import SearchBar from "../SearchBar.tsx";

export default function AffiliationManager(): React.ReactElement {
    const [loading, setLoading] = React.useState<boolean>(true);
    const [affiliations, setAffiliations] = React.useState<
        { organization: Organization; institutes: Institute[] }[]
    >([]);
    const [searchFilter, setSearchFilter] = React.useState<string>("");

    const [organizationEdit, setOrganizationEdit] =
        React.useState<Organization | null>(null);
    const [instituteEdit, setInstituteEdit] = React.useState<Institute | null>(
        null
    );
    const [availableCountries, setAvailableCountries] = React.useState<
        { label: string; value: string }[]
    >([]);
    const [mergeInstitute, setMergeInstitute] = React.useState<null | string>(
        null
    );
    const [instituteAction, setInstituteAction] = React.useState<
        "new" | "edit" | "merge"
    >("edit");

    function editOrganization() {
        if (organizationEdit !== null) {
            setLoading(true);
            postAffiliationOrganization(organizationEdit).then((result) => {
                if (result) {
                    getAffiliations().then((result2) => {
                        setAffiliations(result2);
                        setOrganizationEdit(null);
                        setLoading(false);
                    });
                } else {
                    setLoading(false);
                }
            });
        }
    }

    function editInstitute() {
        if (instituteAction === "edit" || instituteAction === "new") {
            if (instituteEdit !== null) {
                setLoading(true);
                postAffiliationInstitute(instituteEdit).then((result) => {
                    if (result) {
                        getAffiliations().then((result2) => {
                            setAffiliations(result2);
                            setInstituteEdit(null);
                            setLoading(false);
                        });
                    } else {
                        setLoading(false);
                    }
                });
            }
        } else {
            if (instituteEdit !== null && mergeInstitute !== null) {
                setLoading(true);
                postAffiliationInstituteMerge(
                    instituteEdit,
                    mergeInstitute
                ).then((result) => {
                    if (result) {
                        getAffiliations().then((result2) => {
                            setAffiliations(result2);
                            setInstituteEdit(null);
                            setInstituteAction("edit");
                            setLoading(false);
                        });
                    } else {
                        setLoading(false);
                    }
                });
            }
        }
    }

    React.useEffect(() => {
        getAffiliations().then((result) => {
            setAffiliations(result);
            setLoading(false);
        });
        getCountries().then((result) =>
            setAvailableCountries(
                result.map((r) => {
                    return { label: r.name, value: r.iso_code };
                })
            )
        );
    }, []);

    if (loading) {
        return <LoadingBar />;
    }

    const filteredAffiliations = affiliations.filter((affiliation) => {
        return (
            affiliation.organization.name
                .toLowerCase()
                .includes(searchFilter) ||
            affiliation.organization.secondary_names.some((n) =>
                n.toLowerCase().includes(searchFilter)
            ) ||
            affiliation.institutes.some(
                (i) =>
                    i.name.toLowerCase().includes(searchFilter) ||
                    i.secondary_names.some((ni) =>
                        ni.toLowerCase().includes(searchFilter)
                    )
            )
        );
    });

    return (
        <Box>
            <SearchBar
                onSearch={(value: string) =>
                    setSearchFilter(value.toLowerCase())
                }
                actionTitle="Add organization"
                actionIcon={<AddIcon />}
                onAction={() => {
                    setOrganizationEdit({
                        _id: null,
                        files: {},
                        file_tags: {},
                        name: "",
                        secondary_names: [],
                        location: {
                            _id: null,
                            files: {},
                            file_tags: {},
                            street: null,
                            postal_code: null,
                            city: null,
                            state: null,
                            country: "DE",
                        },
                    });
                }}
            />

            <Stack spacing={1} sx={{ mt: 2 }}>
                {filteredAffiliations.map((affiliation, index: number) => {
                    return (
                        <Paper elevation={16} sx={{ p: 2 }} key={index}>
                            <Typography
                                variant="h5"
                                component="span"
                                gutterBottom
                            >
                                {affiliation.organization.name}
                            </Typography>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => {
                                    setOrganizationEdit(
                                        JSON.parse(
                                            JSON.stringify(
                                                affiliation.organization
                                            )
                                        )
                                    );
                                }}
                                sx={{ float: "right" }}
                            >
                                <EditIcon />
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => {
                                    setInstituteAction("new");
                                    setInstituteEdit({
                                        name: "",
                                        secondary_names: [],
                                        organization_id: affiliation
                                            .organization._id
                                            ? affiliation.organization._id
                                            : "",
                                    });
                                }}
                                sx={{ float: "right", mx: 1 }}
                            >
                                <AddIcon />
                            </Button>
                            <SimpleTreeView disableSelection sx={{ mt: 2 }}>
                                <TreeItem
                                    itemId={index.toString() + "-location"}
                                    label="Location"
                                >
                                    <Box sx={{ pl: 3 }}>
                                        {locationToReactElement(
                                            affiliation.organization.location
                                        )}
                                    </Box>
                                </TreeItem>
                                {affiliation.institutes.length === 0 ? (
                                    ""
                                ) : (
                                    <TreeItem
                                        itemId={
                                            index.toString() + "-institutes"
                                        }
                                        label="Institutes"
                                    >
                                        {affiliation.institutes.map(
                                            (institute, index2: number) => {
                                                return (
                                                    <TreeItem
                                                        itemId={
                                                            index.toString() +
                                                            "-institutes-" +
                                                            index2.toString()
                                                        }
                                                        key={index2}
                                                        onClick={() => {
                                                            setInstituteAction(
                                                                "edit"
                                                            );
                                                            setInstituteEdit(
                                                                JSON.parse(
                                                                    JSON.stringify(
                                                                        institute
                                                                    )
                                                                )
                                                            );
                                                        }}
                                                        label={institute.name}
                                                    />
                                                );
                                            }
                                        )}
                                    </TreeItem>
                                )}
                            </SimpleTreeView>
                        </Paper>
                    );
                })}
            </Stack>
            <Dialog
                open={organizationEdit !== null}
                onClose={() => {
                    setOrganizationEdit(null);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {organizationEdit?._id === null
                        ? "Add organization"
                        : "Edit organization"}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <TextField
                            variant="outlined"
                            label="Primary name"
                            value={
                                organizationEdit?.name
                                    ? organizationEdit?.name
                                    : ""
                            }
                            onChange={(e) => {
                                if (organizationEdit !== null) {
                                    organizationEdit.name =
                                        e.currentTarget.value;
                                    setOrganizationEdit(
                                        JSON.parse(
                                            JSON.stringify(organizationEdit)
                                        )
                                    );
                                }
                            }}
                        />
                        <Autocomplete
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Secondary names"
                                    helperText="Press enter to add a new name"
                                />
                            )}
                            options={[]}
                            freeSolo
                            defaultValue={organizationEdit?.secondary_names}
                            fullWidth
                            multiple
                            onChange={(_, values) => {
                                if (values !== null) {
                                    if (organizationEdit !== null) {
                                        organizationEdit.secondary_names =
                                            values;
                                        setOrganizationEdit(
                                            JSON.parse(
                                                JSON.stringify(organizationEdit)
                                            )
                                        );
                                    }
                                }
                            }}
                        />
                        <TextField
                            variant="outlined"
                            label="Street"
                            value={
                                organizationEdit?.location.street
                                    ? organizationEdit?.location.street
                                    : ""
                            }
                            onChange={(e) => {
                                if (organizationEdit !== null) {
                                    organizationEdit.location.street =
                                        e.currentTarget.value;
                                    setOrganizationEdit(
                                        JSON.parse(
                                            JSON.stringify(organizationEdit)
                                        )
                                    );
                                }
                            }}
                        />
                        <TextField
                            variant="outlined"
                            label="Postal code"
                            value={
                                organizationEdit?.location.postal_code
                                    ? organizationEdit?.location.postal_code
                                    : ""
                            }
                            onChange={(e) => {
                                if (organizationEdit !== null) {
                                    organizationEdit.location.postal_code =
                                        e.currentTarget.value;
                                    setOrganizationEdit(
                                        JSON.parse(
                                            JSON.stringify(organizationEdit)
                                        )
                                    );
                                }
                            }}
                        />
                        <TextField
                            variant="outlined"
                            label="City"
                            value={
                                organizationEdit?.location.city
                                    ? organizationEdit?.location.city
                                    : ""
                            }
                            onChange={(e) => {
                                if (organizationEdit !== null) {
                                    organizationEdit.location.city =
                                        e.currentTarget.value;
                                    setOrganizationEdit(
                                        JSON.parse(
                                            JSON.stringify(organizationEdit)
                                        )
                                    );
                                }
                            }}
                        />
                        <TextField
                            variant="outlined"
                            label="State"
                            value={
                                organizationEdit?.location.state
                                    ? organizationEdit?.location.state
                                    : ""
                            }
                            onChange={(e) => {
                                if (organizationEdit !== null) {
                                    organizationEdit.location.state =
                                        e.currentTarget.value;
                                    setOrganizationEdit(
                                        JSON.parse(
                                            JSON.stringify(organizationEdit)
                                        )
                                    );
                                }
                            }}
                        />
                        <Autocomplete
                            renderInput={(params) => (
                                <TextField label="Country" {...params} />
                            )}
                            options={availableCountries}
                            getOptionLabel={(option) => option.label}
                            isOptionEqualToValue={(o, v) => o.value === v.value}
                            fullWidth
                            defaultValue={{
                                value: organizationEdit?.location.country
                                    ? organizationEdit?.location.country
                                    : "",
                                label: availableCountries.filter(
                                    (c) =>
                                        c.value ===
                                        organizationEdit?.location.country
                                )[0]?.label,
                            }}
                            onChange={(_, value) => {
                                if (value !== null) {
                                    if (organizationEdit !== null) {
                                        organizationEdit.location.country =
                                            value.value as Country;
                                        setOrganizationEdit(
                                            JSON.parse(
                                                JSON.stringify(organizationEdit)
                                            )
                                        );
                                    }
                                }
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setOrganizationEdit(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={editOrganization}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={instituteEdit !== null}
                onClose={() => {
                    setInstituteEdit(null);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {instituteAction === "edit"
                        ? "Edit institute"
                        : instituteAction === "new"
                          ? "Add institute"
                          : "Merge institute"}
                </DialogTitle>
                {instituteAction !== "new" && (
                    <ToggleButtonGroup
                        value={instituteAction}
                        onChange={(_, value) => {
                            if (value !== null) {
                                setInstituteAction(value);
                            }
                        }}
                        exclusive
                        sx={{ position: "absolute", right: 5, top: 5 }}
                    >
                        <ToggleButton value="edit">
                            <EditIcon />
                        </ToggleButton>
                        <ToggleButton value="merge">
                            <MergeIcon />
                        </ToggleButton>
                    </ToggleButtonGroup>
                )}
                <DialogContent>
                    <Stack
                        spacing={2}
                        sx={{
                            mt: 2,
                            display:
                                instituteAction === "edit" ||
                                instituteAction === "new"
                                    ? undefined
                                    : "none",
                        }}
                    >
                        <TextField
                            variant="outlined"
                            label="Organization"
                            value={
                                affiliations?.filter(
                                    (a) =>
                                        a.organization._id ===
                                        instituteEdit?.organization_id
                                )[0]?.organization.name
                            }
                            disabled
                        />
                        <TextField
                            variant="outlined"
                            label="Primary name"
                            value={
                                instituteEdit?.name ? instituteEdit?.name : ""
                            }
                            onChange={(e) => {
                                if (instituteEdit !== null) {
                                    instituteEdit.name = e.currentTarget.value;
                                    setInstituteEdit(
                                        JSON.parse(
                                            JSON.stringify(instituteEdit)
                                        )
                                    );
                                }
                            }}
                        />
                        <Autocomplete
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Secondary names"
                                    helperText="Press enter to add a new name"
                                />
                            )}
                            options={[]}
                            freeSolo
                            defaultValue={instituteEdit?.secondary_names}
                            fullWidth
                            multiple
                            onChange={(_, values) => {
                                if (values !== null) {
                                    if (instituteEdit !== null) {
                                        instituteEdit.secondary_names = values;
                                        setInstituteEdit(
                                            JSON.parse(
                                                JSON.stringify(instituteEdit)
                                            )
                                        );
                                    }
                                }
                            }}
                        />
                    </Stack>
                    <Stack
                        spacing={2}
                        sx={{
                            mt: 2,
                            display:
                                instituteAction === "merge"
                                    ? undefined
                                    : "none",
                        }}
                    >
                        <TextField
                            variant="outlined"
                            label="Name"
                            value={instituteEdit?.name}
                            disabled
                        />
                        <Autocomplete
                            renderInput={(params) => (
                                <TextField label="Merge into" {...params} />
                            )}
                            options={
                                affiliations.length > 0
                                    ? affiliations
                                          .filter(
                                              (a) =>
                                                  a.organization._id ===
                                                  instituteEdit?.organization_id
                                          )[0]
                                          ?.institutes.filter(
                                              (i) =>
                                                  i._id !== instituteEdit?._id
                                          )
                                          .map((i) => {
                                              return {
                                                  label: i.name,
                                                  value: i._id ? i._id : null,
                                              };
                                          })
                                    : []
                            }
                            getOptionLabel={(option) => option.label}
                            isOptionEqualToValue={(o, v) => o.value === v.value}
                            fullWidth
                            onChange={(_, value) => {
                                setMergeInstitute(
                                    value === null ? null : value.value
                                );
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setInstituteEdit(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={editInstitute}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
