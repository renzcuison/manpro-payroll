import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosConfig";

const useEmployeeGroupLifePlans = (token) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        setError(null);

        axiosInstance
            .get("/medicalRecords/getEmployeeGroupLifePlans", {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                setPlans(res.data.plans || []);
            })
            .catch(err => {
                setError(err);
            })
            .finally(() => setLoading(false));
    }, [token]);

    return { plans, loading, error };
};

export default useEmployeeGroupLifePlans;