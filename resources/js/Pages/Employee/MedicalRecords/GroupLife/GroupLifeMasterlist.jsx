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
import GroupLifePlanEdit from "./Modal/GroupLifePlanEdit";
import { useNavigate } from "react-router-dom";
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
// import useEmployeeGroupLifePlans from '../../../../hooks/useEmployeeGroupLifePlans';

const GroupLifeMasterlist = () => {

  const [plan, setPlan] = useState([]);
  const [dependents, setDependents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const storedUser = JSON.parse(localStorage.getItem("nasya_user"));
  const token = storedUser?.token;
  const [selectedEmployeePlanId, setSelectedEmployeePlanId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);


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

  const filteredRecords = plan
    .filter((plan) => [
      plan.id,
      plan.company_name,
      plan.plan_name,
      plan.dependents_count,
      plan.plan_type,
      plan.employee_share,
      plan.employer_share
    ].some((field) =>
      (typeof field === "number"
        ? field.toFixed(2)
        : (field ?? "").toString()
      )
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    )

  const paginatedRows = filteredRecords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const resultsCount = filteredRecords.length;

  const handleRowClick = (plan) => {
    console.log("🔍 Clicked Plan ID:", plan);
    setSelectedEmployeePlanId(plan.id);
    setOpenModal(true);
  };


  return (
    <Layout title="Group Life Plans">
      <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}>
        <Box sx={{ mx: "auto", width: { xs: "100%", md: "1100px" } }}>
          <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>My Group Life Plans</Typography>
          </Box>
          <Box>
            <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
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
              employees={paginatedRows}
              search={search}
              onRowClick={handleRowClick}
              loading={loading}
            />
            <TablePagination
              component="div"
              count={filteredRecords.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <GroupLifePlanEdit
                open={openModal}
                close={setOpenModal}
                employeePlanId={selectedEmployeePlanId}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default GroupLifeMasterlist;