import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";
import Swal from "sweetalert2";

const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];

export function useDepartments({departmentId = null, loadDepartments = false, loadDeptWithPositions = false, loadDeptPositions = false} = {}){
    const departments = useQuery(["departments"], async () => {
        const {data} = await axiosInstance.get("settings/getDepartments", { headers });
        return data;
    }, {enabled: loadDepartments});

    const departmentsWithPositions = useQuery(['departmentsWithPositions'], async () => {
        const {data} = await axiosInstance.get('/settings/getDepartmentWithEmployeePosition', { headers });
        return data;
    }, {enabled: loadDeptWithPositions});

    const departmentPositions = useQuery(['departmentPositions'], async () => {
        const {data} = await axiosInstance.get('/settings/getDepartmentPositions', { headers });
        return data;
    }, {enabled: loadDeptPositions});

    const departmentDetails = useQuery(['departmentDetails', departmentId], async () => {
        const {data} = await axiosInstance.get('settings/getDepartmentDetails', {headers, params: {departmentId: departmentId}});
        return data;
    }, {enabled: !! departmentId});

    const saveDepartment = useMutation(
        async ({ data }) => {
            return await axiosInstance.post('/settings/saveDepartment', data, { headers });
        },
        {
            onSuccess: (response, variables) => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Department saved successfully!",
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
                    text: "Error saving department!",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            }
        }
    );
    
    return{
        departments, departmentPositions, departmentDetails, departmentsWithPositions, saveDepartment
    }

}