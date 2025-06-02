import React, { useEffect, useState } from "react";
import { Box,Typography,Button,TextField,Dialog,DialogTitle,DialogContent,Chip,ListItemText,Checkbox,Menu,MenuItem,IconButton,Divider,
Grid,FormGroup,FormControl,} from "@mui/material";
import axiosInstance,{ getJWTHeader }  from "../../../../utils/axiosConfig";
import Swal from "sweetalert2";

const DepartmentEdit = ({open, close, departmentId}) =>{
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [nameError, setNameError] = useState(false);
    const [acronymError, setAcronymError] = useState(false);
    const [name, setName] = useState("");
    const [acronym, setAcronym] = useState("");
    const [description, setDescription] = useState("");
    const [employees, setEmployees] = useState([]);
    const [initAssignments, setInitAssignments] = useState({}); //original assignments <will be used for the backend>
    const [assignments, setAssignments] = useState({}); // structure be like: {position_id: [emp_id, ...]}
    const [positions, setPosition] = useState([]);    
    //fetching data
    useEffect(() => {
        getDepartmentDetails();
        getEmployees();
    }, [])

    console.log(employees);

    const getDepartmentDetails = () => {
        axiosInstance.get(`/settings/getDepartmentDetails/${departmentId}`, { headers })
            .then((response) => {
                if(response.status === 200){
                    const existingDetails = response.data.department;
                    setName(existingDetails.name);
                    setAcronym(existingDetails.acronym);
                    setDescription(existingDetails.description);
                    if (existingDetails.assigned_positions) {
                        const loadedAssignments = {};
                        existingDetails.assigned_positions.forEach((posAssignment) => {
                            const positionId = posAssignment.department_position_id;
                            const employeeIds = posAssignment.employee_assignments
                                ? posAssignment.employee_assignments.map(ea => ea.employee.id)
                                : [];
                            loadedAssignments[positionId] = employeeIds;

                        });
                        setAssignments(loadedAssignments);
                        setInitAssignments(loadedAssignments);
                    }
                }
        });
    }
    const getEmployees = () => {
        axiosInstance.get('/employee/getEmployees', { headers })
            .then((response) => {
                if(response.status === 200){
                    const employee = response.data.employees;
                    setEmployees(employee);    
                }
                else{
                    setEmployees(null);
                }
            }).catch((error) => {
                console.error('Error fetching employees:', error);
                setEmployees(null);
            });

        axiosInstance.get('/settings/getDepartmentPositions', { headers })
            .then((response) => {
                if(response.status === 200){
                    const position = response.data.positions;
                    setPosition(position);    
                }
                else{
                    setPosition(null);
                }
            }).catch((error) => {
                console.error('Error fetching positions:', error);
                setPosition(null);
            });

    }

    const handleAssignChange = (position_id) => (event) => {
        const selected = event.target.value; //employee id arrays
        const updatedAssignments = {};

        //explanation --> if there exist the same employee when assigning to a new position, remove their id from that position, ensuring they can only be assigned to one position
        for(const pos of positions){
            const pos_id = pos.id; //extract id from the position useState array
            if(pos_id === position_id){
                updatedAssignments[pos_id] = selected;
            }
            else{
                updatedAssignments[pos_id] = (assignments[pos_id] || []).filter(emp_id => !selected.includes(emp_id))
            }
        }
        setAssignments(updatedAssignments);
    }
    //create json on which data to create, updat or delete <Used in saveInput>
    const generateAssignmentChanges = () => {
        const changes = {
          assignment_add: {},
          assignment_update: {},
          assignment_delete: {},
        };
      
        for (const posId in assignments) {
          const current = assignments[posId];
          const original = initAssignments[posId] || [];
      
          // Added employees
          const added = current.filter(id => !original.includes(id));
          if (added.length > 0) {
            changes.assignment_add[posId] = added;
          }
      
          // Removed employees
          const removed = original.filter(id => !current.includes(id));
          if (removed.length > 0) {
            changes.assignment_delete[posId] = removed;
          }
      
          // Modified assignments (e.g., updated members)
          if (added.length === 0 && removed.length === 0 && current.length > 0) {
            changes.assignment_update[posId] = current;
          }
        }
      
        return changes;
      };

    // Add New Department to the Backend functions
    const checkInput = (event) => {
        event.preventDefault();

        setNameError(!name);
        setAcronymError(!acronym);

        if (!name || !acronym) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "This department will be updated",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Update",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    saveInput(event);
                }
            });
        }
    };

    const saveInput = (event) => {
        event.preventDefault();

        const changes = generateAssignmentChanges();
        const data = {
            name: name,
            acronym: acronym,
            description: description,
            assignments: assignments,
            ...changes
        };

        console.log(changes.assignment_add);
        console.log(changes.assignment_update);

        axiosInstance.post(`/settings/updateDepartment/${departmentId}`, data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Department saved successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        close(true);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Error saving department!",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            });
    };

    return(
        <>
            <Dialog
                open={open}
                onClose={() => close(false)}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                        borderRadius: '20px',
                        minWidth: '800px',
                        maxWidth: '1000px',
                        marginBottom: '5%'
                    }
                }}
            >
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Add New Department </Typography>
                        <IconButton onClick={() => close(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                marginBottom: 3, width: '66%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="name"
                                    label="Name"
                                    variant="outlined"
                                    value={name}
                                    error={nameError}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{
                                marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="acronym"
                                    label="Acronym"
                                    variant="outlined"
                                    value={acronym}
                                    error={acronymError}
                                    onChange={(e) => setAcronym(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    id="description"
                                    label="Description"
                                    variant="outlined"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    multiline
                                    rows={4}
                                />
                            </FormControl>
                        </FormGroup>


                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                
                            <Box display="flex" sx={{mb:2}}>
                                <Typography variant="h5" sx={{ marginLeft: { xs: 0, md: 1 }, marginRight:{xs:1, md:2}, fontWeight: 'bold' }}>Assign Employees</Typography>
                            </Box>

                            {positions.length > 0 ? (
                                positions.map((position) => (
                                    <FormControl fullWidth key={position.id} sx={{ my: 1 }}>
                                        <TextField
                                            select
                                            SelectProps={{
                                            multiple: true,
                                            value: assignments[position.id] || [], //structure: {position_id: '', employee_ids: []}
                                            onChange: handleAssignChange(position.id),
                                            renderValue: (selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((emp_id) => {
                                                    const emp = employees.find((e) => e.id === emp_id);
                                                    return (
                                                    <Chip
                                                        key={emp_id}
                                                        label={emp ? `${emp.first_name} ${emp.last_name}` : emp_id}
                                                    />
                                                    );
                                                })}
                                                </Box>
                                            ),
                                            }}
                                            label={position.name}
                                            variant="outlined"
                                        >
                                            {employees.map((emp) => {
                                            const alreadyAssigned = Object.entries(assignments).some(
                                                ([posId, empList]) =>
                                                posId !== String(position.id) && (emp.department_id !== null) && empList.includes(emp.id) 
                                            );
                                            const selectedEmployees = assignments[position.id] || [{}];
                                            return (
                                                <MenuItem
                                                key={emp.id}
                                                value={emp.id}
                                                disabled={alreadyAssigned}
                                                >
                                                <Checkbox checked={selectedEmployees.includes(emp.id)} />
                                                <ListItemText primary={`${emp.first_name} ${emp.last_name}`} />
                                                </MenuItem>
                                            );
                                            })}
                                        </TextField>
                                    </FormControl>
                                ))
                            ):(
                            <FormControl fullWidth>
                                <Box display="flex" alignContent="center">
                                    <Typography>No Positions to Assign</Typography>
                                </Box>
                            </FormControl>
                            )}
                        </FormGroup>
                        

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Department </p>
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    )
    
}
export default DepartmentEdit;