import { File, ImageIcon } from "lucide-react";
import { PiMicrosoftWordLogo, PiMicrosoftExcelLogo } from "react-icons/pi";
import { FaRegFilePdf } from "react-icons/fa";

export const renderIcon = (mimeType, size = 24) => {
    switch (mimeType) {
        case "image/jpeg":
            return <ImageIcon size={size} />;
        case "image/png":
            return <ImageIcon size={size} />;
        case "application/pdf":
            return <FaRegFilePdf size={size} color="#FF0000" />;
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return <PiMicrosoftExcelLogo color="#217346" size={size} />;
        case "application/vnd.ms-excel":
            return <PiMicrosoftExcelLogo color="#217346" size={size} />;
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return <File size={size} />;
        case "application/msword":
            return <FaRegFilePdf size={size} color="#FF0000" />;
        default:
            return <PiMicrosoftWordLogo size={size} color="#2B579A" />;
    }
};
