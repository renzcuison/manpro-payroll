import { PictureAsPdf } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { File, ImageIcon, Table } from "lucide-react";
import React from "react";

const renderIcon = (mimeType) => {
    switch (mimeType) {
        case "image/jpeg":
            return <ImageIcon />;
        case "image/png":
            return <ImageIcon />;
        case "application/pdf":
            return <PictureAsPdf />;
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return <Table />;
        case "application/vnd.ms-excel":
            return <Table />;
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return <File />;
        case "application/msword":
            return <File />;
        default:
            return <Table />;
    }
};

function DocumentCard({ document }) {
    const mimetype = document.media?.[0]?.mime_type;
    console.log(mimetype);
    return (
        <Box
            sx={{
                margin: "1rem 0",
                padding: "1rem",
                border: "1px solid #ccc",
                borderRadius: "1rem",
                borderColor: "rgba(255,255,255,0.5)",
                backgroundColor: "rgba(255,255,255,0.9)",
                cursor: "pointer",
                "&:hover": {
                    borderColor: "#ccc",
                    backgroundColor: "rgba(255,255,255,0.95)",
                },
            }}
        >
            {renderIcon(mimetype)}
            <Typography variant="h6">{document.title}</Typography>
            <Typography variant="body1">{document.description}</Typography>
        </Box>
    );
}

export default DocumentCard;
