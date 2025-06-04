import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography,
     CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Avatar, Stack, Tooltip, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Swal from 'sweetalert2';
import moment from 'moment';
import dayjs from 'dayjs';
import { Edit } from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { CgAdd, CgTrash } from "react-icons/cg";  
import EducationFields from './EducationFields';

import LoadingSpinner from "../../../components/LoadingStates/LoadingSpinner";

const ProfileEdit = ({ open, close, employee, medScreen }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const queryClient = useQueryClient();

    const [isLoading, setIsLoading] = useState(true);

    // Form Fields
    const [firstName, setFirstName] = useState(employee.first_name || '');
    const [middleName, setMiddleName] = useState(employee.middle_name || '');
    const [lastName, setLastName] = useState(employee.last_name || '');
    const [suffix, setSuffix] = useState(employee.suffix || '');

    const [username, setUsername] = useState(employee.user_name || '');
    const [birthDate, setBirthDate] = useState(dayjs(employee.birth_date) || '');
    const [gender, setGender] = useState(employee.gender || '');
 
    const [contact, setContact] = useState(employee.contact_number || '');
    const [address, setAddress] = useState(employee.address || '');
    
    //[1]--Education Form Field Values and Handlers
    const [educations, setEducations] = useState([])
    const educationFields = {school_name: "", education_level: "", program_name: "", year_graduated: ""}
    const [isFieldsChanged, setIsFieldsChanged] = useState(false); //handle any changes to the fields
    const [updateIds, setUpdateIds] = useState([]); //ids to update
    const [deleteIds, setDeleteIds] = useState([]); //ids to delete
    
    useEffect(() => {
        axiosInstance.get('/settings/getEmployeeDepartment', { headers })
            .then((response) => {
                if(response.status === 200){
                    const educations = response.data.educations;
                    setEducations(educations);
                    setIsLoading(false);
                }
                else{
                    setEducations(educationFields);
                    setIsLoading(false);
                }
            }).catch((error) => {
                console.error('Error fetching branches:', error);
                setEducations(educationFields);
            });
    }, []);

    const handleChange = (index, field, value) => {
        const updatedFields = [...educations];
        updatedFields[index][field] = value;
        setEducations(updatedFields);
        if("id" in updatedFields[index]){
            setUpdateIds(prevIds => [...prevIds, updatedFields[index].id]);
        }
        setIsFieldsChanged(true);
    }
    const handleAddFields = () => {
        setEducations([...educations, educationFields]); 
    }
    const handleRemoveFields = (indxToRemove) => {
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "Do you want to delete this field?",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Confirm",
            confirmButtonColor: "#177604",
            showCancelButton: true,
            cancelButtonText: "Cancel",
        }).then((res) => {
            if (res.isConfirmed) {
                const updatedFields = educations.filter((_, index) => index != indxToRemove)
                setEducations(educations.length > 0 ? updatedFields : [educationFields]);
                if("id" in educations[indxToRemove]){
                    setDeleteIds(prevIds => [...prevIds, educations[indxToRemove].id]);
                }
                setUpdateIds(prev => prev.filter((id) => !deleteIds.includes(id))); //remove ids existing in the updateIds (if existing)
                setIsFieldsChanged(true);
            }
        });
    }
    //End of [1]

    // Form Errors
    const [firstNameError, setFirstNameError] = useState(false);
    const [middleNameError, setMiddleNameError] = useState(false);
    const [lastNameError, setLastNameError] = useState(false);
    const [suffixError, setSuffixError] = useState(false);

    const [usernameError, setUsernameError] = useState(false);
    const [birthDateError, setBirthDateError] = useState(false);
    const [genderError, setGenderError] = useState(false);

    const [contactError, setContactError] = useState(false);
    const [addressError, setAddressError] = useState(false);

    const checkInput = (event) => {
        event.preventDefault();

        // Required Field Check
        setFirstNameError(!firstName);
        setLastNameError(!lastName);
        setBirthDateError(!birthDate);
        setGenderError(!gender);

        // Editory Checks
        const baseFirstName = (employee.first_name || '') == firstName;
        const baseMiddleName = (employee.middle_name || '') == middleName;
        const baseLastName = (employee.last_name || '') == lastName;
        const baseSuffix = (employee.suffix || '') == suffix;
        const baseGender = (employee.gender || '') == gender;
        const baseBirthDate = dayjs(employee.birth_date).isSame(dayjs(birthDate));
        const baseContact = (employee.contact_number || '') == contact;
        const baseAddress = (employee.address || '') == address;

        if (!firstName || !lastName || !birthDate || !gender) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                text: `All Required Fields must be filled!`,
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else if (baseFirstName && baseMiddleName && baseLastName && baseSuffix && baseGender && baseBirthDate && baseContact && baseAddress && !isFieldsChanged) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                text: `There is nothing to update.`,
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "Do you want to update your profile?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Save",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    saveInput(event);
                }
            });
        }
    }

    const saveInput = (event) => {
        event.preventDefault();
        const addEducations = educations.filter(e => !e.id);
        const updateEducations = educations.filter(e=> updateIds.includes(e.id));
        
        const formData = new FormData();
        formData.append('id', employee.id);
        formData.append('first_name', firstName);
        formData.append('middle_name', middleName);
        formData.append('last_name', lastName);
        formData.append('suffix', suffix)
        formData.append("birth_date", birthDate.format("YYYY-MM-DD HH:mm:ss"));
        formData.append('gender', gender);
        formData.append('contact_number', contact);
        formData.append('address', address);
        // formData.append('profile_pic', profilePic);
        if(addEducations.length > 0){
            formData.append('add_educations', JSON.stringify(addEducations));
        }
        if(updateIds.length > 0){
            formData.append('update_educations', JSON.stringify(updateEducations));
        }
        if(deleteIds.length > 0){
            formData.append('delete_educations_id', JSON.stringify(deleteIds));
        }
        axiosInstance.post('/employee/editMyProfile', formData, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Employee Profile Updated Successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then((res) => {
                        close(true);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    return (
        <>
            <Dialog open={open} fullWidth slotProps={{ paper: { sx: { p: '16px', backgroundColor: "#f8f9fa", boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: { xs: 0, md: "20px" }, minWidth: { xs: "100%", md: "800px" }, maxWidth: { xs: "100%", md: "1000px" }, marginBottom: "5%" }} }} >
                <DialogTitle sx={{ padding: { xs: 1, md: 4 }, paddingBottom: 1, mt: { xs: 1, md: 0 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: { xs: 0, md: 1 }, fontWeight: 'bold' }}> Edit Profile </Typography>
                        <IconButton onClick={() => close(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ px: { xs: 1, md: 5 }, py: 2 }}>

                    {isLoading ? (
                        <LoadingSpinner />
                    ) : (
                        <>
                            <Box component="form" sx={{ my: 1 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >
                                <Grid container spacing={{ xs: 3, md: 2 }}>
                                    <Grid container rowSpacing={{ xs: 3, md: 3 }} size={12}>
                                        <Grid container size={{ xs: 12, md: 10 }}>
                                            <Grid size={{ xs: 12, md: 4 }}>
                                                <FormControl fullWidth sx={{ '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } }, }}>
                                                    <TextField id="first_name" label="First Name" variant="outlined" value={firstName} error={firstNameError} onChange={(e) => setFirstName(e.target.value)} />
                                                </FormControl>
                                            </Grid>

                                            <Grid size={{ xs: 12, md: 4 }}>
                                                <FormControl fullWidth sx={{ '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }}}}>
                                                    <TextField id="middle_name" label="Middle Name" variant="outlined" value={middleName} error={middleNameError} onChange={(e) => setMiddleName(e.target.value)} />
                                                </FormControl>
                                            </Grid>

                                            <Grid size={{ xs: 12, md: 4 }}>
                                                <FormControl fullWidth sx={{ '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }}}}>
                                                    <TextField id="last_name" label="Last Name" variant="outlined" value={lastName} error={lastNameError} onChange={(e) => setLastName(e.target.value)} />
                                                </FormControl>
                                            </Grid>
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 2 }}>
                                            <FormControl fullWidth sx={{ '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }} }}>
                                                <TextField id="suffix" label="Suffix" variant="outlined" value={suffix} error={suffixError} onChange={(e) => setSuffix(e.target.value)} />
                                            </FormControl>
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 5 }}>
                                            <FormControl fullWidth sx={{ '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }} }}>
                                                <TextField id="username" label="Username" variant="outlined" value={username} error={usernameError} onChange={(e) => setUsername(e.target.value)} inputProps={{ readOnly: true }} />
                                            </FormControl>
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 5 }}>
                                            <FormControl fullWidth sx={{ '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }} }}>
                                                <LocalizationProvider dateAdapter={AdapterDayjs} >
                                                    <DatePicker label="Birth Date" value={birthDate} onChange={(newDate) => setBirthDate(newDate)} slotProps={{ textField: { error: birthDateError, readOnly: true } }} />
                                                </LocalizationProvider>
                                            </FormControl>
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 2 }}>
                                            <FormControl fullWidth sx={{ '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }} }}>
                                                <TextField select id="gender" label="Gender" variant="outlined" value={gender} error={genderError} onChange={(e) => setGender(e.target.value)} >
                                                    <MenuItem value="Male"> Male </MenuItem>
                                                    <MenuItem value="Female"> Female </MenuItem>
                                                </TextField>
                                            </FormControl>
                                        </Grid>
                                    </Grid>

                                    {/* Contact Information */}
                                    <Grid container rowSpacing={{ xs: 3, md: 0 }} size={12}>
                                        {/* Contact No. */}
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <FormControl fullWidth sx={{ '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }} }}>
                                                <TextField id="contact" label="Phone Number" variant="outlined" type="number" value={contact} error={contactError} onChange={(e) => setContact(e.target.value)} />
                                            </FormControl>
                                        </Grid>
                                        {/* Address */}
                                        <Grid size={{ xs: 12, md: 9 }}>
                                            <FormControl fullWidth sx={{ '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }} }}>
                                                <TextField id="address" label="Address" variant="outlined" value={address} error={addressError} onChange={(e) => setAddress(e.target.value)} />
                                            </FormControl>
                                        </Grid>
                                    </Grid>

                                    {medScreen &&
                                        <Grid size={12} sx={{ my: 2 }}>
                                            <Divider />
                                        </Grid>
                                    }
                                    
                                    {/* Educational Backgrounds*/}
                                    <EducationFields educations={educations} handleChange={handleChange} handleAddFields={handleAddFields} handleRemoveFields={handleRemoveFields}>
                                    </EducationFields>
                                </Grid>

                                {/* Submit Button */}
                                <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                                    <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                        <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Changes </p>
                                    </Button>
                                </Box>
                            </Box>
                        </>
                    )}  

                </DialogContent>
            </Dialog >
        </>
    )
}

export default ProfileEdit;
