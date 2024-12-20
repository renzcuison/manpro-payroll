import { ExpandLess, ExpandMore, StarBorder } from "@mui/icons-material";
import {
    Collapse,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import React, { useState } from "react";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import { Link } from "react-router-dom";

function SubMenuCollapse({ item }) {
    const [open, setOpen] = useState(false);

    const handleClick = () => {
        setOpen(!open);
    };

    return (
        <>
            <ListItemButton onClick={handleClick}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
                {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    {item.subMenu.map((menu) => {
                        return (
                            <Link
                                to={menu.url}
                                key={menu.title}
                                className="text-muted"
                            >
                                <ListItemButton sx={{ pl: 6, pb: 0 }}>
                                    {/* <ListItemIcon>
                                    <StarBorder />
                                </ListItemIcon> */}
                                    <ListItemText
                                        primary={menu.title}
                                        style={{ padding: 0 }}
                                    />
                                </ListItemButton>
                            </Link>
                        );
                    })}
                </List>
            </Collapse>
        </>
    );
}

export default SubMenuCollapse;
