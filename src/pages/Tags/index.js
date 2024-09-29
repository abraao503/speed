import React, {
  useState,
  useEffect,
  useReducer,
  useCallback,
  useContext,
} from "react";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import DragHandleIcon from "@material-ui/icons/DragHandle";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import TagModal from "../../components/TagModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Chip } from "@material-ui/core";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useTheme } from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const Tags = () => {
  const classes = useStyles();
  const theme = useTheme();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [tags, setTags] = useState([]);

  const [tagModalOpen, setTagModalOpen] = useState(false);

  const fetchTags = useCallback(async () => {
    try {
      const { data } = await api.get("/tags/", {
        params: { searchParam, pageNumber },
      });
      setTags(data.tags);
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  }, [searchParam, pageNumber]);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    setTags([]);
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchTags();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, fetchTags]);

  useEffect(() => {
    const socket = socketManager.getSocket(user.companyId);

    socket.on("user", (data) => {
      if (data.action === "update" || data.action === "create") {
        setTags(data.tags);
      }

      if (data.action === "delete") {
        setTags((prevState) =>
          prevState.filter((tag) => tag.id !== data.tagId)
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager, user]);

  const handleOpenTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(true);
  };

  const handleCloseTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setTagModalOpen(true);
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await api.delete(`/tags/${tagId}`);
      toast.success(i18n.t("tags.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingTag(null);
    setSearchParam("");
    setPageNumber(1);

    setTags((prevState) => prevState.filter((tag) => tag.id !== tagId));
    setPageNumber(1);
    await fetchTags();
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result.map((tag, index) => {
      return { ...tag, order: index + 1 };
    });
  };

  const onDragEnd = async (result) => {
    if (!result.destination) {
      return;
    }

    const items = reorder(tags, result.source.index, result.destination.index);

    setTags(items);

    await api.put("/tags/reorder", {
      tags: items.map((tag) => {
        return { id: tag.id, order: tag.order };
      }),
    });
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={deletingTag && `${i18n.t("tags.confirmationModal.deleteTitle")}`}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteTag(deletingTag.id)}
      >
        {i18n.t("tags.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <TagModal
        open={tagModalOpen}
        onClose={handleCloseTagModal}
        reload={fetchTags}
        aria-labelledby="form-dialog-title"
        currentTag={selectedTag}
        totalTags={tags.length}
      />
      <MainHeader>
        <Title>{i18n.t("tags.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenTagModal}
          >
            {i18n.t("tags.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <TextField
        placeholder={i18n.t("contacts.searchPlaceholder")}
        type="search"
        value={searchParam}
        style={{ margin: theme.spacing(1) }}
        onChange={handleSearch}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon style={{ color: "gray" }} />
            </InputAdornment>
          ),
        }}
      />
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <DragDropContext onDragEnd={onDragEnd}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center">#</TableCell>
                <TableCell align="center">
                  {i18n.t("tags.table.name")}
                </TableCell>
                <TableCell align="center">
                  {i18n.t("tags.table.tickets")}
                </TableCell>
                <TableCell align="center">
                  {i18n.t("tags.table.actions")}
                </TableCell>
              </TableRow>
            </TableHead>
            <Droppable droppableId="droppable">
              {(provider) => (
                <TableBody {...provider.droppableProps} ref={provider.innerRef}>
                  {tags.map((tag, index) => (
                    <Draggable
                      key={tag.id}
                      draggableId={tag?.id?.toString() || ""}
                      index={index}
                    >
                      {(provided, snapshot) =>
                        snapshot.isDragging ? (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              backgroundColor: snapshot.isDragging
                                ? theme.palette.action.selected
                                : "inherit",
                            }}
                          >
                            <Table size="small">
                              <TableHead style={{ visibility: "collapse" }}>
                                <TableRow>
                                  <TableCell align="center">#</TableCell>
                                  <TableCell align="center">
                                    {i18n.t("tags.table.name")}
                                  </TableCell>
                                  <TableCell align="center">
                                    {i18n.t("tags.table.tickets")}
                                  </TableCell>
                                  <TableCell align="center">
                                    {i18n.t("tags.table.actions")}
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                <TableRow>
                                  <TableCell align="center">
                                    <DragHandleIcon />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip
                                      variant="outlined"
                                      style={{
                                        backgroundColor: tag.color,
                                        textShadow: "1px 1px 1px #000",
                                        color: "white",
                                      }}
                                      label={tag.name}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    {tag.ticketsCount}
                                  </TableCell>
                                  <TableCell align="center">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEditTag(tag)}
                                    >
                                      <EditIcon />
                                    </IconButton>

                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        setConfirmModalOpen(true);
                                        setDeletingTag(tag);
                                      }}
                                    >
                                      <DeleteOutlineIcon />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              ...provided.draggableProps.style,
                              backgroundColor: snapshot.isDragging
                                ? theme.palette.action.selected
                                : "inherit",
                            }}
                          >
                            <TableCell
                              align="center"
                              {...provided.dragHandleProps}
                            >
                              <DragHandleIcon />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                variant="outlined"
                                style={{
                                  backgroundColor: tag.color,
                                  textShadow: "1px 1px 1px #000",
                                  color: "white",
                                }}
                                label={tag.name}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              {tag.ticketsCount}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={() => handleEditTag(tag)}
                              >
                                <EditIcon />
                              </IconButton>

                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  setConfirmModalOpen(true);
                                  setDeletingTag(tag);
                                }}
                              >
                                <DeleteOutlineIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        )
                      }
                    </Draggable>
                  ))}
                  {loading && <TableRowSkeleton columns={4} />}
                </TableBody>
              )}
            </Droppable>
          </Table>
        </DragDropContext>
      </Paper>
    </MainContainer>
  );
};

export default Tags;
