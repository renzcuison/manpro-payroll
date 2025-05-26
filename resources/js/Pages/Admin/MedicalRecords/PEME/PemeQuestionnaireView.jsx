import Layout from "../../../../components/Layout/Layout";
import React, { useState } from "react";
import {
    Box,
    Button,
    Typography,
    FormControl,
    FormControlLabel,
    RadioGroup,
    Radio,
    TextField,
    Select,
    MenuItem,
} from "@mui/material";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useNavigate } from "react-router-dom";

const UploadForm = () => {
    return (
        <>
            <input
                accept="pdf/*"
                style={{ display: "none" }}
                id="contained-button-file"
                type="file"
            />
            <label htmlFor="contained-button-file">
                <Box
                    sx={{
                        cursor: "pointer",
                        padding: 6,
                        borderRadius: 1,
                        backgroundColor: "#ccc",
                        boxShadow: 1,
                        "&:hover": {
                            backgroundColor: "#a3a3a3",
                        },
                        transition: ".2s",
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            textAlign: "center",
                            color: "#525252",
                        }}
                    >
                        Upload File
                    </Typography>
                </Box>
            </label>
        </>
    );
};

const PassOrFail = ({ setPassOrFail }) => {
    return (
        <>
            <Box
                sx={{
                    borderBottom: "solid",
                    borderWidth: 1,
                    borderColor: "#ccc",
                }}
            >
                <FormControl>
                    <RadioGroup onChange={(e) => setPassOrFail(e.target.value)}>
                        <FormControlLabel
                            value="Pass"
                            control={<Radio />}
                            label="Pass"
                        />
                        <FormControlLabel
                            value="Fail"
                            control={<Radio />}
                            label="Fail"
                        />
                    </RadioGroup>
                </FormControl>
            </Box>
        </>
    );
};

const Remarks = () => {
    return (
        <>
            <TextField label="Remarks" multiline rows={4}></TextField>
        </>
    );
};

const TextBox = () => {
    return (
        <>
            <TextField label="Description"></TextField>
        </>
    );
};

const PostiveOrNegative = () => {
    return (
        <>
            <Box
                sx={{
                    borderBottom: "solid",
                    borderWidth: 1,
                    borderColor: "#ccc",
                }}
            >
                <FormControl>
                    <RadioGroup>
                        <FormControlLabel
                            value="Positive"
                            control={<Radio />}
                            label="Positive"
                        />
                        <FormControlLabel
                            value="Negative"
                            control={<Radio />}
                            label="Negative"
                        />
                    </RadioGroup>
                </FormControl>
            </Box>
        </>
    );
};

const PemeQuestionnaireView = () => {
    const [status, setStatus] = useState();
    const [expirationDate, setExpirationDate] = useState();
    const [nextScheduleDate, setNextScheduleDate] = useState();
    const [passOrFail, setPassOrFail] = useState();
    const navigator = useNavigate();

    const handleConfirmClick = () => {
        console.log(passOrFail);
    };
    const handleCancelClick = () => {
        navigator("/admin/medical-records/peme-records/peme-responses");
    };
    return (
        <Layout>
            <Box
                sx={{
                    backgroundColor: "white",
                    paddingY: 6,
                    paddingX: 12,
                    borderRadius: 1,
                    boxShadow: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: 2,
                        borderBottom: "1px solid #ccc",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Questionnaire Name
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            Employee Name
                        </Typography>
                    </Box>

                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                        }}
                    ></div>
                </Box>
                <Box
                    sx={{
                        backgroundColor: "#fafafa",
                        paddingX: 8,
                        paddingY: 6,
                        borderRadius: 1,
                        boxShadow: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        Drug Test
                    </Typography>
                    <UploadForm></UploadForm>
                    <PassOrFail setPassOrFail={setPassOrFail}></PassOrFail>
                    <Remarks></Remarks>
                    <TextBox></TextBox>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 6,
                        marginBottom: 24,
                    }}
                >
                    <Box>
                        <Button
                            variant="contained"
                            sx={{ backgroundColor: "#a3a3a3" }}
                            onClick={handleCancelClick}
                        >
                            Cancel
                        </Button>
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <LocalizationProvider
                            dateAdapter={AdapterDayjs}
                            onChange={(e) => setExpirationDate(e.target.value)}
                        >
                            <DatePicker label="Expiration Date" />
                        </LocalizationProvider>
                        <LocalizationProvider
                            dateAdapter={AdapterDayjs}
                            onChange={(e) =>
                                setNextScheduleDate(e.target.value)
                            }
                        >
                            <DatePicker label="Next Schedule" />
                        </LocalizationProvider>
                        <Select
                            sx={{ width: 200 }}
                            defaultValue="Pending"
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <MenuItem
                                sx={{
                                    padding: 2,
                                    "&:hover": {
                                        backgroundColor: "#E9AE20",
                                        transition: ".3s",
                                    },
                                    "&.Mui-selected": {
                                        backgroundColor: "#E9AE20",
                                    },
                                }}
                                value="Pending"
                            >
                                Pending
                            </MenuItem>
                            <MenuItem
                                sx={{
                                    padding: 2,
                                    "&:hover": {
                                        backgroundColor: "#E9AE20",
                                        transition: ".3s",
                                    },
                                    "&.Mui-selected": {
                                        backgroundColor: "#E9AE20",
                                    },
                                }}
                                value="Clear"
                            >
                                Clear
                            </MenuItem>
                            <MenuItem
                                sx={{
                                    padding: 2,
                                    "&:hover": {
                                        backgroundColor: "#E9AE20",
                                        transition: ".3s",
                                    },
                                    "&.Mui-selected": {
                                        backgroundColor: "#E9AE20",
                                    },
                                }}
                                value="Rejected"
                            >
                                Rejected
                            </MenuItem>
                        </Select>
                    </Box>

                    <Box>
                        <Button
                            variant="contained"
                            onClick={handleConfirmClick}
                        >
                            Confirm
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Layout>
    );
};

export default PemeQuestionnaireView;
