import React, { useState, useEffect } from 'react'
import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox, ListItemText } from '@mui/material';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination } from '@mui/material'
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useUser } from '../../../hooks/useUser';
import Swal from "sweetalert2";

//Leaflets imports
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, FeatureGroup } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import L from 'leaflet';
import "leaflet-draw/dist/leaflet.draw.css";
import 'leaflet/dist/leaflet.css';

//icons
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { RepeatOneSharp } from '@mui/icons-material';


const RadiusPerimeter = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(true);
    const [nameError, setnameError] = useState(false);

    const [name, setName] = useState('');
    const [radius, setRadius] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null); 
    const [locationName, setLocationName] = useState('');
    const [status, setStatus] = useState("Active");


    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            if (data && data.display_name) {
                setLocationName(data.display_name);
            } else {
                setLocationName("Unknown location");
            }
        } catch (error) {
            console.error("Reverse geocoding failed", error);
            setLocationName("Unknown location");
        }
    };

    const checkInput = (event) => {
        event.preventDefault();

        if (!name) {
            setnameError(true);
        } else {
            setnameError(false);
        }

        if ( !name ) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "You want to save this perimeter?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: 'Save',
                confirmButtonColor: '#177604',
                showCancelButton: true,
                cancelButtonText: 'Cancel',
            }).then((res) => {
                if (res.isConfirmed) {
                    saveInput(event);
                }
            });
        }
    };

    const saveInput = async (event) => {
        event.preventDefault();

        const data = {
            name,
            radius,
            latitude: String(latitude.lat),
            longitude: String(longitude.lng),
            location_name: locationName,
            status
        };

        try {
            Swal.fire({
                title: "Saving Perimeter...",
                text: "Please wait while we save the perimeter.",
                icon: "info",
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const response = await axiosInstance.post('/perimeters/saveRadiusPerimeter', data, { headers });

            if (response.data.status === 200) {
                Swal.close();
                await Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Radius perimeter saved successfully!",
                    icon: "success",
                    showConfirmButton: true,
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#177604',
                });
                navigate(`/admin/perimeters`);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Save failed',
                    text: 'An error occurred while saving.',
                });
            }
        } catch (error) {
            if(error.response && error.response.status === 422) {
                Swal.fire({
                    icon: 'error',
                    title: 'Save failed',
                    text: 'The name you entered already exists!',
                    confirmButtonText: 'OK',
                    confirmButtonColor: 'red',
                });
            }else{
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Save failed',
                    text: 'An error occurred while saving.',
                });
            }
        }
        };

    return (
        <Layout title={"Radius Perimeter"}>
            <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    itemsAlign: 'center',
                    cursor: 'pointer',
                    '&:hover .hover-text': { color: 'orange' },
                    '&:hover .hover-icon': { color: 'orange' },
                    width:'fit-content',
                }}
                onClick={() => window.history.back()}
            >
                <KeyboardBackspaceIcon className="hover-text" sx={{ width: '15px', height: '15px' }} />
                <Typography className="hover-text" ml={1} sx={{ fontSize: '13px' }}>
                    Back
                </Typography>
            </Box>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 0, padding: 2}}>
                <Typography variant='h4' sx={{ fontWeight:'bold', color: 'black' }}>
                    Add Perimeter
                </Typography>
            </Box>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, padding: 2, backgroundColor: 'white', borderRadius: 2, boxShadow: 1, mb: 2}}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6} sx={{width: '100%'}}>
                        <Box sx={{ width: '100%',  padding: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
                            <Box container spacing={2} sx={{width: '100%', display:'flex' , justifyContent:'space-between', gap: 2}}>
                                <Grid item xs={12} sx={{width: '100%'}}>
                                    <TextField
                                        label="Name"
                                        fullWidth
                                        value={name}
                                        error={nameError}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sx={{width: '100%'}}>
                                    <FormControl sx={{ minWidth: 200 }} fullWidth>
                                        <InputLabel id="status-label">Status</InputLabel>
                                        <Select
                                            labelId="status-label"
                                            value={status}
                                            label="Status"
                                            onChange={(e) => setStatus(e.target.value)}
                                        >
                                            <MenuItem value="Active">Active</MenuItem>
                                            <MenuItem value="Inactive">Inactive</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Box>
                            <Box sx={{display:'flex', gap: 2}}>
                                <Grid item xs={12} sx={{width: '100%'}}>
                                    <TextField
                                        label="Location Name"
                                        fullWidth
                                        value={locationName}
                                        onChange={(e) => setLocationName(e.target.value)}
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={12} sx={{width: '100%'}}>
                                    <TextField
                                        label="Radius (meters)"
                                        fullWidth
                                        type="number"
                                        value={radius}
                                        InputProps={{ readOnly: true }}
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={12} sx={{width: '100%'}}>
                                    <TextField
                                        label="Latitude"
                                        fullWidth
                                        value={latitude ? latitude.lat : ''}
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={12} sx={{width: '100%'}}>
                                    <TextField
                                        label="Longitude"
                                        fullWidth
                                        value={longitude ? longitude.lng : ''}
                                        disabled
                                    />
                                </Grid>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
                <Box sx={{ height: '400px', width: '100%', borderRadius: 2, overflow: 'hidden', zIndex: 10 }}>
                    <MapContainer
                        center={[7.079172577932243, 125.60436044786483]}
                        zoom={13}
                        scrollWheelZoom={true}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />

                        <FeatureGroup>
                            <EditControl
                                position="topright"
                                onCreated={(e) => {
                                    if (e.layerType === "circle") {
                                    const layer = e.layer;
                                    const { lat, lng } = layer.getLatLng();
                                    setLatitude({ lat });
                                    setLongitude({ lng });
                                    setRadius(layer.getRadius());
                                    reverseGeocode(lat, lng);
                                    }
                                }}
                                onEdited={(e) => {
                                    e.layers.eachLayer((layer) => {
                                    if (layer instanceof L.Circle) {
                                        const { lat, lng } = layer.getLatLng();
                                        setLatitude({ lat });
                                        setLongitude({ lng });
                                        setRadius(layer.getRadius());
                                        reverseGeocode(lat, lng);
                                    }
                                    });
                                }}
                                onDeleted={(e) => {
                                    e.layers.eachLayer((layer) => {
                                    if (layer instanceof L.Circle) {
                                        setLatitude(null);
                                        setLongitude(null);
                                        setRadius(''); // Reset to default radius if needed
                                        setLocationName('');
                                    }
                                    });
                                }}
                                draw={{
                                    rectangle: false,
                                    polygon: false,
                                    polyline: false,
                                    marker: false,
                                    circlemarker: false,
                                    circle: {
                                    shapeOptions: {
                                        color: "orange",
                                    },
                                    },
                                }}
                            />
                        </FeatureGroup>
                    </MapContainer>
                </Box>
                <Box onClick={checkInput} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" color="primary" sx={{width: '200px'}}>
                        Save Perimeter
                    </Button>
                </Box>
            </Box>
        </Layout >
    )
}

export default RadiusPerimeter;