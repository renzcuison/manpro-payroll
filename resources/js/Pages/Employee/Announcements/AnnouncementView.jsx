import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Grid,
  CircularProgress,
  IconButton,
  Divider,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { MoreVert, Download, CheckCircle } from "@mui/icons-material";
import dayjs from "dayjs";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import Swal from "sweetalert2";
import InfoBox from "../../../components/General/InfoBox";
import { useNavigate, useParams } from "react-router-dom";

import PdfImage from "../../../../../public/media/assets/PDF_file_icon.png";
import DocImage from "../../../../../public/media/assets/Docx_file_icon.png";
import XlsImage from "../../../../../public/media/assets/Excel_file_icon.png";

const AnnouncementView = () => {
  const { code } = useParams();
  const storedUser = localStorage.getItem("nasya_user");
  const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : {};
  const navigate = useNavigate();

  const theme = useTheme();
  const smScreen = useMediaQuery(theme.breakpoints.up("sm"));
  const medScreen = useMediaQuery(theme.breakpoints.up("md"));
  const capSize = medScreen ? "h4" : "h5";
  const colCount = medScreen ? 5 : smScreen ? 3 : 2;
  const headSize = medScreen ? "h5" : "h6";

  // Announcement Data States
  const [isLoading, setIsLoading] = useState(false);
  const [announcement, setAnnouncement] = useState({});
  const [imagePath, setImagePath] = useState("");
  const [imageLoading, setImageLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    getAnnouncementDetails();
    getAnnouncementThumbnail();
    getAnnouncementFiles();
    logAnnouncementView();
  }, [code]);

  // Log View
  const logAnnouncementView = async () => {
    if (!code) {
      console.error("No announcement code provided");
      return;
    }
    try {
      console.log(`Logging view for announcement_code: ${code}`);
      const response = await axiosInstance.post(
        "/announcements/logView",
        { announcement_code: code },
        { headers }
      );
      console.log("View logged successfully:", response.data);
    } catch (error) {
      console.error("Error logging view:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
  };

  // Announcement Details
  const getAnnouncementDetails = () => {
    setIsLoading(true);
    axiosInstance
      .get(`/announcements/getEmployeeAnnouncementDetails/${code}`, { headers })
      .then((response) => {
        setAnnouncement(response.data.announcement || {});
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching announcement details:", error);
        setIsLoading(false);
      });
  };

  // Announcement Thumbnail
  const getAnnouncementThumbnail = () => {
    axiosInstance
      .get(`/announcements/getThumbnail/${code}`, { headers })
      .then((response) => {
        if (response.data.thumbnail) {
          const byteCharacters = window.atob(response.data.thumbnail);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "image/png" });
          setImagePath(URL.createObjectURL(blob));
        } else {
          setImagePath("../../../../images/ManProTab.png");
        }
        setImageLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching thumbnail:", error);
        setImagePath("../../../../images/ManProTab.png");
        setImageLoading(false);
      });
  };

  // Announcement Files
  const getAnnouncementFiles = () => {
    axiosInstance
      .get(`/announcements/getEmployeeAnnouncementFiles/${code}`, { headers })
      .then((response) => {
        setImages(response.data.images || []);
        setAttachments(response.data.attachments || []);
      })
      .catch((error) => {
        console.error("Error fetching files:", error);
      });
  };

  // Document Icon
  const getFileIcon = (filename) => {
    const fileType = filename.split(".").pop().toLowerCase();
    let src = null;
    switch (fileType) {
      case "doc":
      case "docx":
        src = DocImage;
        break;
      case "pdf":
        src = PdfImage;
        break;
      case "xls":
      case "xlsx":
        src = XlsImage;
        break;
      default:
        src = null;
    }
    return src;
  };

  // Download Attachment
  const handleFileDownload = (filename, id) => {
    axiosInstance
      .get(`/announcements/downloadFile/${id}`, { responseType: "blob", headers })
      .then((response) => {
        const blob = new Blob([response.data], {
          type: response.headers["content-type"],
        });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(link.href);
      })
      .catch((error) => {
        console.error("Error downloading file:", error);
      });
  };

  // Announcement Menu
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Acknowledge Announcement
  const handleAcknowledgeAnnouncement = () => {
    document.activeElement.blur();
    Swal.fire({
      customClass: { container: "my-swal" },
      title: "Acknowledge Announcement?",
      text: "Do you want to acknowledge this announcement?",
      icon: "warning",
      showConfirmButton: true,
      confirmButtonText: "Yes",
      confirmButtonColor: "#177604",
      showCancelButton: true,
      cancelButtonText: "No",
    }).then((res) => {
      if (res.isConfirmed) {
        const data = { code };
        axiosInstance
          .post(`announcements/acknowledgeAnnouncement`, data, { headers })
          .then((response) => {
            Swal.fire({
              customClass: { container: "my-swal" },
              title: "Success!",
              text: `Announcement Acknowledged`,
              icon: "success",
              showConfirmButton: true,
              confirmButtonText: "Okay",
              confirmButtonColor: "#177604",
            }).then(() => {
              getAnnouncementDetails();
            });
          })
          .catch((error) => {
            console.error("Error acknowledging announcement:", error);
          });
      }
    });
  };

  // Image Renders
  const [blobMap, setBlobMap] = useState({});

  const renderImage = (id, data, mime) => {
    if (!blobMap[id]) {
      const byteCharacters = atob(data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mime });
      const newBlob = URL.createObjectURL(blob);
      setBlobMap((prev) => ({ ...prev, [id]: newBlob }));
      return newBlob;
    } else {
      return blobMap[id];
    }
  };

  // Image Cleanup
  useEffect(() => {
    return () => {
      if (imagePath && imagePath.startsWith("blob:")) {
        URL.revokeObjectURL(imagePath);
      }
      Object.values(blobMap).forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
      setBlobMap({});
    };
  }, [imagePath]);

  return (
    <Layout title={"AnnouncementView"}>
      <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}>
        <Box sx={{ mx: "auto", width: { xs: "100%", md: "95%" } }}>
          <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }}>
            <Box sx={{
              mt: 5,
              display: "flex",
              justifyContent: "space-between",
              px: 1,
              alignItems: "center",
              width: "100%"
            }}>
              <Box display="flex" sx={{ alignItems: "center" }}>
                <Typography
                  variant={capSize}
                  sx={{
                    fontWeight: "bold",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    lineHeight: 1.5,
                    paddingRight: { xs: 0, md: 2 },
                  }}
                >
                  {announcement.title || "Announcement"}
                </Typography>
                {announcement.acknowledged && (
                  <Tooltip title="You have acknowledged this announcement">
                    <CheckCircle
                      sx={{
                        ml: 1,
                        fontSize: 36,
                        color: "#177604",
                        transition: "color 0.2s ease-in-out",
                        "&:hover": { color: "#1A8F07" },
                      }}
                    />
                  </Tooltip>
                )}
              </Box>
              <IconButton onClick={() => navigate("/employee/announcements")}>
                    <i className="si si-close"></i>
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ mt: 6, p: { xs: 2, md: 3 }, bgcolor: "#ffffff", borderRadius: "8px" }}>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container columnSpacing={4} rowSpacing={2}>
                {/* Thumbnail */}
                <Grid size={12}>
                  <Box
                    sx={{
                      mb: 1,
                      position: "relative",
                      width: "100%",
                      aspectRatio: "2 / 1",
                      borderRadius: "4px",
                      border: "2px solid #e0e0e0",
                    }}
                  >
                    {imageLoading ? (
                      <Box sx={{ display: "flex", placeSelf: "center", justifyContent: "center", alignItems: "center", height: "100%" }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <img
                        src={imagePath}
                        alt={`${announcement.title} thumbnail`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    )}
                  </Box>
                </Grid>
                {/* Core Information */}
                <Grid container size={12} spacing={1} sx={{ justifyContent: "flex-start", alignItems: "flex-start" }}>
                  {/* Header and Action Menu */}
                  <Grid size={12}>
                    <Typography variant={headSize} sx={{ fontWeight: "bold", color: "text.primary", mb: 1}}>
                      About This Announcement:
                    </Typography>  
                  </Grid>
                  {/* Posting Date */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoBox
                      title="Date Posted"
                      info={announcement.updated_at ? dayjs(announcement.updated_at).format("MMM D, YYYY    h:mm A") : "-"}
                      compact
                      clean
                    />
                  </Grid>
                  {/* Author Information */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ display: "flex", width: "100%", alignItems: "flex-start" }}>
                      <Typography
                        sx={{
                          color: "text.secondary",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          flex: "0 0 40%",
                        }}
                      >
                        Posted by
                      </Typography>
                      <Stack sx={{ flex: "0 0 60%", textAlign: "left" }}>
                        <Typography sx={{ fontWeight: 600, color: "text.primary" }}>
                          {announcement.author_name || "-"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          {announcement.author_title || "-"}
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12 }} sx={{ my: 0, mb: 1 }}>
                    <Divider />
                  </Grid>
                  {/* Acknowledgement Status */}
                  {announcement.acknowledged ? (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InfoBox
                        title="Acknowledged On"
                        info={announcement.ack_timestamp ? dayjs(announcement.ack_timestamp).format("MMM D, YYYY    h:mm A") : "-"}
                        compact
                        clean
                      />
                    </Grid>
                  ) : (
                    <Grid size={{ xs: 12, md: 6 }} align="left">
                      <Typography
                        sx={{
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                          lineHeight: 1.5,
                          paddingRight: { xs: 0, md: 2 },
                        }}
                      >
                        You have not acknowledged this announcement yet
                      </Typography>
                    </Grid>
                  )}
                  {/* Recipient Branch/Department */}
                  <Grid size={{ xs: 12, md: 6 }} align="left">
                    <Typography
                      sx={{
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        lineHeight: 1.5,
                        paddingRight: { xs: 0, md: 2 },
                      }}
                    >
                      {`This announcement is posted for your ${
                        announcement.department_matched && announcement.branch_matched
                          ? "branch and department"
                          : announcement.department_matched
                          ? "department"
                          : "branch"
                      }`}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid size={{ xs: 12 }} sx={{ my: 0 }}>
                  <Divider />
                </Grid>
                {/* Description */}
                <Grid size={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                    Description
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      wordWrap: "break-word",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      whiteSpace: "pre-wrap",
                    }}
                    dangerouslySetInnerHTML={{ __html: announcement.description || "" }}
                  />
                </Grid>
                {/* Divider for Media if Present */}
                {(images.length > 0 || attachments.length > 0) && (
                  <Grid size={{ xs: 12 }} sx={{ my: 0 }}>
                    <Divider />
                  </Grid>
                )}
                {/* Images */}
                {images.length > 0 && (
                  <Grid container spacing={2} size={{ xs: 12 }}>
                    <Grid size={{ xs: 12 }} align="left">
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                        Images
                      </Typography>
                    </Grid>
                    <Grid size={{ md: 12 }} align="left">
                      <ImageList cols={colCount} gap={4} sx={{ width: "100%" }}>
                        {images.map((image) => (
                          <ImageListItem key={image.id} sx={{ aspectRatio: "1/1", width: "100%" }}>
                            <img
                              src={renderImage(image.id, image.data, image.mime)}
                              alt={image.filename}
                              loading="lazy"
                              style={{
                                height: "100%",
                                width: "100%",
                                objectFit: "cover",
                              }}
                            />
                            <ImageListItemBar
                              subtitle={image.filename}
                              actionIcon={
                                <Tooltip title={"Download"}>
                                  <IconButton
                                    sx={{ color: "rgba(255, 255, 255, 0.47)" }}
                                    onClick={() => handleFileDownload(image.filename, image.id)}
                                  >
                                    <Download />
                                  </IconButton>
                                </Tooltip>
                              }
                            />
                          </ImageListItem>
                        ))}
                      </ImageList>
                    </Grid>
                  </Grid>
                )}
                {/* Documents */}
                {attachments.length > 0 && (
                  <Grid container size={{ xs: 12 }} spacing={2}>
                    <Grid size={{ xs: 12 }} align="left">
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                        Documents
                      </Typography>
                    </Grid>
                    <Grid size={{ md: 12 }} align="left">
                      <ImageList cols={colCount} gap={4} sx={{ width: "100%" }}>
                        {attachments.map((attachment) => {
                          const fileIcon = getFileIcon(attachment.filename);
                          return (
                            <ImageListItem key={attachment.id} sx={{ aspectRatio: "1/1", width: "100%" }}>
                              <img
                                src={fileIcon}
                                alt={attachment.filename}
                                loading="lazy"
                                style={{
                                  height: "100%",
                                  width: "100%",
                                  objectFit: "cover",
                                }}
                              />
                              <ImageListItemBar
                                subtitle={attachment.filename}
                                actionIcon={
                                  <Tooltip title={"Download"}>
                                    <IconButton
                                      sx={{ color: "rgba(255, 255, 255, 0.47)" }}
                                      onClick={() => handleFileDownload(attachment.filename, attachment.id)}
                                    >
                                      <Download />
                                    </IconButton>
                                  </Tooltip>
                                }
                              />
                            </ImageListItem>
                          );
                        })}
                      </ImageList>
                    </Grid>
                  </Grid>
                )}
                {/* Acknowledge Button */}
                {!announcement.acknowledged && (
                  <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%", mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleAcknowledgeAnnouncement();
                        handleMenuClose();
                      }}
                    >
                      <p className="m-0">
                        <i className="fa fa-check"></i> Acknowledge{" "}
                      </p>
                    </Button>
                  </Box>
                )}
              </Grid>
            )}
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default AnnouncementView;