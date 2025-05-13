import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Typography,
  Box,
  IconButton,
  Avatar,
  CircularProgress,
} from "@mui/material";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import dayjs from "dayjs";
import PropTypes from "prop-types";

const AnnouncementViewer = ({ open, close, announcement }) => {
  const storedUser = localStorage.getItem("nasya_user");
  const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : {};

  const [views, setViews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("AnnouncementViewer props:", { open, close, announcement });
    if (open && announcement?.unique_code) {
      setIsLoading(true);
      getViews();
    }
  }, [open, announcement]);

  const getViews = () => {
    axiosInstance
      .get(`/announcements/getViews/${announcement.unique_code}`, { headers })
      .then((response) => {
        setViews(response.data.views || []);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching views:", error.response?.data || error.message);
        setIsLoading(false);
      });
  };

  return (
    <Dialog open={open} fullWidth maxWidth="md">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Typography variant="h5" sx={{ flexGrow: 1, textAlign: "center", fontWeight: "bold" }}>
          {announcement?.title || "Announcement Viewers"}
        </Typography>
        <IconButton onClick={() => close(false)} aria-label="close">
          <i className="si si-close"></i>
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 3 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : views.length === 0 ? (
          <Typography sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
            No users have viewed this announcement.
          </Typography>
        ) : (
          <TableContainer
            style={{ overflowX: "auto", overflowY: "auto", maxHeight: "400px" }}
            sx={{ minHeight: 400 }}
          >
            <Table aria-label="announcement viewers table">
              <TableHead sx={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "#fff" }}>
                <TableRow>
                  <TableCell align="left" sx={{ borderBottom: "1px solid #e0e0e0", py: 1.5, width: "30%" }}>
                    Name
                  </TableCell>
                  <TableCell align="center" sx={{ borderBottom: "1px solid #e0e0e0", py: 1.5, width: "20%" }}>
                    Department
                  </TableCell>
                  <TableCell align="center" sx={{ borderBottom: "1px solid #e0e0e0", py: 1.5, width: "20%" }}>
                    Branch
                  </TableCell>
                  <TableCell align="center" sx={{ borderBottom: "1px solid #e0e0e0", py: 1.5, width: "30%" }}>
                    Viewed
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {views.map((view, index) => (
                  <TableRow
                    key={view.user_id}
                    sx={{
                      p: 1,
                      backgroundColor: index % 2 === 0 ? "#f8f8f8" : "#ffffff",
                      "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)", cursor: "pointer" },
                    }}
                  >
                    <TableCell align="left" sx={{ borderBottom: "1px solid #e0e0e0", py: 1.5 }}>
                      <Box display="flex" sx={{ alignItems: "center" }}>
                        <Avatar
                          src={view.profile_pic || undefined}
                          alt={`${view.first_name} ${view.last_name}`}
                          sx={{ mr: 1, width: 48, height: 48 }}
                        >
                          {view.first_name?.[0]?.toUpperCase() || "?"}
                        </Avatar>
                        {`${view.first_name} ${view.last_name}`}
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ borderBottom: "1px solid #e0e0e0", py: 1.5 }}>
                      {view.department_name || "N/A"}
                    </TableCell>
                    <TableCell align="center" sx={{ borderBottom: "1px solid #e0e0e0", py: 1.5 }}>
                      {view.branch_name || "N/A"}
                    </TableCell>
                    <TableCell align="center" sx={{ borderBottom: "1px solid #e0e0e0", py: 1.5 }}>
                      {dayjs(view.viewed_at).format("MMM D, YYYY h:mm A")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementViewer;