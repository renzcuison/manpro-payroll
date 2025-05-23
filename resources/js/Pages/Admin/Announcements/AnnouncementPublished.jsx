import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Pagination,
  CardActionArea,
  Avatar,
  AvatarGroup,
  IconButton
} from "@mui/material";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import AnnouncementPublish from "./Modals/AnnouncementPublish";
import AnnouncementEdit from "./Modals/AnnouncementEdit";
import AnnouncementManage from "./Modals/AnnouncementManage";
import AnnouncementView from "./Modals/AnnouncementViewer";
import { Person } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

dayjs.extend(utc);
dayjs.extend(localizedFormat);

const AnnouncementPublished = () => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("nasya_user");
  const headers = getJWTHeader(JSON.parse(storedUser));

  // ---------------- Announcement Data States
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementReload, setAnnouncementReload] = useState(true);

  // ---------------- Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [announcementsPerPage, setAnnouncementsPerPage] = useState(9);
  const [totalAnnouncements, setTotalAnnouncements] = useState(0);

  const lastAnnouncement = currentPage * announcementsPerPage;
  const firstAnnouncement = lastAnnouncement - announcementsPerPage;
  const publishedAnnouncements = announcements.filter(a => a.status === 'Published');

  const publishedPageAnnouncements = publishedAnnouncements.slice(firstAnnouncement, lastAnnouncement);


  // ---------------- View Modal States
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedViewAnnouncement, setSelectedViewAnnouncement] = useState(null);

  // ---------------- Announcement List API
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = () => {
    setIsLoading(true);
    axiosInstance
      .get("/announcements/getAnnouncements", { headers })
      .then((response) => {
        console.log('API Response:', response.data);
        if (response.data.status === 200) {
          setAnnouncements(response.data.announcements || []);
          setTotalAnnouncements(response.data.announcements?.length || 0);
        } else {
          console.error('Unexpected status:', response.data.status);
          setAnnouncements([]);
          setTotalAnnouncements(0);
        }
        setAnnouncementReload(false);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching announcements:', error.response?.data || error.message);
        setAnnouncements([]);
        setTotalAnnouncements(0);
        setIsLoading(false);
      });
  };

  // ---------------- Announcement Image API
  useEffect(() => {
    if (!announcementReload) {
      setAnnouncementReload(true);
    }
    fetchPageThumbnails();
  }, [announcementReload, firstAnnouncement, lastAnnouncement]);

  // ---------------- Announcement Thumbnail Loader
  const fetchPageThumbnails = () => {
    if (announcements.length > 0) {
      const pagedAnnouncements = announcements.slice(firstAnnouncement, lastAnnouncement);
      const announcementIds = pagedAnnouncements.map((announcement) => announcement.id);

      axiosInstance
        .get("/announcements/getPageThumbnails", {
          headers,
          params: { announcement_ids: announcementIds },
        })
        .then((response) => {
          const thumbnails = response.data.thumbnails;

          setAnnouncements((prevAnnouncements) => {
            const updatedAnnouncements = [...prevAnnouncements];

            pagedAnnouncements.forEach((announcement, paginatedIndex) => {
              const globalIndex = prevAnnouncements.indexOf(announcement);

              if (paginatedIndex < thumbnails.length && thumbnails[paginatedIndex] !== null) {
                const byteCharacters = window.atob(thumbnails[paginatedIndex]);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: "image/png" });
                updatedAnnouncements[globalIndex] = {
                  ...announcement,
                  thumbnail: URL.createObjectURL(blob),
                };
              } else {
                updatedAnnouncements[globalIndex] = { ...announcement };
              }
            });
            return updatedAnnouncements;
          });

          setImageLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching thumbnails:", error);
          setImageLoading(false);
        });
    }
  };

  // ---------------- Pagination Controls
  const handleChangePage = (event, value) => {
    setCurrentPage(value);
    setImageLoading(true);
    fetchPageThumbnails();
  };

  // ---------------- Image Cleanup
  useEffect(() => {
    return () => {
      announcements.forEach((announcement) => {
        if (announcement.thumbnail && announcement.thumbnail.startsWith("blob:")) {
          URL.revokeObjectURL(announcement.thumbnail);
        }
      });
    };
  }, []);

  // ---------------- Announcement Manager
  const [openAnnouncementManage, setOpenAnnouncementManage] = useState(null);
  const handleOpenAnnouncementManage = (announcement) => {
      console.log('Announcement:', announcement); // Debug log
      if (announcement.status === "Published") {
          axiosInstance
              .post(
                  "/announcements/logView",
                  { announcement_code: announcement.unique_code },
                  { headers }
              )
              .catch((error) => {
                  console.error("Error logging view:", error.response?.data || error.message);
              });
      }
      setOpenAnnouncementManage(announcement);
  };
  
  const handleCloseAnnouncementManage = (reload) => {
    setOpenAnnouncementManage(null);
    if (reload) {
      fetchAnnouncements();
    }
  };

  // ---------------- View Modal Controls
  const handleOpenViewModal = (announcement) => {
    setSelectedViewAnnouncement(announcement);
    setOpenViewModal(true);
  };
  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setSelectedViewAnnouncement(null);
  };

  return (
    <Layout title={"AnnouncementPublished"}>
      <Box sx={{ width: "100%", whiteSpace: "nowrap" }}>
        <Box sx={{ mx: "auto", width: { xs: "100%", md: "90%" } }}>
          <Box
            sx={{
              mt: 5,
              display: "flex",
              justifyContent: "space-between",
              px: 1,
              alignItems: "center",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Published Announcements
            </Typography>
            <IconButton onClick={() => navigate("/AnnouncementList")}>
                <i className="si si-close"></i>
            </IconButton>
          </Box>

          <Box sx={{ p: 3, justifyContent: "center", alignItems: "center" }}>
            {isLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 200,
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Grid
                  container
                  rowSpacing={3}
                  columnSpacing={{ xs: 2, sm: 3 }}
                  sx={{
                    ...(publishedPageAnnouncements.length === 0
                      ? { justifyContent: "center" }
                      : {}),
                  }}
                >
                  {publishedPageAnnouncements.length > 0 ? (
                    publishedPageAnnouncements.map((announcement, index) => (
                      <Grid item key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
                        <CardActionArea
                          onClick={() => handleOpenAnnouncementManage(announcement)}
                        >
                          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                            {/* Card Thumbnail */}
                            {imageLoading ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  height: "210px",
                                }}
                              >
                                <CircularProgress />
                              </Box>
                            ) : (
                              <CardMedia
                                sx={{ height: "210px" }}
                                image={
                                  announcement.thumbnail
                                    ? announcement.thumbnail
                                    : "../../../images/ManProTab.png"
                                }
                                title={`${announcement.title}_Thumbnail`}
                              />
                            )}
                            {/* Card Content */}
                            <CardContent>
                              {/* Announcement Title */}
                              <Typography
                                variant="h6"
                                component="div"
                                noWrap
                                sx={{ textOverflow: "ellipsis" }}
                              >
                                {announcement.title}
                              </Typography>
                              {/* Announcement Status */}
                              <Typography
                                sx={{
                                  fontWeight: "bold",
                                  color: "#177604"
                                }}
                              >
                                {announcement.status}
                              </Typography>
                            </CardContent>
                            {/* Acknowledgement, Views, and Options */}
                            <CardActions
                              sx={{
                                width: "100%",
                                paddingX: "16px",
                                alignItems: "center",
                              }}
                            >
                              <Box display="flex" flexDirection="column" sx={{ width: "100%" }}>
                                <Box display="flex" sx={{ alignItems: "center" }}>
                                    <Person sx={{ color: "text.secondary", mr: 1 }} />
                                    <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    >
                                    {`${announcement.acknowledged || 0}/${announcement.recipients || 0} Acknowledged`}
                                    </Typography>
                                </Box>
                                <Box
                                    display="flex"
                                    sx={{ alignItems: "center", mt: 1 }}
                                >
                                    <Person sx={{ color: "text.secondary", mr: 1 }} />
                                    <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    >
                                    {`${announcement.viewed || 0}/${announcement.recipients || 0} Viewed`}
                                    </Typography>
                                </Box>
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    sx={{ mt: 1, width: "100%" }}
                                >
                                    <Box display="flex" alignItems="center">
                                    <AvatarGroup
                                        max={10}
                                        sx={{ "& .MuiAvatar-root": { width: 24, height: 24 } }}
                                    >
                                        {announcement.views &&
                                        announcement.views.map((view, idx) => (
                                            <Avatar
                                            key={idx}
                                            src={view.profile_pic}
                                            alt={`${view.first_name} ${view.last_name}`}
                                            onError={(e) => {
                                                console.error(`Failed to load avatar`, {
                                                user_id: view.user_id,
                                                name: `${view.first_name} ${view.last_name}`,
                                                url: view.profile_pic,
                                                error: e.message,
                                                });
                                                e.target.src = "/images/default-avatar.png";
                                            }}
                                            />
                                        ))}
                                    </AvatarGroup>
                                    {announcement.viewed > 10 && (
                                        <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ ml: 1 }}
                                        >
                                        +{announcement.viewed - 10}
                                        </Typography>
                                    )}
                                    </Box>
                                    {announcement.status !== "Pending" && announcement.viewed > 0 && (
                                    <Button
                                        size="small"
                                        variant="text"
                                        color="primary"
                                        onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenViewModal(announcement);
                                        }}
                                    >
                                        See More
                                    </Button>
                                    )}
                                </Box>
                              </Box>
                            </CardActions>
                          </Card>
                        </CardActionArea>
                      </Grid>
                    ))
                  ) : (
                    <Box
                      sx={{
                        mt: 5,
                        p: 3,
                        bgcolor: "#ffffff",
                        borderRadius: 3,
                        width: "100%",
                        maxWidth: 350,
                        textAlign: "center",
                      }}
                    >
                      No Published Announcements
                    </Box>
                  )}
                </Grid>
                {/* Pagination Controls */}
                {totalAnnouncements > announcementsPerPage && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <Pagination
                      shape="rounded"
                      count={Math.ceil(totalAnnouncements / announcementsPerPage)}
                      page={currentPage}
                      onChange={handleChangePage}
                      color="primary"
                      size="large"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>
      {openAnnouncementManage && (
        <AnnouncementManage
          open={true}
          close={handleCloseAnnouncementManage}
          announceInfo={openAnnouncementManage}
        />
      )}
      {selectedViewAnnouncement && (
        <AnnouncementView
          open={openViewModal}
          close={handleCloseViewModal}
          announcement={selectedViewAnnouncement}
        />
      )}
    </Layout>
  );
};

export default AnnouncementPublished;