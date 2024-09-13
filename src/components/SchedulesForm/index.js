import React, { useState, useEffect } from "react";
import { makeStyles, TextField, Grid } from "@material-ui/core";
import { Formik, Form, FastField, FieldArray } from "formik";
import { isArray } from "lodash";
import NumberFormat from "react-number-format";
import ButtonWithSpinner from "../ButtonWithSpinner";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  fullWidth: {
    width: "100%",
  },
  textfield: {
    width: "100%",
  },
  row: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  control: {
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  buttonContainer: {
    textAlign: "right",
    padding: theme.spacing(1),
  },
  weekDay: {
    fontFamily: "Inter",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 6,
    marginBottom: 4,
    color: "#1E2b66",
  },
  initialHour: {
    marginRight: 10,
    width: "100%",
  },
  endHour: {
    width: "100%",
  },
}));

function SchedulesForm(props) {
  const { initialValues, onSubmit, loading, labelSaveButton } = props;
  const classes = useStyles();

  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    if (isArray(initialValues) && initialValues.length > 0) {
      setSchedules(initialValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  const handleSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Formik
      enableReinitialize
      className={classes.fullWidth}
      initialValues={{ schedules }}
      onSubmit={({ schedules }) =>
        setTimeout(() => {
          handleSubmit(schedules);
        }, 500)
      }
    >
      {({ values }) => (
        <Form className={classes.fullWidth}>
          <Grid spacing={1} container>
            {values.schedules.map((item, index) => {
              return (
                <Grid item key={index}>
                  <p className={classes.weekDay}>{item.weekday}</p>
                  <FastField name={`schedules[${index}].startTime`}>
                    {({ field }) => (
                      <NumberFormat
                        label="Hora de Inicial"
                        {...field}
                        variant="outlined"
                        margin="dense"
                        customInput={TextField}
                        format="##:##"
                        className={classes.initialHour}
                      />
                    )}
                  </FastField>
                  <FastField name={`schedules[${index}].endTime`}>
                    {({ field }) => (
                      <NumberFormat
                        label="Hora de Final"
                        {...field}
                        variant="outlined"
                        margin="dense"
                        customInput={TextField}
                        format="##:##"
                        className={classes.endHour}
                      />
                    )}
                  </FastField>
                </Grid>
              );
            })}
          </Grid>
          <div
            style={{ textAlign: "center", marginTop: "2%" }}
            className={classes.buttonContainer}
          >
            <ButtonWithSpinner
              loading={loading}
              type="submit"
              color="primary"
              variant="contained"
            >
              {labelSaveButton ?? "Salvar"}
            </ButtonWithSpinner>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default SchedulesForm;
