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
} from "@mui/material";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import AnnouncementAdd from "./Modals/AnnouncementAdd";
import AnnouncementPublish from "./Modals/AnnouncementPublish";
import AnnouncementEdit from "./Modals/AnnouncementEdit";
import AnnouncementManage from "./Modals/AnnouncementManage";
import AnnouncementView from "./Modals/AnnouncementViewer";
import { Person } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

dayjs.extend(utc);
dayjs.extend(localizedFormat);

const AnnouncementList = () => {
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
  const pendingAnnouncements = announcements.filter(a => a.status === 'Pending');
  const hiddenAnnouncements = announcements.filter(a => a.status === 'Hidden');

    // For pagination, slice these arrays as needed:
  const publishedPageAnnouncements = publishedAnnouncements.slice(firstAnnouncement, lastAnnouncement);
  const pendingPageAnnouncements = pendingAnnouncements.slice(firstAnnouncement, lastAnnouncement);
  const hiddenPageAnnouncements = hiddenAnnouncements.slice(firstAnnouncement, lastAnnouncement);


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

  // ---------------- Announcement Modal
  const [openAddAnnouncementModal, setOpenAddAnnouncementModal] = useState(false);
  const handleOpenAnnouncementModal = () => {
    setOpenAddAnnouncementModal(true);
  };
  const handleCloseAnnouncementModal = (reload) => {
    setOpenAddAnnouncementModal(false);
    if (reload) {
      fetchAnnouncements();
    }
  };

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
    <Layout title={"AnnouncementList"}>
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
              Announcements
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenAnnouncementModal}
            >
              <p className="m-0">
                <i className="fa fa-plus"></i> Add{" "}
              </p>
            </Button>
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
              {/* Published Announcements */}
                <Box
                  sx={{
                    mt:2,
                    mb: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    px: 1,
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    PUBLISHED
                  </Typography>
                  <Button color="#fff" 
                  onClick={() => navigate("/AnnouncementPublished")}
                  >
                    <p className="m-0" >
                      <i className="fa fa-arrow-right"></i> See All{" "}
                    </p>
                  </Button>
                </Box>
                {publishedPageAnnouncements.length > 0 ? (
                  <Slider
                    dots={false}
                    infinite={false}
                    speed={500}
                    slidesToShow={3}
                    slidesToScroll={1}
                    responsive={[
                      {
                        breakpoint: 1200,
                        settings: { slidesToShow: 2}
                      },
                      {
                        breakpoint: 800,
                        settings: { slidesToShow: 1}
                      }
                    ]}
                  >
                    {publishedPageAnnouncements.map((announcement, index) => (
                      <Box key={index} sx={{ px: 1 }}>
                        <CardActionArea
                          onClick={() => handleOpenAnnouncementManage(announcement)}
                        >
                            {imageLoading ? (
                              <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
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
                                {/* Card Content */}
                                <CardContent>
                                  <Typography
                                    variant="h6"
                                    component="div"
                                    noWrap
                                    sx={{ textOverflow: "ellipsis", fontWeight: 'bold', }}
                                  >
                                    {announcement.title}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontWeight: "bold",
                                      color:
                                          announcement.status === "Pending"
                                            ? "#e9ae20"
                                            : announcement.status === "Published"
                                            ? "#177604"
                                            : "#f57c00",
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
                            ) : announcement.thumbnail ? (
                                // {/* with thumbnail */}
                                <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                                  <CardMedia
                                    sx={{ height: "210px" }}
                                    image={
                                      announcement.thumbnail
                                        ? announcement.thumbnail
                                        : "../../../images/defaultThumbnail.jpg"
                                    }
                                    title={`${announcement.title}_Thumbnail`}
                                  />
                                  {/* Card Content */}
                                  <CardContent>
                                    <Typography
                                      variant="h6"
                                      component="div"
                                      noWrap
                                      sx={{ textOverflow: "ellipsis", fontWeight: 'bold', }}
                                    >
                                      {announcement.title}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontWeight: "bold",
                                        color:
                                          announcement.status === "Pending"
                                            ? "#e9ae20"
                                            : announcement.status === "Published"
                                            ? "#177604"
                                            : "#f57c00",
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
                              ) : (
                                // {/* without thumbnail */}
                                <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                                  <Box
                                    sx={{ height: "395px", py: 6, px: 2 }}
                                  >
                                    {/* Card Content */}
                                    <CardContent>
                                      <Typography
                                        variant="h5"
                                        component="div"
                                        sx={{
                                          fontWeight: 'bold',
                                          whiteSpace: 'normal',
                                          wordBreak: 'break-word',
                                          mb: 2 
                                        }}
                                      >
                                        {announcement.title}
                                      </Typography>
                                      <Typography
                                        sx={{
                                          fontWeight: "bold",
                                          color:
                                          announcement.status === "Pending"
                                            ? "#e9ae20"
                                            : announcement.status === "Published"
                                            ? "#177604"
                                            : "#f57c00",
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
                                          sx={{ mt: 3, width: "100%" }}
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
                                  </Box>
                                </Card>
                              )
                            }
                        </CardActionArea>
                      </Box>
                    ))}
                  </Slider>
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

                {/* Pending Announcements */}
                <Box
                  sx={{
                    mt:8,
                    mb: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    px: 1,
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    PENDING
                  </Typography>
                  <Button
                    color="#fff"
                    onClick={() => navigate("/AnnouncementPending")}
                  >
                    <p className="m-0">
                      <i className="fa fa-arrow-right"></i> See All{" "}
                    </p>
                  </Button>
                </Box>
                {pendingPageAnnouncements.length > 0 ? (
                  <Slider
                    dots={false}
                    infinite={false}
                    speed={500}
                    slidesToShow={3}
                    slidesToScroll={1}
                    responsive={[
                      {
                        breakpoint: 1200,
                        settings: { slidesToShow: 2}
                      },
                      {
                        breakpoint: 800,
                        settings: { slidesToShow: 1}
                      }
                    ]}
                  >
                    {pendingPageAnnouncements.map((announcement, index) => (
                      <Box item key={index} sx={{ px: 1 }}>
                        <CardActionArea
                          onClick={() => handleOpenAnnouncementManage(announcement)}
                        >
                          {imageLoading ? (
                              <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
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
                                {/* Card Content */}
                                <CardContent>
                                  <Typography
                                    variant="h6"
                                    component="div"
                                    noWrap
                                    sx={{ textOverflow: "ellipsis", fontWeight: 'bold', }}
                                  >
                                    {announcement.title}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontWeight: "bold",
                                      color:
                                          announcement.status === "Pending"
                                            ? "#e9ae20"
                                            : announcement.status === "Published"
                                            ? "#177604"
                                            : "#f57c00",
                                    }}
                                  >
                                    {announcement.status}
                                  </Typography>
                                  {announcement.status === "Pending" && announcement.scheduled_send_datetime && (
                                    <Typography
                                      sx={{
                                          fontWeight: "bold",
                                          color: "#adb5bd"
                                        }}
                                      >
                                      {dayjs(announcement.scheduled_send_datetime).format('MMM D, YYYY h:mm A')}
                                    </Typography>
                                  )}
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
                                    <Typography variant="body2" color="text.secondary">
                                        Not Yet Published
                                      </Typography>
                                  </Box>
                                </CardActions>
                              </Card>
                            ) : announcement.thumbnail ? (
                                // {/* with thumbnail */}
                                <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                                  <CardMedia
                                    sx={{ height: "210px" }}
                                    image={
                                      announcement.thumbnail
                                        ? announcement.thumbnail
                                        : "../../../images/defaultThumbnail.jpg"
                                    }
                                    title={`${announcement.title}_Thumbnail`}
                                  />
                                  {/* Card Content */}
                                  <CardContent>
                                    <Typography
                                      variant="h6"
                                      component="div"
                                      noWrap
                                      sx={{ textOverflow: "ellipsis", fontWeight: 'bold', }}
                                    >
                                      {announcement.title}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontWeight: "bold",
                                        color:
                                          announcement.status === "Pending"
                                            ? "#e9ae20"
                                            : announcement.status === "Published"
                                            ? "#177604"
                                            : "#f57c00",
                                      }}
                                    >
                                      {announcement.status}
                                    </Typography>
                                    {announcement.status === "Pending" && announcement.scheduled_send_datetime && (
                                      <Typography
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#adb5bd"
                                          }}
                                        >
                                        {dayjs(announcement.scheduled_send_datetime).format('MMM D, YYYY h:mm A')}
                                      </Typography>
                                    )}
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
                                      <Typography variant="body2" color="text.secondary">
                                          Not Yet Published
                                        </Typography>
                                    </Box>
                                  </CardActions>
                                </Card>
                              ) : (
                                // {/* without thumbnail */}
                                <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                                  <Box
                                    sx={{ height: "330px", py: 6, px: 2 }}
                                  >
                                    {/* Card Content */}
                                    <CardContent>
                                      <Typography
                                        variant="h5"
                                        component="div"
                                        sx={{
                                          fontWeight: 'bold',
                                          whiteSpace: 'normal',
                                          wordBreak: 'break-word',
                                          mb: 2 
                                        }}
                                      >
                                        {announcement.title}
                                      </Typography>
                                      <Typography
                                        sx={{
                                          fontWeight: "bold",
                                          color:
                                          announcement.status === "Pending"
                                            ? "#e9ae20"
                                            : announcement.status === "Published"
                                            ? "#177604"
                                            : "#f57c00",
                                        }}
                                      >
                                        {announcement.status}
                                      </Typography>
                                      {announcement.status === "Pending" && announcement.scheduled_send_datetime && (
                                        <Typography
                                          sx={{
                                              fontWeight: "bold",
                                              color: "#adb5bd"
                                            }}
                                          >
                                          {dayjs(announcement.scheduled_send_datetime).format('MMM D, YYYY h:mm A')}
                                        </Typography>
                                      )}            
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
                                        <Typography variant="body2" color="text.secondary">
                                            Not Yet Published
                                          </Typography>
                                      </Box>
                                    </CardActions>
                                  </Box>
                                </Card>
                              )
                            }
                        </CardActionArea>
                      </Box>
                    ))}
                  </Slider>
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
                      No Announcements
                    </Box>
                  )}

                {/* Hidden Announcements */}
                <Box
                  sx={{
                    mt:8,
                    mb: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    px: 1,
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    HIDDEN
                  </Typography>
                  <Button
                    color="#fff"
                    onClick={() => navigate("/AnnouncementHidden")}
                  >
                    <p className="m-0">
                      <i className="fa fa-arrow-right"></i> See All{" "}
                    </p>
                  </Button>
                </Box>
                {hiddenPageAnnouncements.length > 0 ? (
                  <Slider
                    dots={false}
                    infinite={false}
                    speed={500}
                    slidesToShow={3}
                    slidesToScroll={1}
                    responsive={[
                      {
                        breakpoint: 1200,
                        settings: { slidesToShow: 2 }
                      },
                      {
                        breakpoint: 800,
                        settings: { slidesToShow: 1 }
                      }
                    ]}
                  >
                    {hiddenPageAnnouncements.map((announcement, index) => (
                      <Box key={index} sx={{ px: 1 }}>
                        <CardActionArea
                            onClick={() => handleOpenAnnouncementManage(announcement)}
                          >
                            {imageLoading ? (
                              <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
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
                                {/* Card Content */}
                                <CardContent>
                                  <Typography
                                    variant="h6"
                                    component="div"
                                    noWrap
                                    sx={{ textOverflow: "ellipsis", fontWeight: 'bold', }}
                                  >
                                    {announcement.title}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontWeight: "bold",
                                      color:
                                          announcement.status === "Pending"
                                            ? "#e9ae20"
                                            : announcement.status === "Published"
                                            ? "#177604"
                                            : "#f57c00",
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
                            ) : announcement.thumbnail ? (
                                // {/* with thumbnail */}
                                <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                                  <CardMedia
                                    sx={{ height: "210px" }}
                                    image={
                                      announcement.thumbnail
                                        ? announcement.thumbnail
                                        : "../../../images/defaultThumbnail.jpg"
                                    }
                                    title={`${announcement.title}_Thumbnail`}
                                  />
                                  {/* Card Content */}
                                  <CardContent>
                                    <Typography
                                      variant="h6"
                                      component="div"
                                      noWrap
                                      sx={{ textOverflow: "ellipsis", fontWeight: 'bold', }}
                                    >
                                      {announcement.title}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontWeight: "bold",
                                        color:
                                          announcement.status === "Pending"
                                            ? "#e9ae20"
                                            : announcement.status === "Published"
                                            ? "#177604"
                                            : "#f57c00",
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
                              ) : (
                                // {/* without thumbnail */}
                                <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                                  <Box
                                    sx={{ height: "395px", py: 6, px: 2 }}
                                  >
                                    {/* Card Content */}
                                    <CardContent>
                                      <Typography
                                        variant="h5"
                                        component="div"
                                        sx={{
                                          fontWeight: 'bold',
                                          whiteSpace: 'normal',
                                          wordBreak: 'break-word',
                                          mb: 2 
                                        }}
                                      >
                                        {announcement.title}
                                      </Typography>
                                      <Typography
                                        sx={{
                                          fontWeight: "bold",
                                          color:
                                          announcement.status === "Pending"
                                            ? "#e9ae20"
                                            : announcement.status === "Published"
                                            ? "#177604"
                                            : "#f57c00",
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
                                          sx={{ mt: 3, width: "100%" }}
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
                                  </Box>
                                </Card>
                              )
                            }
                          </CardActionArea>
                        </Box>
                      ))}
                    </Slider>
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
                      No Hidden Announcements
                    </Box>
                  )
                }
              </>
            )}
          </Box>
        </Box>
      </Box>

      {openAddAnnouncementModal && (
        <AnnouncementAdd
          open={openAddAnnouncementModal}
          close={handleCloseAnnouncementModal}
        />
      )}
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

export default AnnouncementList;