import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box, Typography, Button, TextField, Grid, Table, TableHead, TableBody,
  TableCell, TableRow, TableContainer, Avatar, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Checkbox
} from "@mui/material";

import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import Layout from "../../../components/Layout/Layout";
import LoadingSpinner from "../../../components/LoadingStates/LoadingSpinner";
import Swal from "sweetalert2";

const Roles = () => {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("nasya_user");
  const headers = getJWTHeader(JSON.parse(storedUser));

  const [roles, setRoles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [newRole, setNewRole] = useState({
    name: "",
    can_approve_request: false,
    can_review_request: false,
    can_note_request: false,
    can_accept_request: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, empRes] = await Promise.all([
          axiosInstance.get("/settings/getEmployeeRoles", { headers }),
          axiosInstance.get("/employee/getEmployees", { headers })
        ]);
        setRoles(rolesRes.data.roles || []);
        setEmployees(empRes.data.employees || []);
      } catch (error) {
        Swal.fire({
          text: "Failed to load roles or employees!",
          icon: "error",
          confirmButtonColor: "#177604"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const getEmployeesByRole = (roleId) => {
    return employees.filter(emp => Number(emp.role_id) === Number(roleId));
  };

  const renderEmployeeAvatars = (roleId) => {
    const emps = getEmployeesByRole(roleId);

    if (emps.length === 0) {
      return (
        <Box display="flex" justifyContent="center">
          <Typography variant="caption" color="textSecondary">-</Typography>
        </Box>
      );
    }



    return (
      <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1}>
        {emps.map(emp => (
          <Tooltip 
            key={emp.id} 
            title={`${emp.first_name} ${emp.last_name}`} 
            arrow
          >
            {emp.avatar ? (
              <Avatar 
                src={`data:${emp.avatar_mime};base64,${emp.avatar}`}
                sx={{ width: 32, height: 32 }}
              />
            ) : (
              <Avatar sx={{ width: 32, height: 32 }}>
                {emp.first_name?.charAt(0)}{emp.last_name?.charAt(0)}
              </Avatar>
            )}
          </Tooltip>
        ))}
      </Box>
    );
  };

  const handleAddRole = async () => {
    if (!newRole.name) {
      Swal.fire({
        icon: "warning",
        text: "Please fill in the role name.",
        confirmButtonColor: "#177604"
      });
      return;
    }

    try {
      const res = await axiosInstance.post("/settings/addEmployeeRole", newRole, { headers });
      if (res.data.status === 200) {
        setRoles(prev => [...prev, res.data.role]);
        setOpenAddModal(false);
        setNewRole({
          name: "",
          can_approve_request: false,
          can_review_request: false,
          can_note_request: false,
          can_accept_request: false,
        });
        Swal.fire({
          icon: "success",
          text: "Role added successfully!",
          confirmButtonColor: "#177604"
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        text: "Failed to add role.",
        confirmButtonColor: "#177604"
      });
    }
  };

  return (
    <Layout title="Roles">
      <Box sx={{ overflowX: "auto", width: "100%" }}>
        <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
          <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Roles
            </Typography>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#177604" }}
              onClick={() => setOpenAddModal(true)}
            >
              <i className="fa fa-plus" style={{ marginRight: 8 }}></i> Add Role
            </Button>
          </Box>

          <Box sx={{ mt: 4, p: 3, bgcolor: "#ffffff", borderRadius: "8px" }}>
            <Grid container spacing={2} sx={{ pb: 4 }}>
              <Grid item xs={12} md={9}>
                <TextField
                  fullWidth
                  label="Search Role"
                  variant="outlined"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  InputProps={{
                    startAdornment: <i className="fa fa-search mr-2"></i>
                  }}
                />
              </Grid>
            </Grid>

            {isLoading ? <LoadingSpinner /> : (
              <TableContainer sx={{ maxHeight: 500 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>Role</TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>Employees</TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRoles.map(role => (
                      <TableRow
                        key={role.id}
                        hover
                        onClick={() => navigate(`/admin/roles/${role.id}`)}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell align="center">
                          <Typography fontWeight="medium">{role.name}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          {renderEmployeeAvatars(role.id)}
                        </TableCell>
                        <TableCell align="center">
                          {getEmployeesByRole(role.id).length}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>
      </Box>










      {/* Add Role Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Role</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Role Name"
            value={newRole.name}
            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 2 }}>
            {["approve", "review", "note", "accept"].map((perm) => (
              <Box key={perm} display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
                <Checkbox
                  checked={newRole[`can_${perm}_request`]}
                  onChange={(e) =>
                    setNewRole({ ...newRole, [`can_${perm}_request`]: e.target.checked })
                  }
                />
                <Typography>{perm.charAt(0).toUpperCase() + perm.slice(1)} Request</Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
          <Button
            onClick={handleAddRole}
            variant="contained"
            sx={{ backgroundColor: "#177604", "&:hover": { backgroundColor: "#126903" } }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Roles;