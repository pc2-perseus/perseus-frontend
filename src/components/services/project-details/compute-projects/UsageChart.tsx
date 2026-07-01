// React imports
import React from "react";

// MUI imports
import {
    Box,
    CircularProgress,
    Theme,
    Typography,
    useTheme,
} from "@mui/material";

// Custom imports
import ResourceUsage from "../../../../interfaces/ResourceUsage.ts";
import getUsageSeries from "../../../../api/project-details/getUsageSeries.ts";
import Resource from "../../../../interfaces/Resource.ts";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import formatNumber from "../../../../utils/formatNumber.ts";
import Cluster from "../../../../interfaces/Cluster.ts";
import usedContingent from "../../../../utils/usedContingent.ts";

export default function UsageChart({
    projectId,
    computeProjectId,
    resources,
    clusters,
}: {
    projectId: string;
    computeProjectId: string;
    resources: Resource[];
    clusters: Cluster[];
}): React.ReactElement {
    const [loading, setLoading] = React.useState<boolean>(true);
    const [usageData, setUsageData] = React.useState<ResourceUsage[] | null>(
        []
    );
    const [hiddenResources, setHiddenResources] = React.useState<string[]>([]);
    const [xData, setXData] = React.useState<Date[]>([]);
    const [yData, setYData] = React.useState<{
        leftStart: number | null;
        leftEnd: number | null;
        leftIds: string[];
        rightStart: number | null;
        rightEnd: number | null;
        rightIds: string[];
    }>({
        leftStart: 0,
        leftEnd: null,
        leftIds: [],
        rightStart: null,
        rightEnd: null,
        rightIds: [],
    });
    const [lineData, setLineData] = React.useState<
        { [key: string]: string | number | null }[]
    >([]);
    const [varianceItems, setVarianceItems] = React.useState<
        {
            resourceId: string;
            cleanMin: number;
            cleanMax: number;
        }[]
    >([]);

    const theme: Theme = useTheme();

    function toggleVisibleResources(resourceId: string) {
        if (hiddenResources.includes(resourceId)) {
            setHiddenResources(
                JSON.parse(
                    JSON.stringify(
                        hiddenResources.filter(
                            (item: string) => resourceId !== item
                        )
                    )
                )
            );
        } else {
            hiddenResources.push(resourceId);
            setHiddenResources(JSON.parse(JSON.stringify(hiddenResources)));
        }
    }

    function getResource(resourceId: string): Resource | null {
        let resource: Resource | null = null;
        resources.forEach((r: Resource) => {
            if (r.id === resourceId) {
                resource = r;
            }
        });
        return resource;
    }

    function getCluster(resourceId: string): Cluster | null {
        const resource: Resource | null = getResource(resourceId);
        if (resource === null) {
            return null;
        }
        let cluster: Cluster | null = null;
        clusters.forEach((c: Cluster) => {
            if (c.id === resource?.cluster_id) {
                cluster = c;
            }
        });
        return cluster;
    }

    // @ts-expect-error Type cannot be interpreted correctly
    function renderLegend({ payload }: unknown): React.ReactElement {
        const leftItems = payload?.filter(
            (entry: { payload: { yAxisId: string } }) =>
                entry.payload?.yAxisId === "yLeft"
        );
        const rightItems = payload?.filter(
            (entry: { payload: { yAxisId: string } }) =>
                entry.payload?.yAxisId === "yRight"
        );

        return (
            <Box
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0 20px",
                }}
            >
                <Box>
                    {leftItems?.map(
                        (entry: { color: string; value: string }) => {
                            const resource: Resource | null = getResource(
                                entry.value
                            );
                            const cluster: Cluster | null = getCluster(
                                entry.value
                            );
                            return (
                                <Box
                                    key={entry.value}
                                    style={{ color: entry.color }}
                                    onClick={() => {
                                        toggleVisibleResources(entry.value);
                                    }}
                                >
                                    <svg
                                        width="14"
                                        height="10"
                                        style={{ marginRight: 4 }}
                                    >
                                        <rect
                                            width="14"
                                            height="14"
                                            fill={entry.color}
                                        />
                                    </svg>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            textDecoration:
                                                hiddenResources.includes(
                                                    entry.value
                                                )
                                                    ? "line-through"
                                                    : undefined,
                                        }}
                                    >
                                        {cluster?.name}, {resource?.name}{" "}
                                        {resource?.display_unit === null ||
                                        resource?.display_unit === undefined ? (
                                            ""
                                        ) : (
                                            <>({resource?.display_unit})</>
                                        )}
                                    </Typography>
                                </Box>
                            );
                        }
                    )}
                </Box>
                <Box>
                    {rightItems?.map(
                        (entry: { color: string; value: string }) => {
                            const resource: Resource | null = getResource(
                                entry.value
                            );
                            const cluster: Cluster | null = getCluster(
                                entry.value
                            );
                            return (
                                <Box
                                    key={entry.value}
                                    style={{
                                        color: entry.color,
                                        textAlign: "right",
                                    }}
                                    onClick={() => {
                                        toggleVisibleResources(entry.value);
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            textDecoration:
                                                hiddenResources.includes(
                                                    entry.value
                                                )
                                                    ? "line-through"
                                                    : undefined,
                                        }}
                                    >
                                        {cluster?.name}, {resource?.name}{" "}
                                        {resource?.display_unit === null ||
                                        resource?.display_unit === undefined ? (
                                            ""
                                        ) : (
                                            <>({resource?.display_unit})</>
                                        )}
                                    </Typography>
                                    <svg
                                        width="14"
                                        height="10"
                                        style={{ marginLeft: 4 }}
                                    >
                                        <rect
                                            width="14"
                                            height="14"
                                            fill={entry.color}
                                        />
                                    </svg>
                                </Box>
                            );
                        }
                    )}
                </Box>
            </Box>
        );
    }

    function renderTooltip(data: unknown) {
        const payload: {
            color: string;
            dataKey: string;
            hide: boolean;
            payload: { [key: string]: string | number };
        }[] = (
            data as {
                payload: {
                    color: string;
                    dataKey: string;
                    hide: boolean;
                    payload: { [key: string]: string | number };
                }[];
            }
        ).payload;

        if (payload.length === 0) {
            return <></>;
        }

        const date: Date = xData[payload[0].payload.time as number];

        const day: string = date.getUTCDate().toString().padStart(2, "0");
        const month: string = (date.getUTCMonth() + 1)
            .toString()
            .padStart(2, "0");
        const year: string = date.getUTCFullYear().toString();

        return (
            <Box
                sx={{
                    backgroundColor: theme.palette.background.default,
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: theme.palette.text.disabled,
                    p: 1,
                    borderRadius: "4px",
                }}
            >
                <Box sx={{ fontSize: 14 }}>
                    {day}.{month}.{year}
                </Box>
                {payload.map((item) => {
                    const resource: Resource | null = getResource(item.dataKey);
                    const cluster: Cluster | null = getCluster(item.dataKey);
                    if (resource === null || cluster === null) {
                        return <></>;
                    }
                    return (
                        <Box
                            sx={{ color: item.color, fontSize: 14 }}
                            key={item.dataKey}
                        >
                            {cluster.name}, {resource.name}:{" "}
                            {formatNumber(item.payload[item.dataKey] as number)}
                            {resource.display_unit === null
                                ? ""
                                : " " + resource.display_unit}
                        </Box>
                    );
                })}
            </Box>
        );
    }

    function color(i: number): string {
        const colors: string[] = [
            "#e6194b",
            "#3cb44b",
            "#ffe119",
            "#0082c8",
            "#f58231",
            "#f032e6",
            "#008080",
            "#fabebe",
            "#aa6e28",
            "#aaffc3",
            "#000080",
            "#808000",
            "#808080",
            "#4B0082",
            "#800000",
            "#46f0f0",
            "#911eb4",
        ];
        return colors[i % colors.length];
    }

    React.useEffect(() => {
        getUsageSeries(projectId, computeProjectId).then(
            (used: ResourceUsage[] | null) => {
                setUsageData(used);
                setLoading(false);
            }
        );
    }, []);

    React.useEffect(() => {
        const allIds: string[] = [
            ...new Set(usageData?.map((item) => item.resource_id)),
        ];

        const xAxisData: Date[] = [
            ...new Set(
                usageData?.map((item: ResourceUsage) =>
                    new Date(item.end).valueOf()
                )
            ),
        ]
            .sort()
            .map((val: number) => new Date(val));

        const xAxisLookup: { [key: string]: number } = {};
        xAxisData.forEach((date: Date, index: number) => {
            xAxisLookup[date.valueOf().toString()] = index;
        });

        const resourceLookup: { [key: string]: Resource } = {};
        resources.forEach((resource: Resource) => {
            resourceLookup[resource.id] = resource;
        });

        const data: { [key: string]: string | number | null }[] = [];
        xAxisData.forEach((_date: Date, index: number) => {
            const newElement: { [key: string]: string | number | null } = {
                name: index.toString(),
                time: index,
            };
            allIds.forEach((resourceId: string) => {
                newElement[resourceId] = null;
            });
            data.push(newElement);
        });

        usageData?.forEach((item: ResourceUsage) => {
            const resource: Resource | undefined =
                resourceLookup[item.resource_id];
            if (resource !== undefined) {
                if (resource.resource_type === "snapshot") {
                    data[xAxisLookup[new Date(item.end).valueOf()]][
                        item.resource_id
                    ] = usedContingent(item) / resource.display_unit_factor;
                } else if (resource.resource_type === "cumulative") {
                    for (
                        let i: number =
                            xAxisLookup[new Date(item.end).valueOf()];
                        i < data.length;
                        i++
                    ) {
                        if (data[i][item.resource_id] === null) {
                            data[i][item.resource_id] =
                                usedContingent(item) /
                                resource.display_unit_factor;
                        } else {
                            (data[i][item.resource_id] as number) +=
                                usedContingent(item) /
                                resource.display_unit_factor;
                        }
                    }
                }
            }
        });

        const current: { [key: string]: number } = {};
        data.forEach((item, index: number) => {
            allIds.forEach((resourceId: string) => {
                if (
                    item[resourceId] === undefined ||
                    item[resourceId] === null
                ) {
                    if (current[resourceId] === undefined) {
                        current[resourceId] = 0;
                    }
                    data[index][resourceId] = current[resourceId];
                } else {
                    current[resourceId] = item[resourceId] as number;
                }
            });
        });

        const yAxisData: {
            leftStart: number | null;
            leftEnd: number | null;
            leftIds: string[];
            rightStart: number | null;
            rightEnd: number | null;
            rightIds: string[];
        } = {
            leftStart: 0,
            leftEnd: null,
            leftIds: [],
            rightStart: null,
            rightEnd: null,
            rightIds: [],
        };

        const usageUnits = allIds.map((resourceId: string) => {
            const values: number[] = data.map(
                (item) => item[resourceId] as number
            );
            return {
                resourceId: resourceId,
                cleanMin: Math.min(...values),
                cleanMax: Math.max(...values),
            };
        });

        if (usageUnits.length === 1) {
            yAxisData.leftIds.push(usageUnits[0].resourceId);
        } else if (usageUnits.length === 2) {
            yAxisData.leftIds.push(usageUnits[0].resourceId);
            yAxisData.rightIds.push(usageUnits[1].resourceId);
        } else if (usageUnits.length > 2) {
            usageUnits.sort(
                (x, y) => x.cleanMax - x.cleanMin - (y.cleanMax - y.cleanMin)
            );
            const splitResults: { index: number; variance: number }[] = [];
            for (let i: number = 0; i < usageUnits.length - 2; i++) {
                const left: number =
                    (usageUnits[0].cleanMax - usageUnits[0].cleanMin) /
                    (usageUnits[i].cleanMax - usageUnits[i].cleanMin);
                const right: number =
                    (usageUnits[i + 1].cleanMax - usageUnits[i + 1].cleanMin) /
                    (usageUnits[usageUnits.length - 1].cleanMax -
                        usageUnits[usageUnits.length - 1].cleanMin);
                splitResults.push({
                    index: i,
                    variance: Math.abs(left - right),
                });
            }
            const splitIndex: number = splitResults.reduce((a, b) =>
                b.variance < a.variance ? b : a
            ).index;
            yAxisData.leftIds.push(
                ...usageUnits
                    .slice(0, splitIndex + 1)
                    .map((item) => item.resourceId)
            );
            yAxisData.rightIds.push(
                ...usageUnits
                    .slice(splitIndex + 1)
                    .map((item) => item.resourceId)
            );
        }

        if (yAxisData.leftIds.length > 1) {
            hiddenResources.push(...yAxisData.leftIds.slice(1));
        }
        if (yAxisData.rightIds.length > 1) {
            hiddenResources.push(...yAxisData.rightIds.slice(1));
        }

        setXData(xAxisData);
        setYData(yAxisData);
        setLineData(data);
        setVarianceItems(usageUnits);
    }, [usageData]);

    if (loading) {
        return (
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (usageData !== null && usageData.length < 2) {
        return (
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <i>not enough data available</i>
            </Box>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                width={500}
                height={300}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <XAxis
                    interval="preserveStartEnd"
                    type="number"
                    dataKey="time"
                    tickMargin={10}
                    domain={["dataMin", "dataMax"]}
                    stroke={theme.palette.text.primary}
                    ticks={
                        xData.length > 3
                            ? [
                                  0,
                                  Math.round((xData.length - 1) * 0.33),
                                  Math.round((xData.length - 1) * 0.67),
                                  xData.length - 1,
                              ]
                            : [0, xData.length - 1]
                    }
                    tick={(props) => {
                        const { x, y, payload } = props;
                        const date: Date = xData[Math.floor(payload.value)];

                        const day: string = date
                            .getUTCDate()
                            .toString()
                            .padStart(2, "0");
                        const month: string = (date.getUTCMonth() + 1)
                            .toString()
                            .padStart(2, "0");
                        const year: string = date.getUTCFullYear().toString();

                        return (
                            <text
                                x={x}
                                y={y + 10}
                                textAnchor="middle"
                                fill={theme.palette.text.primary}
                            >
                                {day}.{month}.{year}
                            </text>
                        );
                    }}
                />
                <YAxis
                    stroke={theme.palette.text.primary}
                    orientation="left"
                    yAxisId="yLeft"
                    allowDataOverflow={true}
                    domain={() => {
                        const max: number = Math.max(
                            ...varianceItems
                                .filter(
                                    (item) =>
                                        !hiddenResources.includes(
                                            item.resourceId
                                        ) &&
                                        yData.leftIds.includes(item.resourceId)
                                )
                                .map((item) => item.cleanMax)
                        );
                        return [
                            Math.floor(
                                Math.min(
                                    ...varianceItems
                                        .filter(
                                            (item) =>
                                                !hiddenResources.includes(
                                                    item.resourceId
                                                ) &&
                                                yData.leftIds.includes(
                                                    item.resourceId
                                                )
                                        )
                                        .map((item) => item.cleanMin)
                                )
                            ),
                            max > 1
                                ? Math.ceil(max)
                                : Math.ceil(max * 100) / 100,
                        ];
                    }}
                />
                <YAxis
                    stroke={theme.palette.text.primary}
                    orientation="right"
                    yAxisId="yRight"
                    allowDataOverflow={true}
                    domain={() => {
                        const max: number = Math.max(
                            ...varianceItems
                                .filter(
                                    (item) =>
                                        !hiddenResources.includes(
                                            item.resourceId
                                        ) &&
                                        yData.rightIds.includes(item.resourceId)
                                )
                                .map((item) => item.cleanMax)
                        );
                        return [
                            Math.floor(
                                Math.min(
                                    ...varianceItems
                                        .filter(
                                            (item) =>
                                                !hiddenResources.includes(
                                                    item.resourceId
                                                ) &&
                                                yData.rightIds.includes(
                                                    item.resourceId
                                                )
                                        )
                                        .map((item) => item.cleanMin)
                                )
                            ),
                            max > 1
                                ? Math.ceil(max)
                                : Math.ceil(max * 100) / 100,
                        ];
                    }}
                />
                <Tooltip
                    formatter={(value, name) => [
                        Math.round((value as number) * 100) / 100,
                        getResource(name as string)?.name,
                    ]}
                    content={renderTooltip}
                />
                <Legend content={renderLegend} />

                {[...yData.leftIds, ...yData.rightIds].map(
                    (resourceId: string, index: number) => {
                        return (
                            <Line
                                dot={false}
                                activeDot={{ r: 0 }}
                                yAxisId={
                                    yData.leftIds.includes(resourceId)
                                        ? "yLeft"
                                        : "yRight"
                                }
                                dataKey={resourceId}
                                data={lineData}
                                name={resourceId}
                                key={resourceId}
                                stroke={color(index)}
                                hide={hiddenResources.includes(resourceId)}
                            />
                        );
                    }
                )}
            </LineChart>
        </ResponsiveContainer>
    );
}
