import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader }  from "../utils/axiosConfig";
import { useState } from 'react';
const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];
import Swal from "sweetalert2";

const buildParams = (filters = {}, pagination = {}) => {
    const {name, branch_id, department_id, incentive_id} = filters;
    const {page = 1, per_page = 10} = pagination;
    const params = {};
    
    if (name) params.name = name;
    if (branch_id) params.branch_id = branch_id;
    if (department_id) params.department_id = department_id;
    if (incentive_id) params.incentive_id = incentive_id;
    if (page) params.page = page;
    if (per_page) params.per_page = per_page;
    return params;
}

export function useIncentive(enabled = true){
    const query = useQuery(["incentives"], async () => {
        const { data } = await axiosInstance.get("compensation/getIncentives", {
            headers,
        });
        return data;
    }, {enabled});
    return{
        incentivesData: query.data,
        isIncentivesLoading: query.isLoading,
        isIncentivesError: query.isError,
        refetchIncentives: query.refetch,
    }
}

export function useAssignableIncentives(userName = null){
    const query = useQuery(["assignableIncentives", userName], async () => {
        const { data } = await axiosInstance.get("compensation/getAssignableIncentives", {
            headers, params: {username: userName}
        });
        return data;
    }, {enabled: !!userName});

    return{
        incentivesData: query.data,
        isIncentivesLoading: query.isLoading,
        isIncentivesError: query.isError,
        refetchIncentives: query.refetch,
    }
}

export function useEmployeesIncentives(filters = {}, pagination = {}, enabled = true) {
    const params = buildParams(filters, pagination);
    const query = useQuery(["employeesIncentives", {filters, pagination}], async () => {
        const { data } = await axiosInstance.get("compensation/getEmployeesIncentives", {
            headers, params,
        });
        return data;
    }, {enabled});
    return{
        employeesIncentives: query.data,
        isEmployeesIncentivesLoading: query.isLoading,
        isEmployeesIncentivesError: query.isError,
        refetchEmployeesIncentives: query.refetch,
    }
}

export function useEmployeeIncentives (userName, incentiveId = null){
    const query = useQuery(["employeeIncentives", userName, incentiveId], async () => {
        const {data} = await axiosInstance.get("compensation/getEmployeeIncentives", {
            headers, params: {username: userName, incentive_id: incentiveId},
        });
        return data;
    },{enabled: !!userName,});
    return{
        employeeIncentives: query.data,
        isEmployeeIncentivesLoading: query.isLoading,
        isEmployeeIncentivesError: query.isError,
        refetchEmployeeIncentives: query.refetch,
    }
}

export function useManageIncentives({incentive, onSuccess} = {}){
    const [incentivesNameError, setIncentivesNameError] = useState(false);
    const [incentivesAmountError, setIncentivesAmountError] = useState(false);
    const [incentivesPercentageError, setIncentivesPercentageError] = useState(false);

    const [incentivesName, setIncentivesName] = useState(incentive? incentive.name : '');
    const [incentivesType, setIncentivesType] = useState(incentive? incentive.type : '');
    const [incentivesAmount, setIncentivesAmount] = useState(incentive? incentive.amount : '');
    const [incentivesPercentage, setIncentivesPercentage] = useState(incentive? incentive.percentage : '');

    const [paymentSchedule, setPaymentSchedule] = useState(incentive? incentive.payment_schedule : 1);

    const handleInputChange = (e, setValue) => {
        const formattedValue = formatCurrency(e.target.value);
        setValue(formattedValue);
    };

    const checkInput = (event) => {
        event.preventDefault();
        setIncentivesNameError(!incentivesName ? true: false);
        setIncentivesAmountError((incentivesType === "Amount" && !incentivesAmount) ? true: false);
        setIncentivesPercentageError((incentivesType === "Percentage" && !incentivesPercentage) ? true: false);

        if( incentivesNameError || incentivesAmountError || incentivesPercentageError)
        {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
            return;
        }
        const confirmText = !incentive ? "You want to add this Incentive" : "You want to update this Incentive"
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: confirmText,
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: '#177604',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
        }).then((res) => {
            if (res.isConfirmed) {
                saveInput(event);
            }
        });
    }

    const saveInput = (event) => {
        event.preventDefault();
        const amount = parseFloat(incentivesAmount.replace(/,/g, "")) || 0;
        const percentage = parseFloat(incentivesPercentage.replace(/,/g, "")) || 0;

        const data = {
            incentive_id: incentive ? incentive.id: null,
            name: incentivesName,
            type: incentivesType,
            amount: amount,
            percentage: percentage,
            payment_schedule: paymentSchedule,
        };
        !incentive ? saveIncentives({data: data, onSuccess: onSuccess}): updateIncentives({data: data, onSuccess: onSuccess}); 
    };

    return{
        //values
        incentivesName, incentivesType,
        incentivesAmount, incentivesPercentage, paymentSchedule,
        //errors
        incentivesNameError, incentivesAmountError, incentivesPercentageError,
        //functions
        setIncentivesName, setIncentivesType, 
        setIncentivesAmount, setIncentivesPercentage, setPaymentSchedule,
        handleInputChange, checkInput,
    }
}

export function useSaveEmployeeIncentives () {
    const queryClient = useQueryClient();
    return useMutation(async ({data}) => {
        return await axiosInstance.post('/compensation/saveEmployeeIncentives', data, { headers });
    },
    {
        onSuccess: (response, variables) => {
            if (response.data.status === 200) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Incentives Saved successfully!",
                    icon: "success",
                    showConfirmButton: true,
                    confirmButtonText: 'Proceed',
                    confirmButtonColor: '#177604',
                }).then(() => {
                    if (variables?.onSuccessCallback) {
                        variables.onSuccessCallback();
                    }
                });
            }
        },
        onError: (error) => {
            console.error("Error:", error);
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Error saving incentive!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        }
    });
}

export function useUpdateEmployeeIncentive (){
    const queryClient = useQueryClient();
    return useMutation(async ({data}) => {
        return await axiosInstance.post('/compensation/updateEmployeeIncentive', data, { headers });
    }, 
    {
        onSuccess: (response, variables) => {
            if (response.data.status === 200) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Incentive Updated successfully!",
                    icon: "success",
                    showConfirmButton: true,
                    confirmButtonText: 'Proceed',
                    confirmButtonColor: '#177604',
                }).then(() => {
                    if (variables?.onSuccessCallback) {
                        variables.onSuccessCallback();
                    }
                });
            }
        },
        onError: (error) => {
            console.error("Error:", error);
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Error updating incentive!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        }
    });
}

const formatCurrency = (value) => {
    if (!value) return "";

    let sanitizedValue = value.replace(/[^0-9.]/g, "");

    const parts = sanitizedValue.split(".");
    if (parts.length > 2) {
        sanitizedValue = parts[0] + "." + parts.slice(1).join("");
    }

    let [integerPart, decimalPart] = sanitizedValue.split(".");
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    if (decimalPart !== undefined) {
        decimalPart = decimalPart.slice(0, 2);
        return decimalPart.length > 0 ? `${integerPart}.${decimalPart}` : integerPart + ".";
    }

    return integerPart;
};

const saveIncentives = async ({data, onSuccess}) => {
    try{
        const response = await axiosInstance.post('/compensation/saveIncentives', data, { headers });
        if(response.data.status === 200){
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Incentive Saved successfully!",
                icon: "success",
                showConfirmButton: true,
                confirmButtonText: 'Proceed',
                confirmButtonColor: '#177604',
            }).then(() => {
                if (onSuccess) onSuccess();
            });
        }
    }
    catch (error) {
        console.error("Error:", error);
        Swal.fire({
            customClass: { container: 'my-swal' },
            text: "Error saving incentive!",
            icon: "error",
            showConfirmButton: true,
            confirmButtonColor: '#177604',
        });
    }

}

const updateIncentives = async ({data, onSuccess}) => {
    try{
        const response = await axiosInstance.post('/compensation/updateIncentives', data, { headers });
        if(response.data.status === 200){
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Incentives Updated successfully!",
                icon: "success",
                showConfirmButton: true,
                confirmButtonText: 'Proceed',
                confirmButtonColor: '#177604',
            }).then(() => {
                if (onSuccess) onSuccess();
            });
        }
    }
    catch (error) {
        console.error("Error:", error);
        Swal.fire({
            customClass: { container: 'my-swal' },
            text: "Error saving Incentives!",
            icon: "error",
            showConfirmButton: true,
            confirmButtonColor: '#177604',
        });
    }
}