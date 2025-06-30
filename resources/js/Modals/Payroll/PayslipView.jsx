import { Box, IconButton, Dialog, DialogTitle, DialogContent, Typography, Button } from "@mui/material";
import React from "react";
import axiosInstance, { getJWTHeader } from "../../utils/axiosConfig";
import "react-quill/dist/quill.snow.css";
import Swal from 'sweetalert2';

import { useUser } from '../../hooks/useUser';
import Payslip from "../../components/Payroll/Payslip";

const PayslipView = ({ open, close, selectedPayroll }) => {
    const { user } = useUser();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const handleDeletePayslip = () => {
        document.activeElement.blur();
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Delete Payslip?",
            text: "Are you sure you want to delete? This action is irreversible!",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#177604",
            showCancelButton: true,
            cancelButtonText: "Cancel",
        }).then((res) => {
            if (res.isConfirmed) {
                const data = { uid: selectedPayroll };

                axiosInstance.post("/payroll/deletePayslip", data, { headers })
                    .then((response) => {
                        if (response.data.status == 200) {
                            document.activeElement.blur();
                            document.body.removeAttribute("aria-hidden");
                            Swal.fire({
                                customClass: { container: "my-swal" },
                                title: "Success!",
                                text: `Payslip successfully deleted!`,
                                icon: "success",
                                showConfirmButton: true,
                                confirmButtonText: "Okay",
                                confirmButtonColor: "#177604",
                            }).then((res) => {
                                if (res.isConfirmed) {
                                    close();
                                    document.body.setAttribute("aria-hidden", "true");
                                } else {
                                    document.body.setAttribute("aria-hidden", "true");
                                }
                            });
                        }
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                        document.body.setAttribute("aria-hidden", "true");
                    });
            }
        });
    }

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="lg" PaperProps={{ style: { padding: "16px", backgroundColor: "#f8f9fa", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", borderRadius: "20px", minWidth: "1200px", maxWidth: "1500px", marginBottom: "5%" }}}>
                <DialogTitle sx={{ padding: 4 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: "bold" }} >
                            {" "}Employee Payslip{" "}
                        </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                
                    <DialogContent sx={{ px: 5, pb: 5 }}>
                        <Payslip selectedPayroll={selectedPayroll} />
                        
                        {user.user_type === "Admin" && (
                            <Box display="flex" justifyContent="center" sx={{ marginTop: 8 }}>
                                <Button onClick={handleDeletePayslip} variant="contained" sx={{ backgroundColor: '#f44336', color: 'white' }} >
                                    <p className='m-0'><i className="fa fa-trash mr-2 mt-1"></i> Delete Payslip</p>
                                </Button>
                            </Box>
                        )}
                    </DialogContent>
            </Dialog>
        </>
    );
};

export default PayslipView;
