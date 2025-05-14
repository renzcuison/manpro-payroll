import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, Typography, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import Swal from "sweetalert2";
import "react-quill/dist/quill.snow.css";

//Leaflet imports
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, FeatureGroup } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import L from 'leaflet';
import "leaflet-draw/dist/leaflet.draw.css";
import 'leaflet/dist/leaflet.css';

const Update = ({ open, close, data}) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [name, setName] = useState("");
    const [status, setStatus] = useState("");
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [radius, setRadius] = useState("");
    const featureGroupRef = useRef();

    useEffect(() => {
        if (featureGroupRef.current && latitude && longitude && radius) {
            const fg = featureGroupRef.current;

            fg.clearLayers(); // Clear any existing shapes

            const editableCircle = new L.Circle([latitude, longitude], {
                radius: radius,
                color: 'orange'
            });

            fg.addLayer(editableCircle); // Make it editable through react-leaflet-draw
        }
    }, [latitude, longitude, radius]);


    useEffect(() => {
        if (data) {
            setName(data.name || "");
            setStatus(data.status || "");
            setLatitude(data.latitude || null);
            setLongitude(data.longitude || null);
            setRadius(data.radius || "");
        }
    }, [data]);

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="lg" PaperProps={{ style: { padding: "16px", backgroundColor: "#f8f9fa", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", borderRadius: "20px", minWidth: "1200px", maxWidth: "1500px", marginBottom: "5%", }, }} >
                <DialogTitle sx={{ padding: 4 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} >
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: "bold" }} > Update Perimeter </Typography>
                        <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                    </Box>
                    <Box sx={{mt: 3, display: "flex", gap: 2, alignItems: "center", justifyContent: "center" }} >
                        <TextField
                            label="Perimeter Name"
                            type="text"
                            variant="outlined"
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            sx={{ marginBottom: 2 }}
                        />
                        <FormControl fullWidth sx={{ marginBottom: 2 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={status}
                                label="Status"
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Box>
                        <Box sx={{ height: '400px', width: '100%', borderRadius: 2, overflow: 'hidden', zIndex: 10 }}>
                            <MapContainer
                                center={latitude && longitude ? [latitude, longitude] : [7.0791, 125.6043]}
                                zoom={12}
                                scrollWheelZoom={true}
                                style={{ height: "100%", width: "100%" }}
                            >
                                <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />

                                {latitude && longitude && radius && (
                                    <Circle
                                        center={[latitude, longitude]}
                                        radius={radius}
                                        pathOptions={{ color: 'orange' }}
                                    />
                                )}

        
                                <FeatureGroup ref={featureGroupRef}>
                                    <EditControl
                                        position="topright"
                                        onEdited={(e) => {
                                            e.layers.eachLayer((layer) => {
                                                if (layer instanceof L.Circle) {
                                                    const { lat, lng } = layer.getLatLng();
                                                    setLatitude(lat);
                                                    setLongitude(lng);
                                                    setRadius(layer.getRadius());
                                                }
                                            });
                                        }}
                                        onDeleted={(e) => {
                                            e.layers.eachLayer((layer) => {
                                                if (layer instanceof L.Circle) {
                                                    setLatitude(null);
                                                    setLongitude(null);
                                                    setRadius('');
                                                }
                                            });
                                        }}
                                        draw={{
                                            rectangle: false,
                                            polygon: false,
                                            polyline: false,
                                            marker: false,
                                            circlemarker: false,
                                            circle: false,
                                        }}
                                    />
                                </FeatureGroup>
                            </MapContainer>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button variant="contained" color="primary" sx={{width: '200px'}}>
                                Update Perimeter
                            </Button>
                        </Box>
                    </Box>
                </DialogTitle>
            </Dialog>
        </>
    );
};

export default Update;