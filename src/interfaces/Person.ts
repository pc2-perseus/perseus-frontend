import DatabaseItem from "./DatabaseItem";
import { Country } from "./Country.ts";
import Location from "./Location.ts";
import Identity from "./Identity.ts";

export default interface Person extends DatabaseItem {
    username: string | null;
    title: string | null;
    firstname: string;
    lastname: string;
    email: string;
    phone: string | null;
    homepage: string | null;
    nationalities: Country[];
    location: Location | null;
    identities: Identity[];
    orcid: string | null;
}
