import {
    Box,
    Button,
    Typography,
    Paper,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Stack,
    Divider,
} from "@mui/material";

import Layout from "../../../components/Layout/Layout";
import CreateCompany from "./CreateCompany";
import CreateUser from "./CreateUser";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useClient } from "../hooks/useClients";
import EditClient from "./EditClient";
import AssignPackage from "./AssignPackage";
import { usePackages } from "../hooks/usePackages";
import { ArrowLeft } from "lucide-react";

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
    const navigate = useNavigate();
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
                    <AssignPackage
                        company={companyData}
                        packages={packages}
                        setCompanyData={setCompanyData}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Layout title={"EvaluateCreateForm"}>
            <Stack sx={{}}>
                <Box>
                    <Button
                        onClick={() => navigate(-1)}
                        sx={{ mt: 1, mr: 1 }}
                        variant="outlined"
                        startIcon={<ArrowLeft />}
                    >
                        Back to client lists
                    </Button>
                </Box>
                <Divider sx={{ py: 2 }} />
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
                        <Button
                            onClick={() => navigate(-1)}
                            sx={{ mt: 1, mr: 1 }}
                        >
                            Back to client lists
                        </Button>
                    </Paper>
                )}
            </Stack>
        </Layout>
    );
};

export default ClientsAdd;
