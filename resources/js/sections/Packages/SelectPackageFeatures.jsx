import {
    Box,
    Divider,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import React from "react";
import { useFeatures } from "../../Pages/SuperAdmin/hooks/useFeatures";
import { useQueryClient } from "@tanstack/react-query";
import { usePackage } from "../../Pages/SuperAdmin/hooks/usePackages";

function SelectPackageFeatures(props) {
    const { pkg, handleChange } = props;
    const queryClient = useQueryClient();

    // const { packageData, isLoading } = usePackage(pkg.id);
    const { data, isFetching, isFetched } = useFeatures();

    if (!pkg?.id || isFetching || !isFetched) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Stack sx={{ mt: 3, border: "1px solid #ccc", p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
                Select Package Features
            </Typography>
            <Divider sx={{ borderStyle: "dashed" }} />
            <Stack spacing={1} sx={{ pt: 2 }}>
                {isFetched &&
                    data?.map((feature, index) => {
                        const exists =
                            pkg?.features?.filter((f) => f.id === feature.id)
                                .length > 0;

                        return (
                            <Box
                                key={index}
                                sx={{
                                    p: 1,
                                    px: 2,
                                    border: "1px solid #ccc",
                                    borderRadius: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Typography variant="body2">
                                    {feature.name}
                                </Typography>
                                <Switch
                                    checked={exists}
                                    onChange={() => handleChange(feature.id)}
                                    size="small"
                                />
                            </Box>
                        );
                    })}
            </Stack>
        </Stack>
    );
}

export default SelectPackageFeatures;
