import Location from "./Location.ts";
import DatabaseItem from "./DatabaseItem.ts";

export default interface Organization extends DatabaseItem {
    name: string;
    secondary_names: string[];
    location: Location;
}
