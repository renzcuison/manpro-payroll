import React, { useEffect, useState } from "react";
import { Box,Typography,Button,TextField,Dialog,DialogTitle,DialogContent,Chip,ListItemText,Checkbox,
Menu, MenuItem, IconButton,Divider, List, Tooltip, Grid,FormGroup,FormControl, ListItem, Avatar, DialogActions, ListItemButton, Tabs, Tab, InputAdornment} from "@mui/material";
import axiosInstance, { getJWTHeader }  from "../../../../utils/axiosConfig";
import Swal from "sweetalert2";
import { SearchIcon } from "lucide-react";
import { set } from "lodash";

const DepartmentAssignPosition = ({open, onClose, departmentId}) =>{
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [positions, setPositions] = useState([]); //for the position selection
    const [tabIndex, setTabIndex] = useState(0); //handliing tab index switching
    const [searchEmployee, setSearchEmployee] = useState(''); //for search bar
    const [selectedPositionId, setSelectedPositionId] = useState(''); //for position selection
    const [employeeIdsToAdd, setEmployeeIdsToAdd] = useState([]); //for employees to be added to that specific position
    const [employeeIdsToRemove, setEmployeeIdsToRemove] = useState([]); //for removing employees currently assigned in that position
    const [assignedEmployees, setAssignedEmployees] = useState([]); //employees that are (HOPEFULLY) assigned
    const [unassignedEmployees, setUnassignedEmployees] = useState([]); //employees belonging to this department but not assigned yet
    
    //just wanting to make a more dynamic button and alert messages without cluttering the component
    const getButtonLabel = () => {
        if (tabIndex === 0) {
            return `Assign (${employeeIdsToAdd.length}) ${employeeIdsToAdd.length <= 1 ? "Employee": "Employees"}`;
        } else {
            return `Remove (${employeeIdsToRemove.length}) ${employeeIdsToRemove.length <= 1 ? "Employee": "Employees"}`;
        }
    };
    const getAlertText = () => {
        if (tabIndex === 0) {
            return employeeIdsToAdd.length <= 1 ? "This employee will be assigned to this position" : "These employees will be assigned to this position";
        } else {
            return employeeIdsToRemove.length <= 1 ? "This employee will be removed from this position" : "These employees will be removed from this position";
        }
    }

    //fetching data
    useEffect(() => {
        getAssignedEmployeesByDepartment();
        getDepartmentPosition();
    }, []);


    const refreshModal = () => {
        setEmployeeIdsToAdd([]);
        setEmployeeIdsToRemove([]);
        getAssignedEmployeesByDepartment();
        getDepartmentPosition();
    }

    const getAssignedEmployeesByDepartment = () => {
        axiosInstance.get(`/settings/getEmployeesByDepartment/${departmentId}`, {headers})
        .then((response) => {
            if(response.status === 200){               
                const assigned = response.data.assigned;
                const unassigned = response.data.unassigned;

                setAssignedEmployees(assigned);
                setUnassignedEmployees(unassigned);
            }
        });
    }
    const getDepartmentPosition = () => {
        axiosInstance.get('/settings/getDepartmentPositions', { headers })
            .then((response) => {
                if(response.status === 200){
                    const position = response.data.positions;
                    setPositions(position);    
                }
                else{
                    setPositions([]);
                }
            }).catch((error) => {
                console.error('Error fetching positions:', error);
                setPositions([]);
            });
    }
    const getEmployeeName = () => {
        const employee = tabIndex === 0 ? unassignedEmployees.find(e => e.id): assignedEmployees.find(e => e.id);
        return employee ? `${employee.first_name} ${employee.last_name}` : '';
    };
    //render employee avatars
    const renderAvatar = (employee) => {
        if (employee.avatar) {
          return (
            <Avatar 
              src={employee.avatar.startsWiths('data:') ? employee.avatar : `data:image/png;base64,${employee.avatar}`}
              sx={{ width: 32, height: 32 }}
            />
          );
        }
        return (
          <Avatar sx={{ width: 32, height: 32 }}>
            {tabIndex == 0 ? unassignedEmployees.first_name?.charAt(0) : assignedEmployees.first_name?.charAt(0)}
            {employee.last_name?.charAt(0)}
          </Avatar>
        );
      };

    //adds employee id into these useStates (dependent on tabIndex), else removes them upon unchecking
    const handleEmployeeToggle = (employee_id) => {
        if(tabIndex === 0){
            setEmployeeIdsToAdd(prev => {
                if(prev.includes(employee_id)){
                    return prev.filter(id => id !== employee_id);
                }
                else{
                    return [...prev, employee_id];
                }
            })
        }
        else{
            setEmployeeIdsToRemove(prev => {
                if(prev.includes(employee_id)){
                    return prev.filter(id => id !== employee_id);
                }
                else{
                    return [...prev, employee_id];
                }
            })
        }
    }

    //changes the id of the selected position
    const handlePositionChange = (event) => {
        setSelectedPositionId(event.target.value);
        setEmployeeIdsToRemove([]);
    }

    //handle switching tabs
    const handleTabChanges = (event, index) => {
        setTabIndex(index);
        getAssignedEmployeesByDepartment();

        if(tabIndex === 0){
            setEmployeeIdsToRemove([]);
        }
        else{
            setEmployeeIdsToAdd([]);
        }
    }

    //handle the saving process
    const handleSave = (event) => {
        event.preventDefault();
    
        if(!selectedPositionId || selectedPositionId === null){
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Select a position first!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonText: "Confirm",
                confirmButtonColor: "#177604",
            });
        }
        else{
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure",
                text: getAlertText(),
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Confirm",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if(res.isConfirmed){
                    const data = {
                        department_position_id: selectedPositionId,
                        add_employee_ids: employeeIdsToAdd,
                        remove_employee_ids: employeeIdsToRemove,
                    }
                    axiosInstance.post(`/settings/updateDepartmentPositionAssignments/${departmentId}`, data, { headers })
                    .then(response => {
                        if (response.data.status === 200) {
                            Swal.fire({
                                customClass: { container: 'my-swal' },
                                text: "Process Successful!",
                                icon: "success",
                                showConfirmButton: true,
                                confirmButtonText: 'Proceed',
                                confirmButtonColor: '#177604',
                            }).then(() => {
                                refreshModal();
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        Swal.fire({
                            customClass: { container: 'my-swal' },
                            text: "Error saving Process!",
                            icon: "error",
                            showConfirmButton: true,
                            confirmButtonColor: '#177604',
                        });
                    });
                    
                }
            })    
        }
    }

    //custom close handling in this modal, to warn user about some unsaved changes
    const handleClose = () => {
        if(employeeIdsToAdd.length > 0 || employeeIdsToRemove.length > 0){
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "You have some unsaved changes",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Confirm",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if(res.isConfirmed){
                    onClose(false)
                }
            })
        }
        else{
            onClose(true)
        }
    }

    //filtering employees in the list via searched keyword    
    const filteredAssignedEmployees = assignedEmployees.filter((emp) => {
        const nameMatch = `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchEmployee.toLowerCase());
        const positionMatch = parseInt(emp.department_position_id) === parseInt(selectedPositionId);
        return nameMatch && positionMatch;
    });

    const filteredUnassignedEmployees = unassignedEmployees.filter((emp) => {
        const nameMatch = `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchEmployee.toLowerCase());
        return nameMatch;
    });
    return(
        <>
            <Dialog
                open={open}
                onClose={handleClose}
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
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Assign Employees </Typography>
                        <IconButton onClick={handleClose}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 3 }} onSubmit={handleSave} noValidate autoComplete="off" encType="multipart/form-data" >
                        {/*Position Selection Section*/}
                        <FormControl fullWidth>
                            <TextField
                                label="Select Position"
                                select
                                slotProps={{
                                    select:{
                                        value: selectedPositionId,
                                        onChange: handlePositionChange,
                                    }
                                }}  
                            >
                                {positions.map((pos)=> (
                                    <MenuItem key={pos.id} value={pos.id}>
                                        {pos.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </FormControl>

                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3, mb:1}}>
                            <Tabs value={tabIndex} onChange={handleTabChanges} aria-label="assignment tabs">
                                <Tab label="Assign Employees" />
                                <Tab label="Currently Assigned" />
                            </Tabs>
                        </Box>

                        {/*Tab View*/}
                        <FormGroup row={true} className="d-flex justify-content-between">
                            {/*Employee search bar*/}
                            <Box sx={{ mb: 2, mt: 2 }} width="100%">
                                <TextField
                                    fullWidth
                                    label="Search employees"
                                    value={searchEmployee}
                                    onChange={(e) => setSearchEmployee(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>

                            {/*<--Main Employee List View-->*/}
                            <Box sx={{ maxHeight: 400, overflow: 'auto' }} width="100%">
                                <List dense>
                                    {
                                    tabIndex === 0 ? (
                                        filteredUnassignedEmployees.length > 0 ? (
                                        filteredUnassignedEmployees.map((emp, index) => (
                                            <>
                                                <ListItem key={emp.id} secondaryAction={
                                                    <Checkbox
                                                        edge="end"
                                                        checked={employeeIdsToAdd.includes(emp.id)}
                                                        onChange={() => handleEmployeeToggle(emp.id)}
                                                    />
                                                    } disablePadding>
                                                    <ListItemButton onClick={() => handleEmployeeToggle(emp.id)}>
                                                        <Tooltip title={`${emp.first_name} ${emp.last_name}`} arrow>
                                                            {renderAvatar(emp)}
                                                        </Tooltip>
                                                        <ListItemText primary={`${emp.first_name} ${emp.last_name}`} sx={{ ml: 2 }} />
                                                    </ListItemButton>
                                                </ListItem>
                                                
                                            </> 
                                        ))
                                        ) : (
                                            <ListItem alignItems="center"
                                            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                No Available Employees for Assignment
                                            </ListItem>
                                        )
                                    ) : 
                                    tabIndex === 1 ? (
                                        filteredAssignedEmployees.length > 0 ? (
                                        filteredAssignedEmployees.map((emp, index) => (
                                            <>
                                                <ListItem key={emp.id} secondaryAction={
                                                    <Checkbox
                                                        edge="end"
                                                        checked={employeeIdsToRemove.includes(emp.id)}
                                                        onChange={() => handleEmployeeToggle(emp.id)}
                                                    />
                                                    } disablePadding>
                                                    <ListItemButton onClick={() => handleEmployeeToggle(emp.id)}>
                                                        <Tooltip title={`${emp.first_name} ${emp.last_name}`} arrow>
                                                        <Avatar src={emp.avatar} />
                                                        </Tooltip>
                                                        <ListItemText primary={`${emp.first_name} ${emp.last_name}`} sx={{ ml: 2, }} />
                                                    </ListItemButton>
                                                </ListItem>
                                            </>
                                        ))
                                        ) : selectedPositionId === null || !selectedPositionId ? (
                                        <ListItem alignItems="center"
                                        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            Select A Position</ListItem>
                                        ) : 
                                        (<ListItem alignItems="center"
                                        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            No Employees Assigned</ListItem>)
                                    ) :
                                     null
                                    }
                                </List>
                            </Box>
                            
                            {/*<--Show employee profile of those that will be assigned/removed-->*/}
                            {
                                ((tabIndex === 0 && employeeIdsToAdd.length > 0) || (tabIndex === 1 && employeeIdsToRemove.length > 0)) && 
                                (<Box sx={{ mt: 10 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        {tabIndex === 0 ? "New Assignments for this Position" : "Selected for Removal"}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {tabIndex === 0 && employeeIdsToAdd.map(empId => {
                                        const employee = unassignedEmployees.find(e => e.id === empId);
                                        return (
                                            <Tooltip key={empId} title={`${getEmployeeName()}`} arrow>
                                                {renderAvatar(employee)}
                                            </Tooltip>
                                        );
                                        })
                                        }
                                        {tabIndex === 1 && employeeIdsToRemove.map(empId => {
                                        const employee = assignedEmployees.find(e => e.id === empId);
                                        return (
                                            <Tooltip key={empId} title={`${getEmployeeName()}`} arrow>
                                                {renderAvatar(employee)}
                                            </Tooltip>
                                        );
                                        })}
                                    </Box>
                                </Box>)
                            }
                        </FormGroup>

                        {/*Submit and close button*/}
                        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: '20px' }}>   
                            <Button onClick={handleClose} variant="text" sx={{color: 'black' }} className="m-1">
                                <p className='m-0'><i className="si si-close"></i> Close </p>
                            </Button>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: tabIndex === 0 ? '#177604': '#C80101', color: 'white' }} className="m-1"
                            disabled={(tabIndex === 0 && employeeIdsToAdd.length ===0) || (tabIndex === 1 && employeeIdsToRemove.length === 0)}>
                                <p className='m-0'><i className={tabIndex===0 ? "fa fa-floppy-o mr-2 mt-1": "fa fa-trash"}></i>
                                {getButtonLabel()}
                                </p>
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>  
            </Dialog>
        </>
    )
}
export default DepartmentAssignPosition;