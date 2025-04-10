import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Error404 from "../Pages/Errors/Error404";

import ClientsAdd from "../Pages/SuperAdmin/Clients/ClientsAdd";
import ClientsList from "../Pages/SuperAdmin/Clients/ClientsList";
import Packages from "../Pages/SuperAdmin/Packages";
import SubscriptionList from "../Pages/SuperAdmin/Subscriptions";

const SuperAdminRoutes = ({ user }) => {
    const navigate = useNavigate();

    if (!user) {
        navigate("/");
    } else if (user.user_type !== "SuperAdmin") {
        return <Error404 />;
    }

    return (
        <Routes>
            <Route
                path="clients"
                element={
                    <ProtectedRoute element={<ClientsList />} user={user} />
                }
            />
            <Route
                path="clients-add"
                element={
                    <ProtectedRoute element={<ClientsAdd />} user={user} />
                }
            />
            <Route
                path="packages"
                element={<ProtectedRoute element={<Packages />} user={user} />}
            />
            <Route
                path="subscriptions"
                element={
                    <ProtectedRoute
                        element={<SubscriptionList />}
                        user={user}
                    />
                }
            />
        </Routes>
    );
};

export default SuperAdminRoutes;
