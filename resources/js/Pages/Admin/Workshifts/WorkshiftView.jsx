import React, {  useState, useEffect } from 'react'
import { Box, Button, Typography, FormGroup, TextField, FormControl, MenuItem,  Checkbox, CircularProgress, TableContainer, Table, TableHead, TableBody, TableRow, TableCell,
ToggleButton, ToggleButtonGroup} from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import { useParams } from 'react-router-dom'
import { useManageWorkshift } from '../../../hooks/useWorkShifts';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { Dayjs } from 'dayjs';
import WorkDaySelector from './WorkDaySelector';

const WorkshiftView = () => {
    const { client, selectedShift } = useParams();
    const {
        //toggles and loading state 
        isEdit, setIsEdit, isLoading,
        //values
        shiftName,shiftType,firstLabel,secondLabel, 
        regularTimeIn, regularTimeOut,splitFirstTimeIn, splitFirstTimeOut,
        splitSecondTimeIn, splitSecondTimeOut,
        breakStart, breakEnd, overTimeIn,overTimeOut, workDays,
        //error object
        errors,
        //functions
        setShiftName, handleShiftTypeChange, setFirstLabel,
        setSecondLabel, setRegularTimeIn, setRegularTimeOut, setSplitFirstTimeIn,
        setSplitSecondTimeOut,
        setBreakStart, setBreakEnd, setOverTimeIn, setOverTimeOut, checkInput,
        handleSplitFirstTimeOutChange, handleSplitSecondTimeInChange, handleWorkDaysChanges, refetchWorkShiftDetails,

    } = useManageWorkshift({client: client, selectedShift: selectedShift});

    const setFieldColor = () => {
        return isEdit ? null : "#97a5ba" //null means the primary color being used by this app (green)
    }

    return (
        <Layout title={"AddWorkShift"}>
            <Box sx={{ mx: 2, pt: 8, display: 'flex', justifyContent: 'center'}}>
                <Box component="form" sx={{px: 10, py: 7, mb: 6, width:'100%', maxWidth: '1000px',
                    backgroundColor: 'white', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', 
                    borderRadius: '20px', marginBottom: '5%', justifyContent:'center'}} onSubmit={checkInput} 
                    noValidate autoComplete="off" encType="multipart/form-data" 
                >
                    <Typography variant="h4" sx={{ mb: 8, fontWeight: 'bold' }}>View Work Shift</Typography>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }} >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {/*Shift name and type section*/}
                            <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                mb:1,
                                '& label.Mui-focused': {color: setFieldColor()},
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: setFieldColor()}},
                            }}>
                                <FormControl sx={{ marginBottom: 3, width: {lg:'50%', md:'100%', xs:'100%'},
                                 marginRight: {md:0, lg: 3},
                                }}>
                                    <TextField
                                        required
                                        id="shiftName"
                                        label="Shift Name"
                                        variant="outlined"
                                        value={shiftName}
                                        error={!!errors.shiftName}
                                        onChange={(e) => setShiftName(e.target.value)}
                                        InputProps={{ readOnly: !isEdit }}
                                    />
                                </FormControl>

                                <FormControl sx={{ marginBottom: 3, width: {lg:'45.5%', md:'100%', xs:'100%'}}}>
                                    <TextField
                                        select
                                        required
                                        id="shiftType"
                                        label="Shift Type"
                                        value={shiftType}
                                        onChange={(e) => handleShiftTypeChange(e.target.value)}
                                        InputProps={{ readOnly: !isEdit }}
                                    >
                                        <MenuItem key="regular" value="regular"> Regular Hours </MenuItem>
                                        <MenuItem key="split" value="split"> Split Hours </MenuItem>
                                    </TextField>
                                </FormControl>
                            </FormGroup>

                            {/*shift type conditioning section */}
                            <Typography>Work Hours</Typography>
                            {shiftType === "regular" && (
                                <>
                                    <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                        '& label.Mui-focused': {color: setFieldColor()},
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': {borderColor: setFieldColor()},
                                        },
                                    }}>
                                        <FormControl sx={{ paddingTop: 1, marginBottom: 3, marginRight: {md:0, lg: 3}, width: '50%'}}>
                                            <TextField
                                                required
                                                id="firstLabel"
                                                label="First Label"
                                                variant="outlined"
                                                value="Attendance"
                                                InputProps={{ readOnly: !isEdit }}
                                            />
                                        </FormControl>

                                        <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end'}}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                                <TimePicker
                                                    required
                                                    label="Time In"
                                                    views={['hours', 'minutes']}
                                                    value={regularTimeIn || dayjs('00:00:00', 'HH:mm:ss')}
                                                    onChange={(value) => setRegularTimeIn(value)}
                                                    slotProps={{ textField: { error: !!errors.regularTimeIn , required: true, InputProps: { readOnly: !isEdit } } }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>

                                        <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end'}}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                                <TimePicker
                                                    required
                                                    label="Time Out"
                                                    views={['hours', 'minutes']}
                                                    value={regularTimeOut || dayjs('00:00:00', 'HH:mm:ss')}
                                                    onChange={(value) => setRegularTimeOut(value)}
                                                    slotProps={{ textField: { error: !!errors.regularTimeOut , required: true, InputProps: { readOnly: !isEdit } } }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>
                                    </FormGroup>

                                    <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                        '& label.Mui-focused': {color: setFieldColor()},
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': {borderColor: setFieldColor()},
                                        },
                                    }}>
                                        <FormControl sx={{ paddingTop: 1, marginBottom: 3, marginRight: {md:0, lg: 3}, width: '50%'}}>
                                            <TextField
                                                required
                                                id="breakTimeLabel"
                                                label="Break Time"
                                                variant="outlined"
                                                value="Break Time"
                                                InputProps={{ readOnly: !isEdit }}
                                            />
                                        </FormControl>

                                        <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end'}}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                                <TimePicker
                                                    required
                                                    label="Break Start"
                                                    views={['hours', 'minutes']}
                                                    value={breakStart || dayjs('00:00:00', 'HH:mm:ss')}
                                                    onChange={(value) => setBreakStart(value)}
                                                    slotProps={{ textField: { error: !!errors.breakStart, required: true, InputProps: { readOnly: !isEdit } } }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>

                                        <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end'}}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                                <TimePicker
                                                    requireds
                                                    label="Break End"
                                                    views={['hours', 'minutes']}
                                                    value={breakEnd || dayjs('00:00:00', 'HH:mm:ss')}
                                                    onChange={(value) => setBreakEnd(value)}
                                                    slotProps={{ textField: { error: !!errors.breakEnd, required: true, InputProps: { readOnly: !isEdit } } }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>
                                    </FormGroup>
                                </>
                            )}

                            {shiftType === "split" && (
                                <>           
                                    <FormGroup row={true} className="d-flex justify-content-between align-items-center" sx={{
                                        '& label.Mui-focused': {color: setFieldColor()},
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': {borderColor: setFieldColor()},
                                        },
                                    }}>
                                        <FormControl sx={{ paddingTop: 1, marginBottom: 3, marginRight: {md:0, lg: 3}, width: '50%'}}>
                                            <TextField
                                                required
                                                id="firstLabel"
                                                label="First Label"
                                                variant="outlined"
                                                value={firstLabel}
                                                error={!!errors.firstLabel}
                                                onChange={(e) => setFirstLabel(e.target.value)}
                                                InputProps={{ readOnly: !isEdit }}
                                            />
                                        </FormControl>

                                        <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end'}}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                                <TimePicker
                                                    required
                                                    label="Time In"
                                                    views={['hours', 'minutes']}
                                                    value={splitFirstTimeIn || dayjs('00:00:00', 'HH:mm:ss')}
                                                    onChange={(value) => setSplitFirstTimeIn(value)}
                                                    slotProps={{ textField: { error: !!errors.splitFirstTimeIn, required: true, InputProps: { readOnly: !isEdit } } }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>

                                        <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end'}}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                                <TimePicker
                                                    required
                                                    label="Time Out"
                                                    views={['hours', 'minutes']}
                                                    value={splitFirstTimeOut || dayjs('00:00:00', 'HH:mm:ss')}
                                                    onChange={handleSplitFirstTimeOutChange}
                                                    slotProps={{ textField: { error: !!errors.splitFirstTimeOut, required: true, InputProps: { readOnly: !isEdit } } }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>
                                    </FormGroup>

                                    <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                        '& label.Mui-focused': {color: setFieldColor()},
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': {borderColor: setFieldColor()},
                                        },
                                    }}>
                                        <FormControl sx={{ paddingTop: 1, marginBottom: 3, marginRight: {md:0, lg: 3}, width: '50%'}}>
                                            <TextField
                                                required
                                                id="secondLabel"
                                                label="Second Label"
                                                variant="outlined"
                                                value={secondLabel}
                                                error={!!errors.secondLabel}
                                                onChange={(e) => setSecondLabel(e.target.value)}
                                                InputProps={{ readOnly: !isEdit }}
                                            />
                                        </FormControl>

                                        <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end'}}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                                <TimePicker
                                                    required
                                                    label="Time In"
                                                    views={['hours', 'minutes']}
                                                    value={splitSecondTimeIn || dayjs('00:00:00', 'HH:mm:ss')}
                                                    onChange={handleSplitSecondTimeInChange}
                                                    slotProps={{ textField: { error: !!errors.splitSecondTimeIn, required: true, InputProps: { readOnly: !isEdit } } }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>

                                        <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end'}}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                                <TimePicker
                                                    required
                                                    label="Time Out"
                                                    views={['hours', 'minutes']}
                                                    value={splitSecondTimeOut || dayjs('00:00:00', 'HH:mm:ss')}
                                                    onChange={(value) => setSplitSecondTimeOut(value)}
                                                    slotProps={{ textField: { error: !!errors.splitSecondTimeOut, required: true, InputProps: { readOnly: !isEdit } } }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>
                                    </FormGroup>
                                </>
                            )}

                            {shiftType && (
                                <>
                                    <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                        '& label.Mui-focused': {color: setFieldColor()},
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': {borderColor: setFieldColor()},
                                        },
                                    }}>
                                        <FormControl sx={{ paddingTop: 1, marginBottom: 3, marginRight: {md:0, lg: 3}, width: '50%'}}>
                                            <TextField
                                                required
                                                id="overTimeLabel"
                                                label="Over Time"
                                                variant="outlined"
                                                value="Over Time"
                                                InputProps={{ readOnly: !isEdit }}
                                            />
                                        </FormControl>

                                        <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end'}}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                                <TimePicker
                                                    label="Time In"
                                                    views={['hours', 'minutes']}
                                                    value={overTimeIn || dayjs('00:00:00', 'HH:mm:ss')}
                                                    onChange={(value) => setOverTimeIn(value)}
                                                    slotProps={{ textField: { error: !!errors.overTimeIn, required: true, InputProps: { readOnly: !isEdit } } }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>

                                        <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end'}}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                                <TimePicker
                                                    label="Time Out"
                                                    views={['hours', 'minutes']}
                                                    value={overTimeOut || dayjs('00:00:00', 'HH:mm:ss')}
                                                    onChange={(value) => setOverTimeOut(value)}
                                                    slotProps={{ textField: { error: !!errors.overTimeOut, required: true, InputProps: { readOnly: !isEdit } } }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>
                                    </FormGroup>
                                </>
                            )}
                            
                                
                            <WorkDaySelector workDays={workDays} isEdit={isEdit} onChange={handleWorkDaysChanges}/>
                            {/* <TableContainer>
                                <Table stickyHeader size='small'>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align='center'>Sunday</TableCell>
                                            <TableCell align='center'>Monday</TableCell>
                                            <TableCell align='center'>Tuesday</TableCell>
                                            <TableCell align='center'>Wednesday</TableCell>
                                            <TableCell align='center'>Thursday</TableCell>
                                            <TableCell align='center'>Friday</TableCell>
                                            <TableCell align='center'>Saturday</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                                            <TableCell align="center" key={day}>
                                                <Checkbox checked={workDays[day]} 
                                                disabled={!isEdit} onChange={() => handleWorkDaysChanges(day)}
                                                sx={{
                                                    color: !isEdit ? '#6c757d' : undefined, 
                                                    '&.Mui-disabled': {
                                                      color: '#6c757d', 
                                                      opacity: 1,      
                                                    },
                                                }}/>
                                            </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer> */}
                            
                            <Box display='flex' justifyContent='center' sx={{mt: 2}}>
                                {!isEdit && 
                                    <Button variant='contained' onClick={() => setIsEdit(true)}>
                                        <p className='m-0'><i className="fa fa-pencil-square-o mr-2 mt-1"></i> Edit </p>
                                    </Button>}
                                {isEdit && 
                                    <>
                                        <Button type="submit" variant='contained' onClick={(e) => checkInput(e)} sx={{mr: 2}}>
                                            <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save </p>   
                                        </Button>
                                        <Button variant='contained' onClick={() => {setIsEdit(false); refetchWorkShiftDetails()}} sx={{backgroundColor: '#636c74'}}>
                                            <p className='m-0'><i className="fa fa-times" ></i> Cancel </p>
                                        </Button>
                                    </>
                                } 
                            </Box>
                        </>
                    )}
                </Box>
            </Box>
        </Layout >
    )
}

export default WorkshiftView