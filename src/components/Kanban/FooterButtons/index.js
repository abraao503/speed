import { IconButton, makeStyles, Tooltip } from "@material-ui/core";
import React, { useState } from "react";
import { BookOpen, Calendar } from "react-feather";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import ScheduleModal from "../../ScheduleModal";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const useStyles = makeStyles(theme => ({
    container: {
        display: "flex",
        alignItems: "center"
    }
  }));

export default function FooterButtons({ticket}) {
    const classes = useStyles();
    const color = "#4d4d4d"
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const history = useHistory();

    const handleOpenScheduleModal = () => {
        setScheduleModalOpen(true);
    };

    const handleCloseScheduleModal = () => {
        setScheduleModalOpen(false);
    };

    const handleSelectTicket = () => {
        history.push(`/tickets/${ticket.uuid}`);
    };

    return (
        <div className={classes.container}>
            <Tooltip title="Anotações">
            <IconButton size="small">
                <BookOpen color={color} size={17} />
            </IconButton>
            </Tooltip>
            <Tooltip title="Criar agendamento">
                <IconButton onClick={handleOpenScheduleModal} size="small">
                    <Calendar color={color} size={17} />
                </IconButton>
            </Tooltip>
            <Tooltip title="Ir para conversa">   
                <IconButton onClick={handleSelectTicket} size="small">
                    <WhatsAppIcon style={{color: color}} fontSize="small" />
                </IconButton>
            </Tooltip>

            <ScheduleModal
                open={scheduleModalOpen}
                onClose={handleCloseScheduleModal}
                aria-labelledby="form-dialog-title"
                contactId={ticket.contact.id}
            />
        </div>
    )
}