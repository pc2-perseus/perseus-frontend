// React imports
import React from "react";
import { Routes, Route } from "react-router-dom";

// Custom imports
import { NavigationItem } from "./components/DrawerNavigation.tsx";
import StateTasksOverview from "./components/states/StateTasksOverview.tsx";
import StateTask from "./components/states/StateTask.tsx";
import Service from "./components/services/Service.tsx";
import Dashboard from "./components/Dashboard.tsx";
import Settings from "./components/services/Settings.tsx";

export default function PageRouter({
    items,
}: {
    items: NavigationItem[];
}): React.ReactElement {
    return (
        <Routes>
            <Route path="" element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
            {items.map((item: NavigationItem) => {
                if (item.keyword?.startsWith("service")) {
                    return (
                        <React.Fragment key={"service-" + item.id}>
                            <Route
                                path={item.id}
                                element={
                                    <Service
                                        serviceId={item.id}
                                        keyword={item.keyword}
                                    />
                                }
                            />
                            <Route
                                path={item.id + "/:subPath"}
                                element={
                                    <Service
                                        serviceId={item.id}
                                        keyword={item.keyword}
                                    />
                                }
                            />
                        </React.Fragment>
                    );
                }
                return (
                    <React.Fragment key={item.id}>
                        <Route
                            path={item.id}
                            element={<StateTasksOverview stateId={item.id} />}
                        />
                        <Route
                            path={item.id + "/:projectId/:taskId"}
                            element={<StateTask stateId={item.id} />}
                        />
                    </React.Fragment>
                );
            })}
            <Route path="*" element={<h1>404 not found</h1>} />
        </Routes>
    );
}
