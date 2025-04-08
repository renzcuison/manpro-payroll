import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    Stack,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    TextField,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { usePackages } from "../../hooks/usePackages";
import { FormProvider, useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import SelectPackageFeatures from "../../../../sections/Packages/SelectPackageFeatures";

const steps = ["Package Details", "Select features", "Create"];

function CreatePackageModal(props) {
    const { onClose, selectedPackage, open } = props;
    const [activeStep, setActiveStep] = useState(0);
    const [skipped, setSkipped] = useState(new Set());
    const [packageData, setPackageData] = useState(null);

    const isStepOptional = (step) => {
        return step === 1;
    };

    const isStepSkipped = (step) => {
        return skipped.has(step);
    };

    const handleNext = () => {
        let newSkipped = skipped;
        if (isStepSkipped(activeStep)) {
            newSkipped = new Set(newSkipped.values());
            newSkipped.delete(activeStep);
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped(newSkipped);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };
    const handleSkip = () => {
        if (!isStepOptional(activeStep)) {
            // You probably want to guard against something like this,
            // it should never occur unless someone's actively trying to break something.
            throw new Error("You can't skip a step that isn't optional.");
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped((prevSkipped) => {
            const newSkipped = new Set(prevSkipped.values());
            newSkipped.add(activeStep);
            return newSkipped;
        });
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    const { store, update } = usePackages();
    const methods = useForm({
        defaultValues: {
            id: null,
            name: selectedPackage ? selectedPackage.name : "",
            description: selectedPackage ? selectedPackage.description : "",
            price: selectedPackage ? selectedPackage.price : null,
        },
    });
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isLoading, isDirty },
        reset,
    } = methods;
    const values = watch();

    useEffect(() => {
        if (selectedPackage) {
            setValue("id", selectedPackage.id);
            setValue("name", selectedPackage.name);
            setValue("description", selectedPackage.description);
            setValue("price", selectedPackage.price);
            setPackageData(selectedPackage);
        }
    }, [selectedPackage]);

    const onSubmit = async (data) => {
        const formData = new FormData();
        if (selectedPackage) {
            formData.append("_method", "PUT");
            formData.append("id", data.id);
        }
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price", data.price);

        try {
            const action = selectedPackage ? update : store;
            const res = await action(formData, data.id);
            if (res.id) {
                console.log(res);

                setPackageData(res);
            } else {
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: "Error",
                text: "Failed to create document. Please try again.",
                icon: "error",
            });
        }
    };

    const handleListItemClick = (value) => {
        onClose(value);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog onClose={handleClose} open={open} fullWidth maxWidth="sm">
            <DialogTitle>Create Package</DialogTitle>
            <DialogContent>
                <Box sx={{ width: "100%" }}>
                    <Stepper activeStep={activeStep}>
                        {steps.map((label, index) => {
                            const stepProps = {};
                            const labelProps = {};
                            // if (isStepOptional(index)) {
                            //     labelProps.optional = (
                            //         <Typography variant="caption">
                            //             Optional
                            //         </Typography>
                            //     );
                            // }
                            if (isStepSkipped(index)) {
                                stepProps.completed = false;
                            }
                            return (
                                <Step key={label} {...stepProps}>
                                    <StepLabel {...labelProps}>
                                        {label}
                                    </StepLabel>
                                </Step>
                            );
                        })}
                    </Stepper>
                    {activeStep === 0 && (
                        <Box
                            sx={{
                                mt: 3,
                                border: "1px solid #ccc",
                                p: 2,
                                borderRadius: 2,
                            }}
                        >
                            <FormProvider {...methods}>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Typography
                                            variant="h5"
                                            sx={{ fontWeight: "bold" }}
                                        >
                                            {" "}
                                            Package Details{" "}
                                        </Typography>
                                    </Box>
                                    <Stack spacing={2} mt={2}>
                                        <TextField
                                            fullWidth
                                            label="Name"
                                            {...register("name", {
                                                required: true,
                                            })}
                                            error={!!errors.name}
                                            helperText={errors.name?.message}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Description"
                                            {...register("description", {
                                                required: true,
                                            })}
                                            error={!!errors.description}
                                            helperText={
                                                errors.description?.message
                                            }
                                            multiline
                                            rows={4}
                                            variant="outlined"
                                        />

                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Price"
                                            {...register("price", {
                                                required: true,
                                                pattern: /^\d+(\.\d{1,2})?$/,
                                            })}
                                            error={!!errors.price}
                                            helperText={errors.price?.message}
                                        />

                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "flex-start",
                                            }}
                                        >
                                            <Button
                                                variant="contained"
                                                type="submit"
                                                color="success"
                                                disabled={
                                                    !!errors.title ||
                                                    !!errors.description ||
                                                    !!errors.price ||
                                                    isLoading
                                                }
                                                startIcon={
                                                    isLoading ? (
                                                        <CircularProgress
                                                            color="inherit"
                                                            size={20}
                                                        />
                                                    ) : (
                                                        <InsertDriveFileIcon />
                                                    )
                                                }
                                            >
                                                {selectedPackage
                                                    ? "Update"
                                                    : "Save"}
                                            </Button>
                                            {errors && (
                                                <Box>
                                                    <Typography
                                                        variant="body2"
                                                        color="error"
                                                    >
                                                        {errors.message}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Stack>
                                </form>
                            </FormProvider>
                        </Box>
                    )}
                    {activeStep === 1 && (
                        <SelectPackageFeatures packageData={packageData} />
                    )}
                    {activeStep === steps.length ? (
                        <React.Fragment>
                            <Typography sx={{ mt: 2, mb: 1 }}>
                                All steps completed - you&apos;re finished
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    pt: 2,
                                }}
                            >
                                <Box sx={{ flex: "1 1 auto" }} />
                                <Button onClick={handleReset}>Reset</Button>
                            </Box>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    pt: 2,
                                }}
                            >
                                <Button
                                    color="inherit"
                                    disabled={activeStep === 0}
                                    onClick={handleBack}
                                    sx={{ mr: 1 }}
                                >
                                    Back
                                </Button>
                                <Box sx={{ flex: "1 1 auto" }} />
                                {isStepOptional(activeStep) && (
                                    <Button
                                        color="inherit"
                                        onClick={handleSkip}
                                        sx={{ mr: 1 }}
                                    >
                                        Skip
                                    </Button>
                                )}
                                <Button
                                    onClick={handleNext}
                                    disabled={!packageData?.id}
                                >
                                    {activeStep === steps.length - 1
                                        ? "Finish"
                                        : "Next"}
                                </Button>
                            </Box>
                        </React.Fragment>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
}

export default CreatePackageModal;
