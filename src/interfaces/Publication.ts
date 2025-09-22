import DatabaseItem from "./DatabaseItem.ts";
import { PublicationType } from "./PublicationType.ts";
import PublicationDetails from "./PublicationDetails.ts";

export default interface Publication extends DatabaseItem {
    type: PublicationType;
    content: string;
    details: PublicationDetails[];
}
