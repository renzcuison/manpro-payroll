import React from "react";
import { Dialog, DialogTitle, DialogContent, Typography, Box, IconButton, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";

const AnnouncementAttachments = ({
  open,
  onClose,
  onExited, 
  type,
  items,
  handleFileDownload, // from AnnouncementManage
  handlePreviewFile,  // from AnnouncementManage
  handlePreviewImage,
  renderImage,        // from AnnouncementManage (optional)
}) => (
  <Dialog open={open} onClose={onClose} onExited={onExited} maxWidth="md" fullWidth>
    <DialogTitle
      sx={{
        fontSize: { xs: "1.5rem", sm: "2rem" },
        fontWeight: "bold",
        pb: 2,
        pr: 5,
        color: "#222",
        letterSpacing: 1,
      }}
    >
      {type === "images" ? "Attached Images" : "Attached Documents"}
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{ position: 'absolute', right: 12, top: 12 }}
      >
        <CloseIcon fontSize="large" />
      </IconButton>
    </DialogTitle>
    <DialogContent sx={{ pt: 2, pb: 3 }}>
      <Box
        component="ol"
        sx={{
          pl: 0,
          mb: 0,
          listStyleType: "none",
          counterReset: "item",
          "& li": {
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 1,
            borderRadius: 2,
            transition: "background 0.2s",
            mb: 0,
            counterIncrement: "item",
            "&:hover": {
              background: "#f0f0f0",
            },
          },
        }}
      >
        {items.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ pl: 0 }}>
            No {type === "images" ? "images" : "documents"} attached.
          </Typography>
        ) : type === "images" ? (
          items.map((img, idx) => (
            <li key={img.id || idx}>
              <Box
                sx={{
                  minWidth: 32,
                  fontWeight: "bold",
                  color: "#010a12",
                  fontSize: "1.1rem",
                  mr: 2,
                  textAlign: "right",
                }}
              >
                {idx + 1}
              </Box>
              <Typography
                variant="body1"
                sx={{
                  color: "#444",
                  wordBreak: "break-all",
                  fontWeight: 500,
                  flex: 1,
                }}
              >
                {img.filename}
              </Typography>
              <Tooltip title="Preview">
                <IconButton
                  edge="end"
                  onClick={() =>
                    handlePreviewImage &&
                    handlePreviewImage(img)
                  }
                  sx={{ ml: 1 }}
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download">
                <IconButton
                  edge="end"
                  onClick={() => handleFileDownload && handleFileDownload(img.filename, img.id)}
                  sx={{ ml: "auto", mr: 2 }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </li>
          ))
        ) : (
          items.map((doc, idx) => (
            <li key={doc.id || idx}>
              <Box
                sx={{
                  minWidth: 32,
                  fontWeight: "bold",
                  color: "#010a12",
                  fontSize: "1.1rem",
                  mr: 2,
                  textAlign: "right",
                }}
              >
                {idx + 1}
              </Box>
              <Typography
                variant="body1"
                sx={{
                  color: "#444",
                  wordBreak: "break-all",
                  fontWeight: 500,
                  ml: 1,
                  flex: 1,
                }}
              >
                {doc.filename || doc.name || `Document ${idx + 1}`}
              </Typography>
              <Tooltip title="Preview">
                <IconButton
                  edge="end"
                  onClick={() =>
                    handlePreviewFile &&
                    handlePreviewFile(
                      doc.filename,
                      doc.id,
                      doc.mime_type || doc.mimeType || ""
                    )
                  }
                  sx={{ ml: 1 }}
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download">
                <IconButton
                  edge="end"
                  onClick={() => handleFileDownload && handleFileDownload(doc.filename, doc.id)}
                  sx={{ mr: 2 }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </li>
          ))
        )}
      </Box>
    </DialogContent>
  </Dialog>
);

export default AnnouncementAttachments;     