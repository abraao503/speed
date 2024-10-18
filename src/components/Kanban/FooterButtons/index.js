import { Badge, IconButton, makeStyles, Tooltip } from "@material-ui/core";
import React, { useState } from "react";
import { BookOpen, Calendar, MessageCircle } from "react-feather";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import ScheduleModal from "../../ScheduleModal";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ContactNotesDialog from "../../ContactNotesDialog";

const useStyles = makeStyles(theme => ({
    container: {
        display: "flex",
        alignItems: "center"
    }
  }));

export default function FooterButtons({ticket, fetchTickets}) {
    const classes = useStyles();
    const color = "#4d4d4d"
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [contactNotesModal, setContactNotesModal] = useState(false)
    const history = useHistory();

    const handleOpenScheduleModal = () => {
        setScheduleModalOpen(true);
    };

    const handleOpenContactNotesModal = () => {
        setContactNotesModal(true)
    }

    const handleCloseContactNotesModal = () => {
        setContactNotesModal(false)
        fetchTickets()
    }

    const handleCloseScheduleModal = () => {
        setScheduleModalOpen(false);
    };

    const handleSelectTicket = () => {
        history.push(`/tickets/${ticket.uuid}`);
    };

    return (
        <>
            <ContactNotesDialog modalOpen={contactNotesModal} onClose={handleCloseContactNotesModal} ticket={ticket} />
            <div className={classes.container}>
                <Tooltip title="Anotações">
                <IconButton onClick={handleOpenContactNotesModal} size="small">
                    <Badge overlap="rectangular" badgeContent={ticket.ticketNotes.length} color="primary" >
						<BookOpen size={20} />
					</Badge>
                </IconButton>
                </Tooltip>
                <Tooltip title="Criar agendamento">
                    <IconButton onClick={handleOpenScheduleModal} size="small">
                        <Calendar color={color} size={20} />
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
        </>
    )
}