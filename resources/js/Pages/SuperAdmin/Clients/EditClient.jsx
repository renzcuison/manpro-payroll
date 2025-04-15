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
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

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

const EditClient = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [clientData, setClientData] = useState(null);
    const [companyData, setCompanyData] = useState(null);
    const { state } = useLocation();

    useEffect(() => {
        if (state) {
            setClientData(state);
            setCompanyData(state?.company ?? null);
        }
    }, []);

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
                                {index === 0 && (
                                    <>
                                        <CreateUser
                                            clientData={clientData}
                                            setClientData={setClientData}
                                        />
                                        <Box sx={{ mb: 2 }}>
                                            <Button
                                                variant="contained"
                                                onClick={handleNext}
                                                sx={{ mt: 1, mr: 1 }}
                                                disabled={!clientData}
                                            >
                                                Continue
                                            </Button>
                                            <Button
                                                disabled={index === 0}
                                                onClick={handleBack}
                                                sx={{ mt: 1, mr: 1 }}
                                            >
                                                Back
                                            </Button>
                                        </Box>
                                    </>
                                )}
                                {index == 1 && (
                                    <>
                                        <CreateCompany
                                            clientData={clientData}
                                            setCompanyData={setCompanyData}
                                            companyData={companyData}
                                        />

                                        <Box sx={{ mb: 2 }}>
                                            <Button
                                                variant="contained"
                                                onClick={handleNext}
                                                sx={{ mt: 1, mr: 1 }}
                                                disabled={!clientData}
                                            >
                                                {index === steps.length - 1
                                                    ? "Finish"
                                                    : "Continue"}
                                            </Button>
                                            <Button
                                                disabled={index === 0}
                                                onClick={handleBack}
                                                sx={{ mt: 1, mr: 1 }}
                                            >
                                                Back
                                            </Button>
                                        </Box>
                                    </>
                                )}
                                {index == 2 && (
                                    <>
                                        <Box></Box>
                                        <Box sx={{ mb: 2 }}>
                                            <Button
                                                variant="contained"
                                                onClick={handleNext}
                                                sx={{ mt: 1, mr: 1 }}
                                                disabled={!clientData}
                                            >
                                                Finish
                                            </Button>
                                            <Button
                                                disabled={index === 0}
                                                onClick={handleBack}
                                                sx={{ mt: 1, mr: 1 }}
                                            >
                                                Back
                                            </Button>
                                        </Box>
                                    </>
                                )}
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
            </Box>
        </Layout>
    );
};

export default EditClient;
