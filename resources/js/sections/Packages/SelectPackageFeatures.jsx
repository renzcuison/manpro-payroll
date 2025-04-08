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
import { usePackages } from "../../Pages/SuperAdmin/hooks/usePackages";

function SelectPackageFeatures(props) {
    const { packageData } = props;
    console.log(packageData);

    const { data, isFetching, isFetched } = useFeatures();
    const { assignFeature } = usePackages();

    return (
        <Stack sx={{ mt: 3, border: "1px solid #ccc", p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
                Select Package Features
            </Typography>
            <Divider sx={{ borderStyle: "dashed" }} />
            <Box sx={{ pt: 2 }}>
                {isFetched &&
                    data?.map((feature, index) => {
                        const [checked, setChecked] = React.useState(true);

                        const exists =
                            packageData?.features?.filter(
                                (f) => f.id === feature.id
                            ).length > 0;

                        const handleChange = async (event) => {
                            const res = await assignFeature(
                                packageData.id,
                                feature.id
                            );
                            console.log(res);
                        };

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
                                    onChange={handleChange}
                                    size="small"
                                />
                            </Box>
                        );
                    })}
            </Box>
        </Stack>
    );
}

export default SelectPackageFeatures;
