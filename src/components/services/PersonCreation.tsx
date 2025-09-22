// React imports
import React from "react";

// MUI imports
import { Autocomplete, Button, Stack, TextField } from "@mui/material";

// Other imports
import postPersonCreate from "../../api/postPersonCreate.ts";
import getPersonCreateOptions from "../../api/getPersonCreateOptions.ts";

export default function PersonCreation(): React.ReactElement {
    const [title, setTitle] = React.useState<string>("");
    const [username, setUsername] = React.useState<string>("");
    const [firstname, setFirstname] = React.useState<string>("");
    const [lastname, setLastname] = React.useState<string>("");
    const [email, setEmail] = React.useState<string>("");
    const [phone, setPhone] = React.useState<string>("");
    const [homepage, setHomepage] = React.useState<string>("");
    const [nationalities, setNationalities] = React.useState<string[]>([]);
    const [cor, setCor] = React.useState<string>("");

    const [availableCountries, setAvailableCountries] = React.useState<
        { label: string; value: string }[]
    >([]);

    function createPerson() {
        if (firstname !== "" && lastname !== "" && email !== "") {
            postPersonCreate(
                username,
                title,
                firstname,
                lastname,
                email,
                phone,
                homepage,
                nationalities,
                cor
            ).then((oid) => {
                if (oid !== null) {
                    window.location.href = `${import.meta.env.BASE_URL}PersonSearch/${oid}`;
                }
            });
        }
    }

    React.useEffect(() => {
        getPersonCreateOptions().then((result) => {
            setAvailableCountries(result);
        });
    }, []);

    return (
        <>
            <Stack spacing={2}>
                <TextField
                    variant="outlined"
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.currentTarget.value)}
                    fullWidth
                />
                <TextField
                    variant="outlined"
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.currentTarget.value)}
                    fullWidth
                />
                <TextField
                    variant="outlined"
                    label="Firstname"
                    value={firstname}
                    onChange={(e) => setFirstname(e.currentTarget.value)}
                    fullWidth
                />
                <TextField
                    variant="outlined"
                    label="Lastname"
                    value={lastname}
                    onChange={(e) => setLastname(e.currentTarget.value)}
                    fullWidth
                />
                <TextField
                    variant="outlined"
                    type="email"
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    fullWidth
                />
                <TextField
                    variant="outlined"
                    type="tel"
                    label="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.currentTarget.value)}
                    fullWidth
                />
                <TextField
                    variant="outlined"
                    type="url"
                    label="Homepage"
                    value={homepage}
                    onChange={(e) => setHomepage(e.currentTarget.value)}
                    fullWidth
                />
                <Autocomplete
                    renderInput={(params) => (
                        <TextField label="Country of residence" {...params} />
                    )}
                    options={availableCountries}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(o, v) => o.value === v.value}
                    fullWidth
                    onChange={(_, value) => {
                        if (value !== null) {
                            setCor(value.value);
                        }
                    }}
                />
                <Autocomplete
                    renderInput={(params) => (
                        <TextField {...params} label="Nationalities" />
                    )}
                    options={availableCountries}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(o, v) => o.value === v.value}
                    fullWidth
                    multiple
                    onChange={(_, values) => {
                        if (values !== null) {
                            setNationalities(values.map((v) => v.value));
                        }
                    }}
                />
            </Stack>
            <Button
                variant="contained"
                onClick={createPerson}
                sx={{ float: "right", mt: 2 }}
            >
                Add person
            </Button>
        </>
    );
}
