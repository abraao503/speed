import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import { Badge, Collapse, List } from "@material-ui/core";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";
import { SocketContext } from "../context/Socket/SocketContext";
import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";
import { makeStyles } from "@material-ui/core/styles";
import usePlans from "../hooks/usePlans";
import Typography from "@material-ui/core/Typography";
import useVersion from "../hooks/useVersion";
import { Columns, Grid, Zap, List as ListFeather, Users, Calendar, Tag, MessageSquare, HelpCircle, Send, ChevronDown, ChevronUp, Settings, Info, Globe, GitBranch, Wifi, Paperclip, GitPullRequest, Code, DollarSign } from "react-feather";

const useStyles = makeStyles((theme) => ({
  ListSubheader: {
    height: 26,
    marginTop: "-15px",
    marginBottom: "-10px",
  },
}));

function ListItemLink(props) {
  const { icon, primary, to, className } = props;

  const renderLink = React.useMemo(
    () =>     
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem button dense component={renderLink} className={className}>
        {icon ? <ListItemIcon style={{minWidth: "40px"}}>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

const MainListItems = (props) => {
  const classes = useStyles();
  const { drawerClose, collapsed } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, handleLogout } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const history = useHistory();
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);

  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const { getPlanCompany } = usePlans();

  const [version, setVersion] = useState(false);

  const { getVersion } = useVersion();

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    async function fetchVersion() {
      const _version = await getVersion();
      setVersion(_version.version);
    }
    fetchVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);

      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowKanban(planConfigs.plan.useKanban);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-chat`, (data) => {
      if (data.action === "new-message") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
      if (data.action === "update") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  useEffect(() => {
    if (localStorage.getItem("cshow")) {
      setShowCampaigns(true);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  const handleClickLogout = () => {
    //handleCloseMenu();
    handleLogout();
  };

  return (
    <div>
      <Can
        role={user.profile}
        perform="dashboard:view"
        yes={() => (
          <div onClick={drawerClose}>
            <ListItemLink
              to="/"
              primary="Dashboard"
              icon={<Grid size={22} />}
            />
          </div>
        )}
      />

      <div onClick={drawerClose}>
        <ListItemLink
          to="/tickets"
          primary={i18n.t("mainDrawer.listItems.tickets")}
          icon={<WhatsAppIcon />}
        />
      </div>

      {showKanban && (
        <div onClick={drawerClose}>
          <ListItemLink
            to="/kanban"
            primary={i18n.t("Kanban")}
            icon={<Columns size={22} />}
          />
        </div>
      )}

      <div onClick={drawerClose}>
        <ListItemLink
          to="/quick-messages"
          primary={i18n.t("mainDrawer.listItems.quickMessages")}
          icon={<Zap size={22} />}
        />
      </div>

      <div onClick={drawerClose}>
        <ListItemLink
          to="/todolist"
          primary={i18n.t("Tarefas")}
          icon={<ListFeather size={22} />}
        />
      </div>

      <div onClick={drawerClose}>
        <ListItemLink
          to="/contacts"
          primary={i18n.t("mainDrawer.listItems.contacts")}
          icon={<Users size={22} />}
        />
      </div>

      <div onClick={drawerClose}>
        <ListItemLink
          to="/schedules"
          primary={i18n.t("mainDrawer.listItems.schedules")}
          icon={<Calendar size={22} />}
        />
      </div>

      <div onClick={drawerClose}>
        <ListItemLink
          to="/tags"
          primary={i18n.t("mainDrawer.listItems.tags")}
          icon={<Tag size={22} />}
        />
      </div>

      <div onClick={drawerClose}>
        <ListItemLink
          to="/chats"
          primary={i18n.t("mainDrawer.listItems.chats")}
          icon={
            <Badge color="secondary" variant="dot" invisible={invisible}>
              <MessageSquare size={22} />
            </Badge>
          }
        />
      </div>

      <div onClick={drawerClose}>
        <ListItemLink
          to="/helps"
          primary={i18n.t("mainDrawer.listItems.helps")}
          icon={<HelpCircle size={22} />}
        />
      </div>

      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <Divider style={{margin: "5px 0"}} />
            <ListSubheader
              hidden={collapsed}
              style={{
                position: "relative",
                fontSize: "17px",
                textAlign: "left",
                paddingLeft: 20,
              }}
              inset
              color="inherit"
            >
              {i18n.t("mainDrawer.listItems.administration")}
            </ListSubheader>

            {showCampaigns && (
              <>
                <ListItem
                  dense
                  button
                  onClick={() => setOpenCampaignSubmenu((prev) => !prev)}
                >
                  <ListItemIcon style={{minWidth: "40px"}}>
                    <Send size={22} />
                  </ListItemIcon>
                  <ListItemText
                    primary={i18n.t("mainDrawer.listItems.campaigns")}
                    primaryTypographyProps={{style: {fontSize: "14px"}}}
                  />
                  {openCampaignSubmenu ? (
                    <ChevronUp size={22} />
                  ) : (
                    <ChevronDown size={22} />
                  )}
                </ListItem>
                <Collapse
                  style={{ paddingLeft: 10 }}
                  in={openCampaignSubmenu}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    <ListItem
                      onClick={() => {
                        drawerClose();
                        history.push("/campaigns");
                      }}
                      button
                      dense
                    >
                      <ListItemIcon style={{minWidth: "40px"}}>
                        <ListFeather size={22} />
                      </ListItemIcon>
                      <ListItemText primary="Listagem" primaryTypographyProps={{style: {fontSize: "14px"}}} />
                    </ListItem>
                    <ListItem
                      onClick={() => {
                        drawerClose();
                        history.push("/contact-lists");
                      }}
                      button
                      dense
                    >
                      <ListItemIcon style={{minWidth: "40px"}}>
                        <Users size={22} />
                      </ListItemIcon>
                      <ListItemText primary="Listas de Contatos" primaryTypographyProps={{style: {fontSize: "14px"}}} />
                    </ListItem>
                    <ListItem
                      onClick={() => {
                        drawerClose();
                        history.push("/campaigns-config");
                      }}
                      button
                    >
                      <ListItemIcon style={{minWidth: "40px"}}>
                        <Settings size={22} />
                      </ListItemIcon>
                      <ListItemText primary="Configurações" primaryTypographyProps={{style: {fontSize: "14px"}}} />
                    </ListItem>
                  </List>
                </Collapse>
              </>
            )}
            {user.super && (
              <div onClick={drawerClose}>
                <ListItemLink
                  to="/announcements"
                  primary={i18n.t("mainDrawer.listItems.annoucements")}
                  icon={<Info size={22} />}
                />
              </div>
            )}
            {showOpenAi && (
              <div onClick={drawerClose}>
                <ListItemLink
                  to="/prompts"
                  primary={i18n.t("mainDrawer.listItems.prompts")}
                  icon={<Globe size={22} />}
                />
              </div>
            )}

            {showIntegrations && (
              <div onClick={drawerClose}>
                <ListItemLink
                  to="/queue-integration"
                  primary={i18n.t("mainDrawer.listItems.queueIntegration")}
                  icon={<GitBranch size={22} />}
                />
              </div>
            )}
            <div onClick={drawerClose}>
              <ListItemLink
                to="/connections"
                primary={i18n.t("mainDrawer.listItems.connections")}
                icon={
                  <Badge
                    badgeContent={connectionWarning ? "!" : 0}
                    color="error"
                  >
                    <Wifi size={22} />
                  </Badge>
                }
              />
            </div>

            {/* <div onClick={drawerClose}>
              <ListItemLink
                to="/files"
                primary={i18n.t("mainDrawer.listItems.files")}
                icon={<Paperclip size={22} />}
              />
            </div> */}

            <div onClick={drawerClose}>
              <ListItemLink
                to="/queues"
                primary={i18n.t("mainDrawer.listItems.queues")}
                icon={<GitPullRequest size={22} />}
              />
            </div>

            <div onClick={drawerClose}>
              <ListItemLink
                to="/users"
                primary={i18n.t("mainDrawer.listItems.users")}
                icon={<Users size={22} />}
              />
            </div>
            {showExternalApi && (
              <div onClick={drawerClose}>
                <ListItemLink
                  to="/messages-api"
                  primary={i18n.t("mainDrawer.listItems.messagesAPI")}
                  icon={<Code size={22} />}
                />
              </div>
            )}

            {/* <div onClick={drawerClose}>
              <ListItemLink
                to="/financeiro"
                primary={i18n.t("mainDrawer.listItems.financeiro")}
                icon={<DollarSign size={22} />}
              />
            </div> */}

            <div onClick={drawerClose}>
              <ListItemLink
                to="/settings"
                primary={i18n.t("mainDrawer.listItems.settings")}
                icon={<Settings size={22} />}
              />
            </div>

            {!collapsed && (
              <React.Fragment>
                <Divider style={{margin: "5px 0"}}  />
                {/* 
              // IMAGEM NO MENU
              <Hidden only={['sm', 'xs']}>
                <img style={{ width: "100%", padding: "10px" }} src={logo} alt="image" />            
              </Hidden> 
              */}
                <Typography
                  style={{
                    fontSize: "12px",
                    padding: "10px",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  {`6.0.0`}
                </Typography>
              </React.Fragment>
            )}
          </>
        )}
      />
    </div>
  );
};

export default MainListItems;
