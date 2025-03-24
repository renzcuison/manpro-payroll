import {
    Box,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    TextField,
    Typography,
    InputAdornment,
    CircularProgress,
    FormGroup,
    FormControl,
    InputLabel,
    FormControlLabel,
    FormHelperText,
    Switch,
    Select,
    MenuItem,
    Stack,
    Radio,
    CardMedia,
    Divider,
    Menu
} from "@mui/material";
import { Cancel, MoreVert } from "@mui/icons-material";
import React, { useState, useEffect, useRef } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { Form, useLocation, useNavigate } from "react-router-dom";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Swal from "sweetalert2";
import moment from "moment";

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

const DocumentView = ({ open, close, content, onFinished }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(true);
    const [file, setFile] = useState(null);

    // File Decoder
    useEffect(() => {
        if (!content.file || !content.file_mime) {
            setIsLoading(false);
            return;
        }

        const byteCharacters = atob(content.file);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: content.file_mime });

        const localUrl = URL.createObjectURL(blob);
        setFile(localUrl);
        setIsLoading(false);
    }, []);

    // File Cleanup
    useEffect(() => {
        return () => {
            if (file && file.startsWith('blob:')) {
                URL.revokeObjectURL(file);
            }
        };
    }, [file]);

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: { xs: "100%", sm: "700px" }, maxWidth: '1100px', marginBottom: '5%' } }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }} >
                        <Typography variant="h4" sx={{ ml: 1, mt: 2, fontWeight: "bold" }}> Document View </Typography>
                        <IconButton onClick={() => close()}> <i className="si si-close"></i> </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, mb: 3, maxHeight: "580px" }}>
                    {isLoading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }} >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box>
                            {/* Only works for PDF files */}
                            <iframe
                                src={file}
                                style={{ width: "100%", height: "500px", border: "none" }}
                                title="Document Viewer"
                            />
                        </Box>
                    )}

                </DialogContent>
            </Dialog>
        </>
    );
};

export default DocumentView;
