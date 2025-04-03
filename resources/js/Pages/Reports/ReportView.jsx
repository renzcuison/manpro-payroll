import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    FormGroup,
    InputLabel,
    Select,
    MenuItem,
    FormControl,
    OutlinedInput,
    Chip,
    CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Layout from "../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../utils/axiosConfig";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../hooks/useUser";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const ReportView = () => {
    const { id } = useParams();
    const { user } = useUser();
    const theme = useTheme();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [loading, setLoading] = useState(true);

    const [report, setReport] = useState([]);
    const [reportType, setReportType] = useState([]);
    const [reportCreator, setReportCreator] = useState("");

    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [type, setType] = useState("");
    const [periodFrom, setPeriodFrom] = useState("");
    const [periodTo, setPeriodTo] = useState("");
    const [description, setDescription] = useState("");
    const [attachment, setAttachment] = useState("");

    const [employees, setEmployees] = useState([]);
    const [viewers, setViewers] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);

    const [attachmentFile, setAttachmentFile] = useState("");

    useEffect(() => {
        if (id) {
            const formData = new FormData();
            formData.append("reportID", id);

            axiosInstance
                .post("/saveReportViewer", formData, { headers })
                .then((response) => {
                    console.log(response.data);
                })
                .catch((error) => {
                    console.error("Error:", error);
                });

            const data = { reportID: id };

            axiosInstance
                .get(`/getReport`, { params: data, headers })
                .then((response) => {
                    setReport(response.data.report);
                    setReportType(response.data.reportType);
                    setReportCreator(response.data.report.created_by);

                    setTitle(response.data.report.title);
                    setDate(response.data.report.date);
                    setType(response.data.reportType.type_name);
                    setPeriodFrom(response.data.report.period_from);
                    setPeriodTo(response.data.report.period_to);
                    setDescription(response.data.report.description);
                    setAttachment(response.data.report.attachment);

                    setViewers(response.data.viewers);
                    setEmployees(response.data.reportEmployees);
                    setSelectedEmployees(response.data.reportEmployees);

                    setAttachmentFile(
                        response.data.report.attachment.replace("reports/", "")
                    );

                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching evaluation:", error);
                });
        }
    }, []);

    const openAttachment = () => {
        window.open(`${window.location.origin}/${attachment}`, "_blank");
    };

    return (
        <Layout title={"ReportCreateForm"}>
            <Box sx={{ mx: 12, pt: 12 }}>
                <div
                    className="px-4 block-content bg-light"
                    style={{
                        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                        borderRadius: "20px",
                        minWidth: "800px",
                        maxWidth: "1000px",
                        marginBottom: "5%",
                    }}
                >
                    {loading ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                minHeight: "200px",
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Box
                                component="form"
                                sx={{ mx: 6, mt: 3, mb: 6 }}
                                noValidate
                                autoComplete="off"
                                encType="multipart/form-data"
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        mt: 3,
                                        mb: 6,
                                    }}
                                >
                                    <Typography
                                        variant="h4"
                                        sx={{ fontWeight: "bold" }}
                                    >
                                        View Document
                                    </Typography>

                                    {user.user_id === reportCreator && (
                                        <Button
                                            type="button"
                                            variant="contained"
                                            sx={{
                                                backgroundColor: "#177604",
                                                color: "white",
                                            }}
                                            className="m-1"
                                            onClick={() =>
                                                navigate(`/report-edit/${id}`)
                                            }
                                        >
                                            <p className="m-0">
                                                <i className="fa fa-floppy-o mr-2 mt-1"></i>{" "}
                                                Edit{" "}
                                            </p>
                                        </Button>
                                    )}
                                </Box>

                                <FormGroup
                                    row={true}
                                    className="d-flex justify-content-between"
                                    sx={{
                                        "& label.Mui-focused": {
                                            color: "#97a5ba",
                                        },
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
                                            width: "75%",
                                            "& label.Mui-focused": {
                                                color: "#97a5ba",
                                            },
                                            "& .MuiOutlinedInput-root": {
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#97a5ba",
                                                },
                                            },
                                        }}
                                    >
                                        <TextField
                                            id="title"
                                            label="Title"
                                            variant="outlined"
                                            value={title}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </FormControl>

                                    <FormControl
                                        sx={{
                                            marginBottom: 3,
                                            width: "22%",
                                            "& label.Mui-focused": {
                                                color: "#97a5ba",
                                            },
                                            "& .MuiOutlinedInput-root": {
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#97a5ba",
                                                },
                                            },
                                        }}
                                    >
                                        <TextField
                                            id="date"
                                            label="Date"
                                            variant="outlined"
                                            value={date}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </FormControl>
                                </FormGroup>

                                <FormGroup
                                    row={true}
                                    className="d-flex justify-content-between"
                                    sx={{
                                        "& label.Mui-focused": {
                                            color: "#97a5ba",
                                        },
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
                                            width: "50%",
                                            "& label.Mui-focused": {
                                                color: "#97a5ba",
                                            },
                                            "& .MuiOutlinedInput-root": {
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#97a5ba",
                                                },
                                            },
                                        }}
                                    >
                                        <TextField
                                            required
                                            id="reportType"
                                            label="Type"
                                            value={type}
                                            InputProps={{ readOnly: true }}
                                        ></TextField>
                                    </FormControl>

                                    <FormControl
                                        sx={{
                                            marginBottom: 3,
                                            width: "22%",
                                            "& label.Mui-focused": {
                                                color: "#97a5ba",
                                            },
                                            "& .MuiOutlinedInput-root": {
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#97a5ba",
                                                },
                                            },
                                        }}
                                    >
                                        <TextField
                                            id="date"
                                            label="Period From"
                                            variant="outlined"
                                            value={periodFrom}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </FormControl>

                                    <FormControl
                                        sx={{
                                            marginBottom: 3,
                                            width: "22%",
                                            "& label.Mui-focused": {
                                                color: "#97a5ba",
                                            },
                                            "& .MuiOutlinedInput-root": {
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#97a5ba",
                                                },
                                            },
                                        }}
                                    >
                                        <TextField
                                            id="date"
                                            label="Period To"
                                            variant="outlined"
                                            value={periodTo}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </FormControl>
                                </FormGroup>

                                <FormGroup
                                    row={true}
                                    className="d-flex justify-content-between"
                                    sx={{
                                        "& label.Mui-focused": {
                                            color: "#97a5ba",
                                        },
                                        "& .MuiOutlinedInput-root": {
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#97a5ba",
                                            },
                                        },
                                    }}
                                >
                                    <FormControl
                                        sx={{ marginBottom: 3, width: "100%" }}
                                    >
                                        <div
                                            id="description"
                                            style={{
                                                border: "1px solid #97a5ba",
                                                padding: "8px",
                                                borderRadius: "4px",
                                                minHeight: "100px",
                                                overflowY: "auto",
                                            }}
                                            dangerouslySetInnerHTML={{
                                                __html: description,
                                            }} // Render HTML directly
                                        />
                                    </FormControl>
                                </FormGroup>

                                <FormGroup
                                    row={true}
                                    className="d-flex justify-content-between"
                                    sx={{
                                        "& label.Mui-focused": {
                                            color: "#97a5ba",
                                        },
                                        "& .MuiOutlinedInput-root": {
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#97a5ba",
                                            },
                                        },
                                    }}
                                >
                                    <FormControl
                                        sx={{ marginBottom: 3, width: "100%" }}
                                    >
                                        <TextField
                                            variant="outlined"
                                            id="attachment"
                                            label="Attachment"
                                            value={attachmentFile}
                                            InputProps={{ readOnly: true }}
                                            sx={{ marginBottom: 0 }}
                                            onClick={() => openAttachment()}
                                        />
                                    </FormControl>
                                </FormGroup>

                                <FormGroup
                                    row={true}
                                    className="d-flex justify-content-between"
                                    sx={{
                                        "& label.Mui-focused": {
                                            color: "#97a5ba",
                                        },
                                        "& .MuiOutlinedInput-root": {
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#97a5ba",
                                            },
                                        },
                                    }}
                                >
                                    <FormControl
                                        required
                                        sx={{
                                            marginBottom: 3,
                                            width: "100%",
                                            "& label.Mui-focused": {
                                                color: "#97a5ba",
                                            },
                                            "& .MuiOutlinedInput-root": {
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#97a5ba",
                                                },
                                            },
                                        }}
                                    >
                                        <InputLabel id="selectedEmployeeLabel">
                                            Assigned Employee
                                        </InputLabel>
                                        <Select
                                            labelId="selectedEmployeeLabel"
                                            id="selectedEmployee"
                                            value={selectedEmployees}
                                            input={
                                                <OutlinedInput
                                                    id="select-multiple-chip"
                                                    label="Assigned Employee"
                                                />
                                            }
                                            readOnly
                                            renderValue={(employees) => (
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        flexWrap: "wrap",
                                                        gap: 0.5,
                                                    }}
                                                >
                                                    {employees.map(
                                                        (employee) => (
                                                            <Chip
                                                                key={
                                                                    employee
                                                                        .user
                                                                        .user_id
                                                                }
                                                                label={`${employee.user.fname} ${employee.user.mname} ${employee.user.lname}`}
                                                            />
                                                        )
                                                    )}
                                                </Box>
                                            )}
                                            MenuProps={MenuProps}
                                        ></Select>
                                    </FormControl>
                                </FormGroup>

                                <Typography>
                                    Viewed By:{" "}
                                    {viewers
                                        .map(
                                            (viewer) =>
                                                `${viewer.fname} ${viewer.mname} ${viewer.lname}`
                                        )
                                        .join(", ")}
                                </Typography>
                            </Box>
                        </>
                    )}
                </div>
            </Box>
        </Layout>
    );
};

export default ReportView;
