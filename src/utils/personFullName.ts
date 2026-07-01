import Person from "../interfaces/Person.ts";

export default function personFullName(person: Person): string {
    return `${person.title === null ? "" : `${person.title} `}${person.firstname} ${person.lastname}`;
}
