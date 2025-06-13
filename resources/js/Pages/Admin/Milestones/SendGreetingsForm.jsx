import React, { useState } from "react";
import {
    Box,
    Button,
    IconButton,
    TextField,
    Typography,
    Stack,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useMileStone } from "./hook/useMilestones";
import EmojiPicker from "emoji-picker-react";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import ImageIcon from "@mui/icons-material/Image";
import GifIcon from "@mui/icons-material/Gif";

function SendGreetingsForm({ milestoneId, refetch }) {
    const { register, handleSubmit, setValue, watch } = useForm();
    const { sendGreetings } = useMileStone(milestoneId);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedGif, setSelectedGif] = useState(null); // Placeholder

    const comment = watch("comment", "");

    const onEmojiClick = (emojiData) => {
        const currentComment = watch("comment") || "";
        setValue("comment", `${currentComment}${emojiData.emoji}`, {
            shouldDirty: true,
        });
    };

    const handleImageChange = (e) => {
        if (e.target.files.length > 0) {
            setSelectedImage(e.target.files[0]);
        }
    };
    console.log(selectedImage);

    const onSubmit = (data) => {
        const formData = new FormData();
        formData.append("comment", data.comment);
        if (selectedImage) formData.append("image", selectedImage);
        if (selectedGif) formData.append("gif", selectedGif);

        sendGreetings(formData)
            .then((res) => {
                console.log(res);
                refetch();
                setValue("comment", "");
                showEmojiPicker(false);
            })
            .catch((err) => console.error(err));
    };

    console.log(comment);

    return (
        <Box>
            <form onSubmit={handleSubmit(onSubmit)}>
                <TextField
                    {...register("comment")}
                    label="Write a greeting..."
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                />

                <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                    <IconButton
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                        <InsertEmoticonIcon />
                    </IconButton>

                    {/* <IconButton component="label">
                        <ImageIcon />
                        <input
                            hidden
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </IconButton>

                    <IconButton
                        onClick={() => alert("GIF selector to be implemented")}
                    >
                        <GifIcon />
                    </IconButton> */}
                </Stack>

                {showEmojiPicker && (
                    <Box mt={1}>
                        <EmojiPicker onEmojiClick={onEmojiClick} />
                    </Box>
                )}

                {selectedImage && (
                    <Typography variant="body2" mt={1}>
                        Attached image: {selectedImage.name}
                    </Typography>
                )}

                <Button variant="contained" type="submit" sx={{ mt: 2 }}>
                    Send Greetings
                </Button>
            </form>
        </Box>
    );
}

export default SendGreetingsForm;
