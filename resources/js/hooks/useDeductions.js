import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";
const storedUser = localStorage.getItem("nasya_user");
import { useState } from 'react';
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];
import Swal from "sweetalert2";

const buildParams = (filters = {}, pagination = {}) => {
    const {name, branch_id, department_id, deduction_id} = filters;
    const {page = 1, per_page = 10} = pagination;
    const params = {};
    
    if (name) params.name = name;
    if (branch_id) params.branch_id = branch_id;
    if (department_id) params.department_id = department_id;
    if (deduction_id) params.deduction_id = deduction_id;
    if (page) params.page = page;
    if (per_page) params.per_page = per_page;
    return params;
}

export function useDeduction(enabled = true){
    const query = useQuery(["deductions"], async () => {
        const { data } = await axiosInstance.get("compensation/getDeductions", {
            headers,
        });
        return data;
    }, {enabled});
    return {
        deductionsData: query.data,
        isDeductionsLoading: query.isLoading,
        isDeductionsError: query.isError,
        refetchDeductions: query.refetch,
    }
}

export function useEmployeesDeductions(filters = {}, pagination = {}, enabled = true){
    const params = buildParams(filters, pagination);
    const query = useQuery(["employeesDeductions", {filters, pagination}], async () => {
        const { data } = await axiosInstance.get("compensation/getEmployeesDeductions", {
            headers, params,
        });
        return data;
    }, {enabled});

    return {
        employeesDeductions: query.data,
        isEmployeesDeductionsLoading: query.isLoading,
        isEmployeesDeductionsError: query.isError,
        refetchEmployeesDeductions: query.refetch,
    }
}

export function useEmployeeDeductions(userName, deductionId = null){
    const query = useQuery(["employeeDeductions", userName, deductionId], async () => {
        const {data} = await axiosInstance.get("compensation/getEmployeeDeductions", {
            headers, params: {username: userName, deduction_id: deductionId},
        });
        return data;
    },{
        enabled: !!userName,
    });
    return{
        employeeDeductions: query.data,
        isEmployeeDeductionsLoading: query.isLoading,
        isEmployeDeductionsError: query.isError,
        refetchEmployeeDeductions: query.refetch,
    }
}

export function useManageDeductions({deduction, onSuccess}){
    const [deductionsNameError, setDeductionsNameError] = useState(false);
    const [deductionsAmountError, setDeductionsAmountError] = useState(false);
    const [deductionsPercentageError, setDeductionsPercentageError] = useState(false);

    const [deductionsName, setDeductionsName] = useState(deduction ? deduction.name : '');
    const [deductionsType, setDeductionsType] = useState(deduction ? deduction.type : '');
    const [deductionsAmount, setDeductionsAmount] = useState(deduction ? deduction.amount : '');
    const [deductionsPercentage, setDeductionsPercentage] = useState(deduction ? deduction.percentage : '');

    const [paymentSchedule, setPaymentSchedule] = useState(deduction ? deduction.payment_schedule : 1);

    const handleInputChange = (e, setValue) => {
        const formattedValue = formatCurrency(e.target.value);
        setValue(formattedValue);
    };

    const checkInput = (event) => {
        event.preventDefault();
        setDeductionsNameError(!deductionsName ? true : false);
        setDeductionsAmountError((deductionsType === "Amount" && !deductionsAmount) ? true: false);
        setDeductionsPercentageError((deductionsType === "Percentage" && !deductionsPercentage) ? true : false);

        if(deductionsNameError || deductionsAmountError || deductionsPercentageError){
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
            return;
        }
        const confirmText = !deduction ? "You want to add this Deduction" : "You want to update this Deduction"
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
    };

    const saveInput = (event) => {
        event.preventDefault();
        const amount = parseFloat(deductionsAmount.replace(/,/g, "")) || 0;
        const percentage = parseFloat(deductionsPercentage.replace(/,/g, "")) || 0;

        const data = {
            deduction_id: deduction ? deduction.id : null,
            name: deductionsName,
            type: deductionsType,
            amount: amount,
            percentage: percentage,
            payment_schedule: paymentSchedule,
        };
        !deduction ? saveDeductions({data: data, onSuccess: onSuccess}): updateDeductions({data: data, onSuccess: onSuccess});
    };

    return{
        //values
        deductionsName, deductionsType, deductionsAmount, deductionsPercentage, paymentSchedule,
        //errors
        deductionsNameError, deductionsAmountError, deductionsPercentageError,
        //function
        setDeductionsName, setDeductionsType, setDeductionsAmount, setDeductionsPercentage, setPaymentSchedule,
        handleInputChange, checkInput
    }
}

export function useSaveEmployeeDeductions(){
    return useMutation(async ({data}) => {
        return await axiosInstance.post('/compensation/saveEmployeeDeductions', data, { headers });
    },
    {
        onSuccess: (response, variables) => {
            if (response.data.status === 200) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Deduction Saved successfully!",
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
                text: "Error saving deduction!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        }
    });
}

export function useUpdateEmployeeDeduction(){
    return useMutation(async ({data}) => {
        return await axiosInstance.post('/compensation/updateEmployeeDeduction', data, { headers });
    },
    {
        onSuccess: (response, variables) => {
            if (response.data.status === 200) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Deduction updated successfully!",
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
                text: "Error saving deduction!",
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

const saveDeductions = async ({data, onSuccess}) => {
    try{
        const response = await axiosInstance.post('/compensation/saveDeductions', data, { headers });
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

const updateDeductions = async ({data, onSuccess}) => {
    try{
        const response = await axiosInstance.post('/compensation/updateDeductions', data, { headers });
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
