import React, { useEffect, useRef, useState } from "react";
import {
    FormControl,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Select,
    MenuItem,
    InputLabel,
    Box,
    TextField,
    FormGroup,
    Button,
    Icon,
    TablePagination,
    TableHead,
    Grid,
    Input,
} from "@mui/material";
import HomeLogo from "../../../images/home-logo.png";
import axiosInstance, { getJWTHeader } from "../../utils/axiosConfig";
import Swal from "sweetalert2";
import moment from "moment";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
    topScrollPaper: {
        alignItems: "flex-start",
    },
    topPaperScrollBody: {
        verticalAlign: "top",
    },
});

const SummaryUpdateModal = ({ open, close, cutoff, from, to }) => {
    const classes = useStyles();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [employeeData, setEmployeeData] = useState({
        fname: "",
        mname: "",
        lname: "",
        grosspay: "",
        sss_employee: "",
        sss_employer: "",
        phil_employee: "",
        phil_employer: "",
        pgbig_employee: "",
        pgbig_employer: "",
        total_deduction: "",
        net_pay: "",
        cutoff: cutoff,
        fromDate: from,
        toDate: to,
    });

    const handleChange = (e) => {
        setEmployeeData({
            ...employeeData,
            [e.target.id]:
                e.target.id != "fname" &&
                e.target.id != "mname" &&
                e.target.id != "lname"
                    ? parseInt(e.target.value)
                    : e.target.value,
        });
    };
    const handleSubmitEmployee = (e) => {
        e.preventDefault();
        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "You want to Add this Employee?",
            icon: "question",
            dangerMode: true,
            showCancelButton: true,
        }).then((res) => {
            if (res.isConfirmed) {
                axiosInstance
                    .post("/add_payroll_summary_employee", employeeData, {
                        headers,
                    })
                    .then((response) => {
                        if (response.data.EmployeeData === "Success") {
                            close();
                            Swal.fire({
                                customClass: {
                                    container: "my-swal",
                                },
                                title: "Success!",
                                text: "Payroll Summary has been Updated successfully",
                                icon: "success",
                                timer: 1000,
                                showConfirmButton: false,
                            }).then(() => {
                                location.reload();
                            });
                        } else {
                            alert("Something went wrong");
                        }
                    })
                    .catch((error) => {
                        // alert(error.response.data.message + ' Please Fill up all the fields')
                        new Swal({
                            customClass: {
                                container: "my-swal",
                            },
                            title: "Success!",
                            text: `${error.response.data.message} Please Fill up all the fields`,
                            icon: "error",
                            dangerMode: true,
                        });
                    });
            }
        });
    };
    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth="md"
            scroll="paper"
            classes={{
                scrollPaper: classes.topScrollPaper,
                paperScrollBody: classes.topPaperScrollBody,
            }}
        >
            <DialogTitle className="d-flex justify-content-between">
                <Typography>Add New Employee Summary</Typography>
                <IconButton sx={{ color: "red" }} onClick={close}>
                    <i className="si si-close"></i>
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <div
                    className=" payroll_details pt-10 px-2"
                    style={{ width: "100%" }}
                >
                    <Box
                        component="div"
                        className="p-10"
                        sx={{ marginTop: "20px" }}
                    >
                        <Grid container spacing={3}>
                            <Grid item xs={4}>
                                <FormControl
                                    fullWidth
                                    sx={{
                                        "& label.Mui-focused": {
                                            color: "#c4c4c4",
                                        },
                                        "& .MuiOutlinedInput-root": {
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#c4c4c4",
                                            },
                                        },
                                    }}
                                >
                                    <InputLabel
                                        shrink={true}
                                        sx={{
                                            backgroundColor: "white",
                                            paddingLeft: 1,
                                            paddingRight: 1,
                                            borderColor: "#97a5ba",
                                        }}
                                    >
                                        Firstname
                                    </InputLabel>
                                    <input
                                        type="text"
                                        className="form-control bg-white bg-white"
                                        id="fname"
                                        value={employeeData.fname}
                                        onChange={handleChange}
                                        style={{ height: 50 }}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                                <FormControl
                                    fullWidth
                                    sx={{
                                        "& label.Mui-focused": {
                                            color: "#c4c4c4",
                                        },
                                        "& .MuiOutlinedInput-root": {
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#c4c4c4",
                                            },
                                        },
                                    }}
                                >
                                    <InputLabel
                                        shrink={true}
                                        sx={{
                                            backgroundColor: "white",
                                            paddingLeft: 1,
                                            paddingRight: 1,
                                            borderColor: "#97a5ba",
                                        }}
                                    >
                                        Middlename
                                    </InputLabel>
                                    <input
                                        type="text"
                                        className="form-control bg-white bg-white"
                                        id="mname"
                                        value={employeeData.mname}
                                        onChange={handleChange}
                                        style={{ height: 50 }}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                                <FormControl
                                    fullWidth
                                    sx={{
                                        "& label.Mui-focused": {
                                            color: "#c4c4c4",
                                        },
                                        "& .MuiOutlinedInput-root": {
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#c4c4c4",
                                            },
                                        },
                                    }}
                                >
                                    <InputLabel
                                        shrink={true}
                                        sx={{
                                            backgroundColor: "white",
                                            paddingLeft: 1,
                                            paddingRight: 1,
                                            borderColor: "#97a5ba",
                                        }}
                                    >
                                        Lastname
                                    </InputLabel>
                                    <input
                                        type="text"
                                        className="form-control bg-white bg-white"
                                        id="lname"
                                        value={employeeData.lname}
                                        onChange={handleChange}
                                        style={{ height: 50 }}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl
                                    fullWidth
                                    sx={{
                                        "& label.Mui-focused": {
                                            color: "#c4c4c4",
                                        },
                                        "& .MuiOutlinedInput-root": {
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#c4c4c4",
                                            },
                                        },
                                    }}
                                >
                                    <InputLabel
                                        shrink={true}
                                        sx={{
                                            backgroundColor: "white",
                                            paddingLeft: 1,
                                            paddingRight: 1,
                                            borderColor: "#97a5ba",
                                        }}
                                    >
                                        Grosspay
                                    </InputLabel>
                                    <input
                                        type="number"
                                        className="form-control bg-white bg-white"
                                        id="grosspay"
                                        value={employeeData.grosspay}
                                        onChange={handleChange}
                                        style={{ height: 50 }}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl
                                    fullWidth
                                    sx={{
                                        "& label.Mui-focused": {
                                            color: "#c4c4c4",
                                        },
                                        "& .MuiOutlinedInput-root": {
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#c4c4c4",
                                            },
                                        },
                                    }}
                                >
                                    <InputLabel
                                        shrink={true}
                                        sx={{
                                            backgroundColor: "white",
                                            paddingLeft: 1,
                                            paddingRight: 1,
                                            borderColor: "#97a5ba",
                                        }}
                                    >
                                        SSS Employee
                                    </InputLabel>
                                    <input
                                        type="text"
                                        className="form-control bg-white bg-white"
                                        id="sss_employee"
                                        value={employeeData.sss_employee}
                                        onChange={handleChange}
                                        style={{ height: 50 }}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl
                                    fullWidth
                                    sx={{
                                        "& label.Mui-focused": {
                                            color: "#c4c4c4",
                                        },
                                        "& .MuiOutlinedInput-root": {
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#c4c4c4",
                                            },
                                        },
                                    }}
                                >
                                    <InputLabel
                                        shrink={true}
                                        sx={{
                                            backgroundColor: "white",
                                            paddingLeft: 1,
                                            paddingRight: 1,
                                            borderColor: "#97a5ba",
                                        }}
                                    >
                                        SSS Employer
                                    </InputLabel>
                                    <input
                                        type="text"
                                        className="form-control bg-white bg-white"
                                        id="sss_employer"
                                        value={employeeData.sss_employer}
                                        onChange={handleChange}
                                        style={{ height: 50 }}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl
                                    fullWidth
                                    sx={{
                                        "& label.Mui-focused": {
                                            color: "#c4c4c4",
                                        },
                                        "& .MuiOutlinedInput-root": {
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#c4c4c4",
                                            },
                                        },
                                    }}
                                >
                                    <InputLabel
                                        shrink={true}
                                        sx={{
                                            backgroundColor: "white",
                                            paddingLeft: 1,
                                            paddingRight: 1,
                                            borderColor: "#97a5ba",
                                        }}
                                    >
                                        PhilHealth Employee
                                    </InputLabel>
                                    <input
                                        type="text"
                                        className="form-control bg-white bg-white"
                                        id="phil_employee"
                                        value={employeeData.phil_employee}
                                        onChange={handleChange}
                                        style={{ height: 50 }}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl
                                    fullWidth
                                    sx={{
                                        "& label.Mui-focused": {
                                            color: "#c4c4c4",
                                        },
                                        "& .MuiOutlinedInput-root": {
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#c4c4c4",
                                            },
                                        },
                                    }}
                                >
                                    <InputLabel
                                        shrink={true}
                                        sx={{
                                            backgroundColor: "white",
                                            paddingLeft: 1,
                                            paddingRight: 1,
                                            borderColor: "#97a5ba",
                                        }}
                                    >
                                        PhilHealth Employer
                                    </InputLabel>
                                    <input
                                        type="text"
                                        className="form-control bg-white bg-white"
                                        id="phil_employer"
                                        value={employeeData.phil_employer}
                                        onChange={handleChange}
                                        style={{ height: 50 }}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl
                                    fullWidth
                                    sx={{
                                        "& label.Mui-focused": {
                                            color: "#c4c4c4",
                                        },
                                        "& .MuiOutlinedInput-root": {
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#c4c4c4",
                                            },
                                        },
                                    }}
                                >
                                    <InputLabel
                                        shrink={true}
                                        sx={{
                                            backgroundColor: "white",
                                            paddingLeft: 1,
                                            paddingRight: 1,
                                            borderColor: "#97a5ba",
                                        }}
                                    >
                                        Pag-ibig Employer
                                    </InputLabel>
                                    <input
                                        type="text"
                                        className="form-control bg-white bg-white"
                                        id="pgbig_employee"
                                        value={employeeData.pgbig_employee}
                                        onChange={handleChange}
                                        style={{ height: 50 }}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl
                                    fullWidth
                                    sx={{
                                        "& label.Mui-focused": {
                                            color: "#c4c4c4",
                                        },
                                        "& .MuiOutlinedInput-root": {
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#c4c4c4",
                                            },
                                        },
                                    }}
                                >
                                    <InputLabel
                                        shrink={true}
                                        sx={{
                                            backgroundColor: "white",
                                            paddingLeft: 1,
                                            paddingRight: 1,
                                            borderColor: "#97a5ba",
                                        }}
                                    >
                                        Pag-ibig Employer
                                    </InputLabel>
                                    <input
                                        type="text"
                                        className="form-control bg-white bg-white"
                                        id="pgbig_employer"
                                        value={employeeData.pgbig_employer}
                                        onChange={handleChange}
                                        style={{ height: 50 }}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl
                                    fullWidth
                                    sx={{
                                        "& label.Mui-focused": {
                                            color: "#c4c4c4",
                                        },
                                        "& .MuiOutlinedInput-root": {
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#c4c4c4",
                                            },
                                        },
                                    }}
                                >
                                    <InputLabel
                                        shrink={true}
                                        sx={{
                                            backgroundColor: "white",
                                            paddingLeft: 1,
                                            paddingRight: 1,
                                            borderColor: "#97a5ba",
                                        }}
                                    >
                                        Total Deduction
                                    </InputLabel>
                                    <input
                                        type="text"
                                        className="form-control bg-white bg-white"
                                        id="total_deduction"
                                        value={employeeData.total_deduction}
                                        onChange={handleChange}
                                        style={{ height: 50 }}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl
                                    fullWidth
                                    sx={{
                                        "& label.Mui-focused": {
                                            color: "#c4c4c4",
                                        },
                                        "& .MuiOutlinedInput-root": {
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#c4c4c4",
                                            },
                                        },
                                    }}
                                >
                                    <InputLabel
                                        shrink={true}
                                        sx={{
                                            backgroundColor: "white",
                                            paddingLeft: 1,
                                            paddingRight: 1,
                                            borderColor: "#97a5ba",
                                        }}
                                    >
                                        Net Take Home Pay
                                    </InputLabel>
                                    <input
                                        type="text"
                                        className="form-control bg-white bg-white"
                                        id="net_pay"
                                        value={employeeData.net_pay}
                                        onChange={handleChange}
                                        style={{ height: 50 }}
                                    />
                                </FormControl>
                            </Grid>
                        </Grid>
                        <FormControl
                            className="d-flex justify-content-center align-content-center align-items-center"
                            sx={{
                                marginBottom: 3,
                                marginTop: "50px",
                            }}
                        >
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{ width: "30%" }}
                                onClick={handleSubmitEmployee}
                            >
                                <i className="fa fa-check mt-1 p-2"></i> Submit
                            </Button>
                        </FormControl>
                    </Box>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SummaryUpdateModal;
