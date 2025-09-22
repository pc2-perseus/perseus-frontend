// React imports
import React from "react";
import { Box, Skeleton } from "@mui/material";

export default function Image({
    ...props
}: React.ImgHTMLAttributes<HTMLImageElement>): React.ReactElement {
    const [loading, setLoading] = React.useState<boolean>(true);
    return (
        <Box
            sx={{
                position: "relative",
                height: props.height,
                width: props.width,
                overflow: "hidden",
            }}
        >
            {loading ? (
                <Skeleton
                    animation="pulse"
                    height="100%"
                    width="100%"
                    variant="rectangular"
                />
            ) : (
                ""
            )}
            <img alt={props.alt} {...props} onLoad={() => setLoading(false)} />
        </Box>
    );
}
