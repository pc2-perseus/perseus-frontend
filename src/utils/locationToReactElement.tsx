// React imports
import React from "react";

// Custom imports
import Location from "../interfaces/Location.ts";

export default function locationToReactElement(
    location: Location
): React.ReactElement {
    const items: string[] = [];
    if (location.street !== null) {
        items.push(location.street);
    }
    if (location.postal_code !== null && location.city !== undefined) {
        items.push(location.postal_code + " " + location.city);
    } else if (location.postal_code !== null) {
        items.push(location.postal_code);
    } else if (location.city !== null) {
        items.push(location.city);
    }
    if (location.state !== null) {
        items.push(location.state);
    }
    if (location.country !== null) {
        items.push(location.country);
    }
    return (
        <>
            {items.map((item: string, index: number) => {
                if (index === 0) {
                    return item;
                } else {
                    return (
                        <>
                            <br />
                            {item}
                        </>
                    );
                }
            })}
        </>
    );
}
