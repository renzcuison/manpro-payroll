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
  Tooltip
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
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary" }}>
              Viewed By
            </Typography>
            <Box display="flex" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {views.map((view, index) => (
                <Tooltip
                  key={view.user_id || index}
                  title={
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} color="#fff">
                        {`${view.first_name} ${view.middle_name || ''} ${view.last_name} ${view.suffix || ''}`.replace(/\s+/g, ' ').trim()}
                      </Typography>
                      <Typography variant="body2">
                        Branch: {view.branch_name || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        Department: {view.department_name || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        Viewed At: {dayjs(view.viewed_at).format("MMM D, YYYY h:mm A")}
                      </Typography>
                    </Box>
                  }
                  arrow
                  slotProps={{
                    popper: {
                      sx: {
                        [`& .MuiTooltip-tooltip`]: {
                          backgroundColor: '#198754',
                          color: '#fff',
                        },
                        [`& .MuiTooltip-arrow`]: {
                          color: '#198754',
                        },
                      }
                    }
                  }}
                >
                  <Avatar
                    alt={
                      view.first_name
                        ? `${view.first_name}_Avatar`
                        : view.user_first_name
                          ? `${view.user_first_name}_Avatar`
                          : "User_Avatar"
                    }
                    src={
                      view.user_profile_pic
                        ? `${location.origin}/storage/${view.user_profile_pic}`
                        : '../../../../../images/avatarpic.jpg'
                    }
                    sx={{
                      mr: 1,
                      transition: 'background 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#198754',
                        boxShadow: 3,
                      },
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementViewer;