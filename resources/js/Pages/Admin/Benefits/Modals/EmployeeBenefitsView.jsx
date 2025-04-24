import {
    Box,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    TableContainer,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Table,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import EmployeeAddBenefit from "../../Employees/Modals/EmployeeAddBenefit";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(utc);
dayjs.extend(localizedFormat);

import EmployeeBenefitList from "../Components/EmployeeBenefitList";

const EmployeeBenefitsView = ({ open, close, userName }) => {

    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // ----------- Request Leave Credits
    useEffect(() => {
        // getBenefits();
    }, []);

    // ----------- Add Benefits Modal
    const [openAddEmployeeBenefit, setOpenEmployeeBenefit] = useState(false);
    const handleOpenAddEmployeeBenefit = () => {
        setOpenEmployeeBenefit(true);
    }
    const handleCloseAddEmployeeBenefit = (reload) => {
        setOpenEmployeeBenefit(false);
        if (reload) {
            getBenefits();
        }
    }

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { padding: "16px", backgroundColor: "#f8f9fa", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", borderRadius: "20px", maxHeight: "600px", minWidth: { xs: "100%", sm: "750px" }, maxWidth: "800px" }}}>
                <DialogTitle sx={{ padding: 2, paddingBottom: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} >
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: "bold" }}>
                            Employee Benefit
                        </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ py: 4, mb: 2 }}>
                    <EmployeeBenefitList userName={userName} headers={headers} />
                </DialogContent>

                {/* {openAddEmployeeBenefit &&
                    <EmployeeAddBenefit open={openAddEmployeeBenefit} close={handleCloseAddEmployeeBenefit} empId={employee.id} />
                } */}
            </Dialog >
        </>
    );
};

export default EmployeeBenefitsView;
