import { File, ImageIcon } from "lucide-react";
import { PiMicrosoftWordLogo, PiMicrosoftExcelLogo } from "react-icons/pi";
import { FaRegFilePdf } from "react-icons/fa";

/**
 * Renders an icon based on the provided MIME type.
 *
 * @param {string} mimeType - The MIME type of the file.
 * @param {number} [size=24] - The size of the icon.
 * @returns {JSX.Element} The rendered icon.
 */
export const renderIcon = (mimeType, size = 24) => {
    const iconMap = {
        "image/jpeg": <ImageIcon size={size} />,
        "image/png": <ImageIcon size={size} />,
        "application/pdf": <FaRegFilePdf size={size} color="#FF0000" />,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            <PiMicrosoftWordLogo size={size} color="#2B579A" />,
        "application/vnd.ms-excel": (
            <PiMicrosoftExcelLogo color="#217346" size={size} />
        ),
        "application/msword": (
            <PiMicrosoftWordLogo size={size} color="#2B579A" />
        ),
    };

    return (
        iconMap[mimeType] || <PiMicrosoftWordLogo size={size} color="#2B579A" />
    );
};

export const superAdminSidebarMenu = [
    {
        title: "Dashboard",
        icon: <ImageIcon size={24} />,
        path: "/dashboard",
    },
    // {
    //     title: "Subscriptions",
    //     icon: <ImageIcon size={24} />,
    //     path: "/super-admin/subscriptions",
    // },
    {
        title: "Clients",
        icon: <ImageIcon size={24} />,
        path: "/super-admin/clients",
    },
    {
        title: "All users",
        icon: <ImageIcon size={24} />,
        path: "/super-admin/users",
    },
    {
        title: "Packages",
        icon: <ImageIcon size={24} />,
        path: "/super-admin/packages",
    },
];
