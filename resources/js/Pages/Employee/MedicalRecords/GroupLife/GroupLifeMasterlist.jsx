import React, { useState, useMemo, useEffect } from "react";
import { useParams } from 'react-router-dom';
import {
    Grid,
    Box,
    Typography,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    TablePagination,
    CircularProgress,
    Paper,
    Divider,
} from "@mui/material";
import Layout from "../../../../components/Layout/Layout";
import GroupLifeEmployeeTable from "./GroupLifeEmployeeTable";
import { useNavigate } from "react-router-dom";
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
// import useEmployeeGroupLifePlans from '../../../../hooks/useEmployeeGroupLifePlans';

const GroupLifeMasterlist = () => {
  const [plan, setPlan] = useState(null);
  const [dependents, setDependents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const storedUser = JSON.parse(localStorage.getItem("nasya_user"));
  const token = storedUser?.token;

  useEffect(() => {
    axiosInstance
      .get("/medicalRecords/getEmployeeGroupLifePlan", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("Group Life Plan Data:", res.data);
        setPlan(Array.isArray(res.data) ? res.data : [res.data]);
        // setPlan(res.data);
        console.log("PLAN", res.data)
        setDependents(res.data.dependents || []);
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          setError("Unauthorized: Access denied.");
        } else if (err.response?.status === 404) {
          setError("Plan not found.");
        } else {
          setError("Something went wrong.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={5}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

    const filteredRecords = plan
    .filter((plan) => [
        plan.id,
        plan.company_name,
        plan.plan_name,
        plan.plan_type,
        plan.employee_share,
        plan.employeer_share
        ].some((field) =>
            (typeof field === "number"
            ? field.toFixed(2)
            : (field ?? "").toString()
            )
            .toLowerCase()
            .includes(search.toLowerCase())
            )
        )

  const resultsCount = filteredRecords.length;

  // const [currentPage, setCurrentPage] = useState(0);
  // const [rowsPerPage, setRowsPerPage] = useState(10);

  // const paginatedRows = useMemo(() => {
  //     const startIndex = currentPage * rowsPerPage;
  //     return filteredRecords.slice(startIndex, startIndex + rowsPerPage);
  // }, [filteredRecords, currentPage, rowsPerPage]);

  return (
        <Layout title="Group Life Plans">
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}>
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1100px" } }}>
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>My Group Life Plans</Typography>
                    </Box>
                    <Box>
                        <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px'}}>
                            <FormControl variant="outlined" sx={{ width: 300, mb: 1 }}>
                                <InputLabel htmlFor="custom-search">
                                    Search
                                </InputLabel>
                                <OutlinedInput
                                    id="custom-search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    endAdornment={
                                    search && (
                                        <InputAdornment position="end">
                                            <Typography variant="body2" sx={{ color: "gray" }}>
                                                {resultsCount} {resultsCount === 1 ? "Match" : "Matches"}
                                            </Typography>
                                        </InputAdornment>
                                    )
                                    }
                                    label="Search"
                                />
                            </FormControl>
                        </Box>
                    </Box>
                    <Box sx={{ backgroundColor: "white", borderRadius: 2, padding: 2, mt: 3 }}>
                        <GroupLifeEmployeeTable
                            employees={plan}
                            // onRowClick={handleOnRowClick}
                            // search={search}
                            // loading={loading}
                            // data={rows}
                        />
                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                            {/* <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={filteredRecords.length}
                                rowsPerPage={rowsPerPage}
                                page={currentPage}
                                onPageChange={(event, newPage) => setCurrentPage(newPage)}
                                onRowsPerPageChange={(event) => {
                                    setRowsPerPage(parseInt(event.target.value, 10));
                                    setCurrentPage(0);
                                }}
                                sx={{
                                    ".MuiTablePagination-actions": { mb: 2 },
                                    ".MuiInputBase-root": { mb: 1 },
                                    bgcolor: "#ffffff",
                                    borderRadius: "8px",
                                    width: "fit-content",
                                    mt: 2
                                }}
                            /> */}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Layout>
    );
};

export default GroupLifeMasterlist;