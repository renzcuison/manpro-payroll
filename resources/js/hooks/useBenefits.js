import { useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";
import { useState } from 'react';

const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];
import Swal from "sweetalert2";

//<-------------------[HOOK FUNCTION SECTION]------------------>
export function useBenefit(enabled = true, username = null){
    const isEnabled = Boolean(enabled);
    const query = useQuery(["benefits"], async () => {
        const { data } = await axiosInstance.get("compensation/getBenefits", {
            headers,
        });
        return data;
    }, {enabled: isEnabled});

    return{
        benefitsData: query.data,
        isBenefitsLoading: query.isLoading,
        isBenefitsError: query.isError,
        refetchBenefits: query.refetch,
    }
}

export function useAssignableBenefits(userName = null){
    const query = useQuery(["assignableBenefits", userName], async () => {
        const { data } = await axiosInstance.get("compensation/getAssignableBenefits", {
            headers, params: {username: userName}
        });
        return data;
    }, {enabled: !!userName});

    return{
        benefitsData: query.data,
        isBenefitsLoading: query.isLoading,
        isBnefitsError: query.isError,
        refetchBenefits: query.refetch,
    }
}

export function useEmployeesBenefits(filters = {}, pagination = {}, enabled = true) {
    const params = buildParams(filters, pagination);
    const query = useQuery(["employeesBenefits", {filters, pagination}], async () => {
        const { data } = await axiosInstance.get("compensation/getEmployeesBenefits", {
            headers, params,
        });
        return data;
    }, {enabled});
    return{
        employeesBenefits: query.data,
        isEmployeesBenefitsLoading: query.isLoading,
        isEmployeesBenefitsError: query.isError,
        refetchEmployeesBenefits: query.refetch,
    }
}

export function useEmployeeBenefits(userName, benefitId = null){
    const query = useQuery(["employeeBenefits", userName, benefitId], async () => {
        const {data} = await axiosInstance.get("compensation/getEmployeeBenefits", {
            headers, params: {username: userName, benefit_id: benefitId},
        });
        return data;
    },{enabled: !!userName,});
    return {
        employeeBenefits: query.data,
        isEmployeeBenefitsLoading: query.isLoading,
        isEmployeeBenefitsError: query.isError,
        refetchEmployeeBenefits: query.refetch,
    }
}

//#handles the adding or updating of benefits type
export function useManageBenefits({benefit, onSuccess} = {}) {
    const [benefitName, setBenefitName] = useState(benefit?.name || '');
    const [benefitType, setBenefitType] = useState(benefit?.type || '');
    const [employeeAmountShare, setEmployeeAmountShare] = useState(benefit?.employee_amount || '');
    const [employerAmountShare, setEmployerAmountShare] = useState(benefit?.employer_amount || '');
    const [employeePercentageShare, setEmployeePercentageShare] = useState(benefit?.employee_percentage || '');
    const [employerPercentageShare, setEmployerPercentageShare] = useState(benefit?.employer_percentage || '');
    const [paymentSchedule, setPaymentSchedule] = useState(benefit?.payment_schedule || 1);
    const [bracketListErrors, setBracketListErrors] = useState([]);

    const [benefitNameError, setBenefitNameError] = useState(false);
    const [employeeAmountShareError, setEmployeeAmountShareError] = useState(false);
    const [employerAmountShareError, setEmployerAmountShareError] = useState(false);
    const [employeePercentageShareError, setEmployeePercentageShareError] = useState(false);
    const [employerPercentageShareError, setEmployerPercentageShareError] = useState(false);
    const [bracketsList, setBracketsList] = useState(benefit?.benefit_brackets || []);
    

    const handleInputChange = (e, setValue) => {
        const formattedValue = formatCurrency(e.target.value);
        setValue(formattedValue);
    };

    const handleAddBracketsField = () => {
        const last = bracketsList[bracketsList.length - 1];
        let newStart = '0.00';
    
        if (last) {
            const end = last.range_end
                ? parseFloat(String(last.range_end).replace(/,/g, ''))
                : last.range_start
                ? parseFloat(String(last.range_start).replace(/,/g, ''))
                : 0;
    
            newStart = (end + 0.01).toFixed(2);
            if (!last.range_end || last.range_end === '') {
                const updatedEnd = (parseFloat(newStart) - 0.01).toFixed(2);
                last.range_end = formatCurrency(updatedEnd);
            }
        }
    
        const newField = {
            range_start: formatCurrency(newStart),
            range_end: '',
            employee_share: '',
            employer_share: '',
        };
        
        const updatedList = last ? [...bracketsList] : []; 
        updatedList.push(newField);
        setBracketsList(updatedList);
    };

    const handleBracketChanges = (index, field, value) => {
        //store list for processing
        const newList = [...bracketsList];
        const current = newList[index];
        let val = formatCurrency(value);
    
        if (field === 'range_end') {
            current.range_end = val;
    
            const currentRangeEnd = parseFloat(value.replace(/,/g, ''));
            let nextStart = currentRangeEnd + 0.01;
    
            for (let i = index + 1; i < newList.length; i++) {
                const next = newList[i];
                const existingNextEnd = parseFloat(next.range_end?.replace(/,/g, '') || 0);
    
                next.range_start = formatCurrency(nextStart.toFixed(2));
                //check if there is a next field, and that if the current edited range_end field is greater than the next range_end field
                if (!existingNextEnd || currentRangeEnd >= existingNextEnd) {
                    if (i < newList.length - 1) {
                        const nextEnd = nextStart + 0.99;
                        next.range_end = formatCurrency(nextEnd.toFixed(2));
                    } else {
                        next.range_end = ''; // open-ended
                    }
    
                    nextStart = parseFloat(next.range_end?.replace(/,/g, '') || 0) + 0.01;
                } else {
                    nextStart = existingNextEnd + 0.01; //ensure that the next range_start field after this field is in sync
                    break; 
                }
            }
        } else {
            current[field] = val;
        }
    
        setBracketsList(newList);
    };

    const handleRemoveBracketsField = (indxToRemove) => {
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
            if(res.isConfirmed){
                const updated = [...bracketsList];
                updated.splice(indxToRemove, 1);

                // Re-adjust previous range_end if deleted one was last
                if (updated.length > 0 && indxToRemove === updated.length) {
                    updated[updated.length - 1].range_end = null;
                }
                setBracketsList(updated);
            }
        });
    }

    //for Bracket types only (Checks for any empty values, aside from the last bracket)
    const validateBrackets = () => {
        const errors = {}; 
        if (benefitType === "Bracket Amount" || benefitType === "Bracket Percentage") {
            bracketsList.forEach((bracket, index) => {
                const hasEmpty = Object.entries(bracket).some(([key, val]) => {
                    if (key === 'range_end' && index === bracketsList.length - 1) return false;
                    return val === '' || val === null || val === undefined;
                });
    
                if (hasEmpty) {
                    errors[index] = true;
                }
            });
        }
        setBracketListErrors(errors);
        return Object.keys(errors).length > 0;
    };

    const checkInput = (event) => {
        event.preventDefault();
        setBenefitNameError(!benefitName ? true: false);
        setEmployeeAmountShareError((!benefitType === "Amount" && !employeeAmountShare)? true : false);
        setEmployerAmountShareError((!benefitType === "Amount" && !employerAmountShare)? true : false);
        setEmployeePercentageShareError((!benefitType === "Percentage" && !employeePercentageShare)? true : false);
        setEmployerPercentageShareError((!benefitType === "Percentage" && !employerPercentageShare)? true : false); 
        const isSomeBracketFieldsEmpty = validateBrackets();

        if(!benefitName
        || employeeAmountShareError || employerAmountShareError
        || employeePercentageShareError || employerPercentageShareError
        || isSomeBracketFieldsEmpty)
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

        //since the second-to-the-last range end field doesn't affect the preceding range end fields
        if ((benefitType === "Bracket Amount" || benefitType === "Bracket Percentage") && bracketsList.length >= 2) {
            const secondToLastIndex = bracketsList.length - 2;
            const secondToLastEnd = parseFloat(bracketsList[secondToLastIndex]?.range_end?.replace(/,/g, '') || 0);
        
            const precedingEndValues = bracketsList
                .slice(0, secondToLastIndex)
                .map(b => parseFloat(b.range_end?.replace(/,/g, '') || 0));
        
            const hasInvalidReduction = precedingEndValues.some(prevEnd => secondToLastEnd < prevEnd);
        
            if (hasInvalidReduction) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "The second-to-the-last bracket's range end cannot be less than any of the preceding range ends.",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
                return;
            }
        }

        const confirmText = (!benefit) ? "You want to add this benefit": "You want to update this benefit";
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
            if(res.isConfirmed){ 
                saveInput(event);
            }
        })
    } 

    const saveInput = (event) => {
        event.preventDefault();
        let convertedBrackets = []
        if((benefitType === "Bracket Amount" || benefitType === "Bracket Percentage")){
            convertedBrackets = bracketsList.map(item => {
                const newItem = {};
                for (const key in item) {
                    //used when updating data instead of inserting (necessary to skip them in the conversion as they are numbers and not strings)
                    if (['id', 'benefit_id'].includes(key)) {
                        newItem[key] = item[key];
                        continue;
                    }
                    const rawValue = typeof item[key] === 'string'
                    ? item[key].replace(/,/g, '')
                    : item[key];
                    newItem[key] = rawValue === "" ? "" : parseFloat(rawValue);
                }
                return newItem;
            });
        }
        
        const employeeAmount = parseFloat(employeeAmountShare.replace(/,/g, "")) || 0;
        const employerAmount = parseFloat(employerAmountShare.replace(/,/g, "")) || 0;
        const employeePercentage = parseFloat(employeePercentageShare.replace(/,/g, "")) || 0;
        const employerPercentage = parseFloat(employerPercentageShare.replace(/,/g, "")) || 0;

        const data = {
	        benefit_id: benefit ? benefit.id : null,
            benefitName: benefitName,
            benefitType: benefitType,
            employeeAmount: employeeAmount,
            employerAmount: employerAmount,
            employeePercentage: employeePercentage,
            employerPercentage: employerPercentage,
            brackets_list: convertedBrackets,
            payment_schedule: paymentSchedule,
        };

        !benefit ? saveBenefits({data: data, onSuccess: onSuccess}): updateBenefits({data: data, onSuccess: onSuccess});
    };

    return{
        //values
        benefitName, benefitType, 
        employeeAmountShare, employerAmountShare, 
        employeePercentageShare, employerPercentageShare, 
        paymentSchedule, benefitNameError,
        employeeAmountShareError, employerAmountShareError,
        employeePercentageShareError, employerPercentageShareError, bracketsList, bracketListErrors,

        //functions
        setBenefitName, setBenefitType,
        setEmployeeAmountShare, setEmployerAmountShare, 
        setEmployeePercentageShare, setEmployerPercentageShare, setPaymentSchedule, setBracketsList,
        checkInput, handleInputChange, handleAddBracketsField, handleBracketChanges, handleRemoveBracketsField
    }
}

export function useSaveEmployeeBenefits () {
    return useMutation(async ({data}) => {
        return await axiosInstance.post('/compensation/saveEmployeeBenefits', data, { headers });
    },
    {
        onSuccess: (response, variables) => {
            if (response.data.status === 200) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Benefits Saved successfully!",
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
                text: "Error saving benefit!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        }
    });
}

export function useUpdateEmployeeBenefit (){
    return useMutation(async ({data}) => {
        return await axiosInstance.post('/compensation/updateEmployeeBenefit', data, { headers });
    }, 
    {
        onSuccess: (response, variables) => {
            if (response.data.status === 200) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Benefit Updated successfully!",
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
                text: "Error updating benefit!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        }
    });
}
//<-------------------[HOOK FUNCTION END-SECTION]------------------>


//<-------------------[REGULAR & HELPER FUNCTIONS SECTION]------------------>

const buildParams = (filters = {}, pagination = {}) => {
    const {name, branch_id, department_id, benefit_id} = filters;
    const {page = 1, per_page = 10} = pagination;
    const params = {};
    
    if (name) params.name = name;
    if (branch_id) params.branch_id = branch_id;
    if (department_id) params.department_id = department_id;
    if (benefit_id) params.benefit_id = benefit_id;
    if (page) params.page = page;
    if (per_page) params.per_page = per_page;
    return params;
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



const saveBenefits = async ({data, onSuccess}) => {
    try{
        const response = await axiosInstance.post('/compensation/saveBenefits', data, { headers });
        if(response.data.status === 200){
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: response.data.message,
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
            text: "Error saving benefits!",
            icon: "error",
            showConfirmButton: true,
            confirmButtonColor: '#177604',
        });
    }
}

const updateBenefits = async ({data, onSuccess}) => {
    try{
        const response = await axiosInstance.post('/compensation/updateBenefits', data, { headers });
        if(response.data.status === 200){
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: response.data.message,
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
            text: "Error saving benefits!",
            icon: "error",
            showConfirmButton: true,
            confirmButtonColor: '#177604',
        });
    }
}



