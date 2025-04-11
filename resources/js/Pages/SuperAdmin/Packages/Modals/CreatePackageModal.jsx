import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    Icon,
    Stack,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { usePackages } from "../../hooks/usePackages";
import { FormProvider, useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import SelectPackageFeatures from "../../../../sections/Packages/SelectPackageFeatures";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const steps = ["Package Details", "Select features", "Create"];

function CreatePackageModal(props) {
    const {
        onClose,
        selectedPackage,
        open,
        setIsOpenSnackBar,
        setSnackBarMsg,
    } = props;
    const [activeStep, setActiveStep] = useState(0);
    const [skipped, setSkipped] = useState(new Set());
    const [packageData, setPackageData] = useState(null);
    const { store, update, assignFeature } = usePackages();
    const queryClient = useQueryClient();
    const [isSuccess, setIsSuccess] = useState(false);
    console.log(isSuccess);

    console.log(packageData);

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

    const methods = useForm({
        defaultValues: {
            id: null,
            name: selectedPackage ? selectedPackage.name : "",
            description: selectedPackage ? selectedPackage.description : "",
            price: selectedPackage ? selectedPackage.price : null,
        },
    });

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
                queryClient.invalidateQueries(["packages"]);
                setPackageData(res);
                setIsSuccess(true);
                setIsOpenSnackBar(true);
                setSnackBarMsg(
                    selectedPackage
                        ? "Successfully updated package details."
                        : "Successfully stored new package."
                );
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

    const renderFeatures = useMemo(
        () => (
            <SelectPackageFeatures
                pkg={packageData}
                assignFeature={assignFeature}
            />
        ),
        [packageData, selectedPackage]
    );

    const handleChange = async (id) => {
        const res = await assignFeature(packageData.id, id);
        if (res.success) {
            console.log(res);
            setPackageData(res.data);
        }
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
                                                justifyContent: "space-between",
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
                                            {isSuccess && (
                                                <Box
                                                    sx={{
                                                        p: 1,
                                                        color: "success",
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        color="success"
                                                    >
                                                        {selectedPackage
                                                            ? "Updated"
                                                            : "Saved"}{" "}
                                                        Successfully!
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Stack>
                                </form>
                            </FormProvider>
                        </Box>
                    )}
                    {activeStep === 1 && packageData?.id && (
                        <SelectPackageFeatures
                            pkg={packageData}
                            assignFeature={assignFeature}
                            handleChange={handleChange}
                        />
                    )}

                    {activeStep === steps.length - 1 && (
                        <Stack
                            sx={{
                                mt: 3,
                                border: "1px solid #ccc",
                                p: 2,
                                borderRadius: 2,
                            }}
                            spacing={2}
                        >
                            <Typography variant="h6" color="primary">
                                Package Details
                            </Typography>
                            <Table size="small">
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Name:</TableCell>
                                        <TableCell>
                                            {packageData?.name}
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell>Description:</TableCell>
                                        <TableCell>
                                            {packageData?.description}
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell>Price:</TableCell>
                                        <TableCell>
                                            {packageData?.price}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>

                            <Divider sx={{ borderStyle: "dashed" }} />
                            <Typography variant="h6" color="primary">
                                Features:
                            </Typography>
                            <Stack spacing={1}>
                                {packageData?.features?.map((f, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            p: 1,
                                            px: 2,
                                            border: "1px solid #ccc",
                                            borderRadius: 2,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {f.name}
                                        </Typography>
                                        <CheckCircleIcon
                                            sx={{
                                                color: "success.main",
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Stack>
                        </Stack>
                    )}
                    {activeStep === steps.length ? (
                        <Stack
                            sx={{
                                mt: 3,
                                border: "1px solid #ccc",
                                p: 2,
                                borderRadius: 2,
                            }}
                            spacing={2}
                        >
                            <Typography
                                sx={{ mt: 2, mb: 1, textAlign: "center" }}
                                variant="h6"
                            >
                                All steps completed - you&apos;re finished!
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    pt: 2,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                {/* <Button onClick={handleReset}>Reset</Button> */}
                                <Button
                                    variant="contained"
                                    onClick={() => handleClose()}
                                >
                                    Close
                                </Button>
                            </Box>
                        </Stack>
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
                                {/* {isStepOptional(activeStep) && (
                                    <Button
                                        color="inherit"
                                        onClick={handleSkip}
                                        sx={{ mr: 1 }}
                                    >
                                        Skip
                                    </Button>
                                )} */}
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
