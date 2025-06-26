import { useQuery } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'
const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];
import Swal from "sweetalert2";
import dayjs, { Dayjs } from 'dayjs';

export function useWorkShiftDetails(client, selectedShift){
    const data = { client, selectedShift };

    const query = useQuery(['workShift', client, selectedShift], async () => {
        const response = await axiosInstance.get(`/workshedule/getWorkShiftDetails`, { params: data, headers });
        return response.data;
    }, {enabled: !!client && !!selectedShift});

    return{
        workShiftData: query.data,
        workShiftIsLoading: query.isLoading,
        workShiftIsError: query.isError,
        refetchWorkShifts: query.refetch,
    }
}

export function useManageWorkshift ({ client, selectedShift } = {}) {
    const navigate = useNavigate();
    const { workShiftData, workShiftIsLoading, refetchWorkShifts } = useWorkShiftDetails(client, selectedShift);

    const isUpdate = !!selectedShift;

    const defaultDays = {
      Sunday: false,
      Monday: false,
      Tuesday: false,
      Wednesday: false,
      Thursday: false,
      Friday: false,
      Saturday: false,
    };

    const [isEdit, setIsEdit] = useState(false);

    const [shiftType, setShiftType] = useState('');
    const [shiftName, setShiftName] = useState('');
    const [firstLabel, setFirstLabel] = useState('');
    const [secondLabel, setSecondLabel] = useState('');
  
    const [regularTimeIn, setRegularTimeIn] = useState(null);
    const [regularTimeOut, setRegularTimeOut] = useState(null);
    const [splitFirstTimeIn, setSplitFirstTimeIn] = useState(null);
    const [splitFirstTimeOut, setSplitFirstTimeOut] = useState(null);
    const [splitSecondTimeIn, setSplitSecondTimeIn] = useState(null);
    const [splitSecondTimeOut, setSplitSecondTimeOut] = useState(null);
    const [breakStart, setBreakStart] = useState(null);
    const [breakEnd, setBreakEnd] = useState(null);
    const [overTimeIn, setOverTimeIn] = useState(null);
    const [overTimeOut, setOverTimeOut] = useState(null);
    const [workDays, setWorkDays] = useState(defaultDays);
  
    // Error states
    const [errors, setErrors] = useState({});
  
    // Populate state once data is fetches
    const parseTime = (value) => {
      const parsed = dayjs(value, 'HH:mm:ss', true); 
      return parsed.isValid() ? parsed : null;
    };

    useEffect(() => {
      if (!workShiftData) return;
    
      const shift = workShiftData.workShift || {};
      const hours = workShiftData.workHours || {};
      const days = workShiftData.workDays || defaultDays;
    
      setShiftName(shift.name || '');
      const type = shift.shift_type?.toLowerCase() || '';
      setShiftType(type);
    
      if (isUpdate) {
        if (type === 'regular') {
          setRegularTimeIn(hours.first_time_in ? parseTime(hours.first_time_in) : null);
          setRegularTimeOut(hours.first_time_out ? parseTime(hours.first_time_out) : null);
          setBreakStart(hours.break_start ? parseTime(hours.break_start) : null);
          setBreakEnd(hours.break_end ? parseTime(hours.break_end) : null);
        } else {
          setFirstLabel(shift.first_label || '');
          setSecondLabel(shift.second_label || '');
          setSplitFirstTimeIn(hours.first_time_in ? parseTime(hours.first_time_in) : null);
          setSplitFirstTimeOut(hours.first_time_out ? parseTime(hours.first_time_out) : null);
          setSplitSecondTimeIn(hours.second_time_in ? parseTime(hours.second_time_in) : null);
          setSplitSecondTimeOut(hours.second_time_out ? parseTime(hours.second_time_out) : null);
        }
    
        setOverTimeIn(hours.over_time_in ? parseTime(hours.over_time_in) : null);
        setOverTimeOut(hours.over_time_out ? parseTime(hours.over_time_out) : null);
        setWorkDays(days);
      } else {
        // Reset for new shift
        setRegularTimeIn(null);
        setRegularTimeOut(null);
        setBreakStart(null);
        setBreakEnd(null);
        setOverTimeIn(null);
        setOverTimeOut(null);
        setSplitFirstTimeIn(null);
        setSplitFirstTimeOut(null);
        setSplitSecondTimeIn(null);
        setSplitSecondTimeOut(null);
        setFirstLabel('');
        setSecondLabel('');
        setWorkDays(defaultDays);
      }
    }, [workShiftData, isUpdate]);
  
    // Resets all values when shifting to new types
    const handleShiftTypeChange = (value) => {
      setShiftType(value);
      setErrors({});
      setFirstLabel('');
      setSecondLabel('');
      setRegularTimeIn(null);
      setRegularTimeOut(null);
      setSplitFirstTimeIn(null);
      setSplitFirstTimeOut(null);
      setSplitSecondTimeIn(null);
      setSplitSecondTimeOut(null);
      setBreakStart(null);
      setBreakEnd(null);
      setOverTimeIn(null);
      setOverTimeOut(null);
    };

    //special setter handlers
    const handleSplitFirstTimeOutChange = (newValue) => {
      setSplitFirstTimeOut(newValue);

      if (shiftType == "split" ) {
        setBreakStart(newValue);
      }
    };

    const handleSplitSecondTimeInChange = (newValue) => {
      setSplitSecondTimeIn(newValue);

      if (shiftType == "split" ) {
        setBreakEnd(newValue);
      }
    };

    const handleWorkDaysChanges = (day) => {
      setWorkDays(prev => ({
        ...prev,
        [day]: !prev[day],
      }));
    }

    // Validation for error detection (now stores any errors in an object instead of creating a whole separate useStates of error validations for each field)
    const validate = () => {
      const errors = {};
      if (!shiftName) errors.shiftName = true;
      if (!overTimeIn) errors.overTimeIn = true;
      if (!overTimeOut) errors.overTimeOut = true;
  
      if (shiftType === 'regular') {
        if (!regularTimeIn) errors.regularTimeIn = true;
        if (!regularTimeOut) errors.regularTimeOut = true;
        if (!breakStart) errors.breakStart = true;
        if (!breakEnd) errors.breakEnd = true;

      } else if (shiftType === 'split') {
        if (!firstLabel) errors.firstLabel = true;
        if (!secondLabel) errors.secondLabel = true;
        if (!splitFirstTimeIn) errors.splitFirstTimeIn = true;
        if (!splitFirstTimeOut) errors.splitFirstTimeOut = true;
        if (!splitSecondTimeIn) errors.splitSecondTimeIn = true;
        if (!splitSecondTimeOut) errors.splitSecondTimeOut = true;
      }
      setErrors(errors);
      return Object.keys(errors).length > 0;
    };

    const checkInput = (event) => {
        event.preventDefault();
        if (validate()) {
            Swal.fire({ icon: 'error', text: 'All fields must be filled!' });
            return;
        }
        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: 'You want to save this work shift?',
            showCancelButton: true,
            confirmButtonColor: '#177604',
            confirmButtonText: 'Save',
          }).then((res) => {
            if(res.isConfirmed){
                save();
            }
        });

    }
  
    const save = async () => {
        
        const data = {
            shiftName,
            shiftType,
            breakStart: breakStart?.format('HH:mm:ss'),
            breakEnd: breakEnd?.format('HH:mm:ss'),
            overTimeIn: overTimeIn?.format('HH:mm:ss'),
            overTimeOut: overTimeOut?.format('HH:mm:ss'),
            workDays,
        };
    
        if (shiftType === 'regular') {
            Object.assign(data, {
            firstLabel: 'Attendance',
            firstTimeIn: regularTimeIn?.format('HH:mm:ss'),
            firstTimeOut: regularTimeOut?.format('HH:mm:ss'),
            });
        } else {
            Object.assign(data, {
            firstLabel,
            secondLabel,
            firstTimeIn: splitFirstTimeIn?.format('HH:mm:ss'),
            firstTimeOut: splitFirstTimeOut?.format('HH:mm:ss'),
            secondTimeIn: splitSecondTimeIn?.format('HH:mm:ss'),
            secondTimeOut: splitSecondTimeOut?.format('HH:mm:ss'),
            });
        }
        //for update purposes
        if (isUpdate) {
          data.shiftId = selectedShift; 
        }
        
        try {
            const endpoint = shiftType === 'regular'
            ? '/workshedule/saveRegularWorkShift'
            : '/workshedule/saveSplitWorkShift';

            const res = await axiosInstance.post(endpoint, data, { headers });

            if (res.data.status === 200) {
                Swal.fire({ icon: 'success', text: 'Work Shift saved successfully!' }).then(() => {
                  refetchWorkShifts();
                  // navigate(`/admin/workshift/${res.data.client_id}/${res.data.shift_id}`);
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', text: 'Error saving work shift!' });
        }
    };
  
    return {
      isEdit, setIsEdit,
      isLoading: workShiftIsLoading,
      shiftName, setShiftName,
      shiftType, handleShiftTypeChange,
      firstLabel, setFirstLabel,
      secondLabel, setSecondLabel,
      regularTimeIn, setRegularTimeIn,
      regularTimeOut, setRegularTimeOut,
      splitFirstTimeIn, setSplitFirstTimeIn,
      splitFirstTimeOut, setSplitFirstTimeOut,
      splitSecondTimeIn, setSplitSecondTimeIn,
      splitSecondTimeOut, setSplitSecondTimeOut,
      breakStart, setBreakStart,
      breakEnd, setBreakEnd,
      overTimeIn, setOverTimeIn,
      overTimeOut, setOverTimeOut,
      errors,
      workDays,
      handleSplitFirstTimeOutChange, handleSplitSecondTimeInChange, handleWorkDaysChanges,
      checkInput,
    };
}

