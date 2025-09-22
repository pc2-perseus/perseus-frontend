import { Country } from "./Country.ts";
import DatabaseItem from "./DatabaseItem.ts";

export default interface Location extends DatabaseItem {
    country: Country;
    state: string | null;
    postal_code: string | null;
    city: string | null;
    street: string | null;
}
