import { PictureAsPdf } from "@mui/icons-material";
import {
    Box,
    Divider,
    Stack,
    styled,
    Typography,
    useTheme,
} from "@mui/material";
import React from "react";
import { renderIcon } from "../../../utils/constants";

const GradientStack = styled(Stack)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    padding: "1rem",
    borderRadius: "1rem",
    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 50%,  ${theme.palette.secondary.light} 100%)`,
    color: "#fff",
    cursor: "pointer",
    "&:hover": {
        backgroundColor: theme.palette.secondary.light,
        transition:
            "background-color 0.3s ease-in-out, border-color 0.3s ease-in-out",
        boxShadow: theme.shadows[6],
    },
}));

function DocumentCard({ document, handleClick }) {
    const mimetype = document.media?.[0]?.mime_type;
    return (
        <GradientStack spacing={1} onClick={handleClick}>
            {renderIcon(mimetype, 64)}
            <Divider sx={{ borderStyle: "dashed", color: "#fff" }} />
            <Typography variant="h4" sx={{ color: "#fff", fontWeight: 600 }}>
                {document.title}
            </Typography>
            <Typography variant="body1">{document.description}</Typography>
        </GradientStack>
    );
}

export default DocumentCard;
