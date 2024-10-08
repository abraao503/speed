import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";

import TicketsManager from "../../components/TicketsManagerTabs/";
import Ticket from "../../components/Ticket/";
import logo from "../../assets/logo.png"; //PLW DESIGN LOGO//
import logo_w from "../../assets/logo_w.png";
import { i18n } from "../../translate/i18n";
import { useTheme } from "@material-ui/core"
import { useState, useRef } from "react";

const useStyles = makeStyles(theme => ({
	chatContainer: {
		flex: 1,
		// backgroundColor: "#eee",
		padding: theme.spacing(1), //Aqui ele ajusta espaço na tela de ticket
		height: `calc(100% - 48px)`,
		overflowY: "hidden",
	},

	chatPapper: {
		// backgroundColor: "red",
		display: "flex",
		height: "100%",
	},

	contactsWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
		overflowY: "hidden",
	},
	messagesWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
	},
	welcomeMsg: {
		backgroundColor: theme.palette.boxticket, //DARK MODE PLW DESIGN//
		display: "flex",
		justifyContent: "space-evenly",
		alignItems: "center",
		height: "100%",
		textAlign: "center",
	},
}));

const TicketsCustom = () => {
	const classes = useStyles();
	const { ticketId } = useParams();
	const theme = useTheme(); 
	const initialLogo = theme.mode === 'light' ? logo : logo_w 
	const [logoImg, setLogoImg] = useState(initialLogo)

	const isInitialMount = useRef(true);

	useEffect(() => {
	  if (isInitialMount.current) {
		isInitialMount.current = false;
	  } else {
		setLogoImg(logoImg === logo ? logo_w : logo)
	  }
	}, [theme.mode]);

	return (
		<div className={classes.chatContainer}>
			<div className={classes.chatPapper}>
				<Grid container spacing={0}>
					<Grid item xs={4} className={classes.contactsWrapper}>
						<TicketsManager />
					</Grid>
					<Grid item xs={8} className={classes.messagesWrapper}>
						{ticketId ? (
							<>
								<Ticket />
							</>
						) : (
							<Paper square variant="outlined" className={classes.welcomeMsg}>
							{/* PLW DESIGN LOGO */}
							<div>
							<center><img style={{ margin: "0 auto", width: "70%" }} src={logoImg} alt="logologin" /></center>
							</div>
							{/* PLW DESIGN LOGO */}
							{/*<span>{i18n.t("chat.noTicketMessage")}</span>*/}
							</Paper>
						)}
					</Grid>
				</Grid>
			</div>
		</div>
	);
};

export default TicketsCustom;
