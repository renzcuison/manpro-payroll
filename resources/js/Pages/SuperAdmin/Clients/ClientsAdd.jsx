import {
    Box,
    Button,
    Typography,
    Paper,
    Stepper,
    Step,
    StepLabel,
    StepContent,
} from "@mui/material";

import Layout from "../../../components/Layout/Layout";
import CreateCompany from "./CreateCompany";
import CreateUser from "./CreateUser";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useClient } from "../hooks/useClients";
import EditClient from "./EditClient";
import AssignPackage from "./AssignPackage";
import { usePackages } from "../hooks/usePackages";

const steps = [
    {
        label: "User account information",
        description: "Enter your user account information",
        component: <CreateUser />,
    },
    {
        label: "Company Details",
        description: "Enter your company details",
        component: <CreateCompany />,
    },
    {
        label: "Select a package",
        description: "Select a package",
    },
];

const ClientsAdd = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [clientData, setClientData] = useState(null);
    const [companyData, setCompanyData] = useState(null);
    const { packages } = usePackages();
    const { state } = useLocation();

    useEffect(() => {
        if (state && state.id) {
            setClientData(state);
            setCompanyData(state.company);
        }
    }, [state]);

    const handleNext = () => {
        if (clientData) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        } else {
            alert("Please fill in all the fields");
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return clientData ? (
                    <EditClient
                        clientData={clientData}
                        companyData={companyData}
                        setClientData={setClientData}
                        setCompanyData={setCompanyData}
                    />
                ) : (
                    <CreateUser
                        clientData={clientData}
                        setClientData={setClientData}
                    />
                );
            case 1:
                return (
                    <CreateCompany
                        clientData={clientData}
                        setCompanyData={setCompanyData}
                        companyData={companyData}
                    />
                );
            case 2:
                return (
                    <AssignPackage company={companyData} packages={packages} />
                );
            default:
                return null;
        }
    };

    return (
        <Layout title={"EvaluateCreateForm"}>
            <Box sx={{}}>
                <Stepper activeStep={activeStep} orientation="vertical">
                    {steps.map((step, index) => (
                        <Step key={step.label}>
                            <StepLabel
                                optional={
                                    index === steps.length - 1 ? (
                                        <Typography variant="caption">
                                            Last step
                                        </Typography>
                                    ) : null
                                }
                            >
                                <Typography variant="h6">
                                    {step.label}
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                {renderStepContent(index)}
                                <Box sx={{ mb: 2, mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        sx={{ mr: 1 }}
                                        disabled={index !== 2 && !clientData}
                                    >
                                        {index === steps.length - 1
                                            ? "Finish"
                                            : "Continue"}
                                    </Button>
                                    <Button
                                        onClick={handleBack}
                                        disabled={index === 0}
                                    >
                                        Back
                                    </Button>
                                </Box>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
                {activeStep === steps.length && (
                    <Paper square elevation={0} sx={{ p: 3 }}>
                        <Typography>
                            All steps completed - you&apos;re finished
                        </Typography>
                        <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                            Reset
                        </Button>
                    </Paper>
                )}
                {/* <div
                    className="px-4 block-content bg-light"
                    style={{
                        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                        borderRadius: "20px",
                        minWidth: "800px",
                        maxWidth: "1000px",
                        marginBottom: "5%",
                    }}
                >

                    <Box
                        component="form"
                        sx={{ mx: 6, mt: 3, mb: 6 }}
                        onSubmit={checkInput}
                        noValidate
                        autoComplete="off"
                        encType="multipart/form-data"
                    >
                        <Typography
                            variant="h4"
                            sx={{ mt: 3, mb: 6, fontWeight: "bold" }}
                        >
                            {" "}
                            Create Client{" "}
                        </Typography>
                        <Typography sx={{ mt: 3, ml: 1 }}>
                            {" "}
                            Client Information{" "}
                        </Typography>
                        <FormGroup
                            row={true}
                            className="d-flex justify-content-between"
                            sx={{
                                "& label.Mui-focused": { color: "#97a5ba" },
                                "& .MuiOutlinedInput-root": {
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#97a5ba",
                                    },
                                },
                            }}
                        >
                            <FormControl
                                sx={{
                                    marginBottom: 3,
                                    width: "66%",
                                    "& label.Mui-focused": { color: "#97a5ba" },
                                    "& .MuiOutlinedInput-root": {
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#97a5ba",
                                        },
                                    },
                                }}
                            >
                                <TextField
                                    required
                                    id="clientName"
                                    label="Client Name"
                                    variant="outlined"
                                    value={clientName}
                                    error={clientNameError}
                                    onChange={(e) =>
                                        setClientName(e.target.value)
                                    }
                                />
                            </FormControl>

                            <FormControl
                                sx={{
                                    marginBottom: 3,
                                    width: "32%",
                                    "& label.Mui-focused": { color: "#97a5ba" },
                                    "& .MuiOutlinedInput-root": {
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#97a5ba",
                                        },
                                    },
                                }}
                            >
                                <TextField
                                    select
                                    required
                                    id="package"
                                    label="Package"
                                    value={selectedPackage}
                                    error={selectedPackageError}
                                    onChange={(event) =>
                                        setSelectedPackage(event.target.value)
                                    }
                                >
                                    <MenuItem key="Basic" value="Basic">
                                        {" "}
                                        Basic{" "}
                                    </MenuItem>
                                    <MenuItem key="Standard" value="Standard">
                                        {" "}
                                        Standard{" "}
                                    </MenuItem>
                                    <MenuItem
                                        key="Professional"
                                        value="Professional"
                                    >
                                        {" "}
                                        Professional{" "}
                                    </MenuItem>
                                    <MenuItem
                                        key="Enterprise"
                                        value="Enterprise"
                                    >
                                        {" "}
                                        Enterprise{" "}
                                    </MenuItem>
                                </TextField>
                            </FormControl>
                        </FormGroup>

                        <Typography sx={{ mt: 3, ml: 1 }}>
                            {" "}
                            Admin Account
                        </Typography>
                        <FormGroup
                            row={true}
                            className="d-flex justify-content-between"
                            sx={{
                                "& label.Mui-focused": { color: "#97a5ba" },
                                "& .MuiOutlinedInput-root": {
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#97a5ba",
                                    },
                                },
                            }}
                        >
                            <FormControl
                                sx={{
                                    marginBottom: 3,
                                    width: "28%",
                                    "& label.Mui-focused": { color: "#97a5ba" },
                                    "& .MuiOutlinedInput-root": {
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#97a5ba",
                                        },
                                    },
                                }}
                            >
                                <TextField
                                    required
                                    id="clientName"
                                    label="First Name"
                                    variant="outlined"
                                    value={firstName}
                                    error={firstNameError}
                                    onChange={(e) =>
                                        setFirstName(e.target.value)
                                    }
                                />
                            </FormControl>

                            <FormControl
                                sx={{
                                    marginBottom: 3,
                                    width: "28%",
                                    "& label.Mui-focused": { color: "#97a5ba" },
                                    "& .MuiOutlinedInput-root": {
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#97a5ba",
                                        },
                                    },
                                }}
                            >
                                <TextField
                                    id="clientName"
                                    label="Middle Name"
                                    variant="outlined"
                                    value={middleName}
                                    onChange={(e) =>
                                        setMiddleName(e.target.value)
                                    }
                                />
                            </FormControl>

                            <FormControl
                                sx={{
                                    marginBottom: 3,
                                    width: "28%",
                                    "& label.Mui-focused": { color: "#97a5ba" },
                                    "& .MuiOutlinedInput-root": {
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#97a5ba",
                                        },
                                    },
                                }}
                            >
                                <TextField
                                    id="clientName"
                                    label="Last Name"
                                    variant="outlined"
                                    value={lastName}
                                    error={lastNameError}
                                    onChange={(e) =>
                                        setLastName(e.target.value)
                                    }
                                />
                            </FormControl>

                            <FormControl
                                sx={{
                                    marginBottom: 3,
                                    width: "10%",
                                    "& label.Mui-focused": { color: "#97a5ba" },
                                    "& .MuiOutlinedInput-root": {
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#97a5ba",
                                        },
                                    },
                                }}
                            >
                                <TextField
                                    required
                                    id="clientName"
                                    label="Suffix"
                                    variant="outlined"
                                    value={suffix}
                                    onChange={(e) => setSuffix(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>
                        <FormGroup
                            row={true}
                            className="d-flex justify-content-between"
                            sx={{
                                "& label.Mui-focused": { color: "#97a5ba" },
                                "& .MuiOutlinedInput-root": {
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#97a5ba",
                                    },
                                },
                            }}
                        >
                            <FormControl
                                sx={{
                                    marginBottom: 3,
                                    width: "32%",
                                    "& label.Mui-focused": { color: "#97a5ba" },
                                    "& .MuiOutlinedInput-root": {
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#97a5ba",
                                        },
                                    },
                                }}
                            >
                                <TextField
                                    required
                                    id="userName"
                                    label="User Name"
                                    variant="outlined"
                                    value={userName}
                                    error={userNameError}
                                    onChange={(e) =>
                                        setUserName(e.target.value)
                                    }
                                />
                            </FormControl>

                            <FormControl
                                sx={{
                                    marginBottom: 3,
                                    width: "32%",
                                    "& label.Mui-focused": { color: "#97a5ba" },
                                    "& .MuiOutlinedInput-root": {
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#97a5ba",
                                        },
                                    },
                                }}
                            >
                                <TextField
                                    required
                                    id="emailAddress"
                                    label="Email Address"
                                    variant="outlined"
                                    value={emailAddress}
                                    error={emailAddressError}
                                    onChange={(e) =>
                                        setEmailAddress(e.target.value)
                                    }
                                />
                            </FormControl>

                            <FormControl
                                sx={{
                                    marginBottom: 3,
                                    width: "32%",
                                    "& label.Mui-focused": { color: "#97a5ba" },
                                    "& .MuiOutlinedInput-root": {
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#97a5ba",
                                        },
                                    },
                                }}
                            >
                                <TextField
                                    id="phoneNumber"
                                    label="Phone Number"
                                    variant="outlined"
                                    value={phoneNumber}
                                    onChange={(e) =>
                                        setPhoneNumber(e.target.value)
                                    }
                                />
                            </FormControl>
                        </FormGroup>
                        <FormGroup
                            row={true}
                            className="d-flex justify-content-between"
                            sx={{
                                "& label.Mui-focused": { color: "#97a5ba" },
                                "& .MuiOutlinedInput-root": {
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#97a5ba",
                                    },
                                },
                            }}
                        >
                            <FormControl
                                sx={{
                                    marginBottom: 3,
                                    width: "100%",
                                    "& label.Mui-focused": { color: "#97a5ba" },
                                    "& .MuiOutlinedInput-root": {
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#97a5ba",
                                        },
                                    },
                                }}
                            >
                                <TextField
                                    id="address"
                                    label="Address"
                                    variant="outlined"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>
                        <FormGroup
                            row={true}
                            className="d-flex justify-content-between"
                            sx={{
                                "& label.Mui-focused": { color: "#97a5ba" },
                                "& .MuiOutlinedInput-root": {
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#97a5ba",
                                    },
                                },
                            }}
                        >
                            <FormControl
                                sx={{
                                    marginBottom: 3,
                                    width: "49%",
                                    "& label.Mui-focused": { color: "#97a5ba" },
                                    "& .MuiOutlinedInput-root": {
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#97a5ba",
                                        },
                                    },
                                }}
                            >
                                <TextField
                                    required
                                    id="Password"
                                    label="Password"
                                    variant="outlined"
                                    type="password"
                                    value={password}
                                    error={passwordError}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                            </FormControl>

                            <FormControl
                                sx={{
                                    marginBottom: 3,
                                    width: "49%",
                                    "& label.Mui-focused": { color: "#97a5ba" },
                                    "& .MuiOutlinedInput-root": {
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#97a5ba",
                                        },
                                    },
                                }}
                            >
                                <TextField
                                    required
                                    id="confirmPassword"
                                    label="Confirm Password"
                                    variant="outlined"
                                    type="password"
                                    value={confirm}
                                    error={confirmError}
                                    onChange={(e) => setConfirm(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <Box
                            display="flex"
                            justifyContent="center"
                            sx={{ marginTop: "20px" }}
                        >
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{
                                    backgroundColor: "#177604",
                                    color: "white",
                                }}
                                className="m-1"
                            >
                                <p className="m-0">
                                    <i className="fa fa-floppy-o mr-2 mt-1"></i>{" "}
                                    Save Client{" "}
                                </p>
                            </Button>
                        </Box>
                    </Box>
                </div> */}
            </Box>
        </Layout>
    );
};

export default ClientsAdd;
