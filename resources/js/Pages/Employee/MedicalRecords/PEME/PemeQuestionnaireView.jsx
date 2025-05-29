import Layout from "../../../../components/Layout/Layout";
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

const PassOrFail = () => {
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
    return (
        <Layout>
            <Box
                sx={{
                    backgroundColor: "white",
                    padding: 4,
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
                        backgroundColor: "#f5f5f5",
                        paddingX: 8,
                        paddingY: 6,
                        borderRadius: 1,
                        boxShadow: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                        Drug Test
                    </Typography>
                    <UploadForm></UploadForm>
                    <PassOrFail></PassOrFail>
                    <Remarks></Remarks>
                    <TextBox></TextBox>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        marginTop: 6,
                        marginBottom: 24,
                    }}
                >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker label="Expiration Date" />
                    </LocalizationProvider>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker label="Next Schedule" />
                    </LocalizationProvider>
                    <Select sx={{ width: 200 }}>
                        <MenuItem sx={{ padding: 2 }}>Pending</MenuItem>
                        <MenuItem sx={{ padding: 2 }}>Clear</MenuItem>
                        <MenuItem sx={{ padding: 2 }}>Rejected</MenuItem>
                    </Select>
                </Box>
            </Box>
        </Layout>
    );
};

export default PemeQuestionnaireView;
