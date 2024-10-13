import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress, Button } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  button: {
    marginBottom: "10px",
  },
  buttonProgress: {
    color: "white",
  },
}));

const ButtonWithSpinner = ({ loading, children, ...rest }) => {
  const classes = useStyles();

  return (
    <Button className={classes.button} disabled={loading} {...rest}>
      {loading ? (
        <CircularProgress size={18} className={classes.buttonProgress} />
      ) : (
        children
      )}
    </Button>
  );
};

export default ButtonWithSpinner;
