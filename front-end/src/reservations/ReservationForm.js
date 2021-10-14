import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { postReservation } from "../utils/api";
import ReservationErrors from "./ReservationError";

function ReservationForm() {
  const history = useHistory();

  const initialState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 0,
  };

  const [reservation, setReservation] = useState(initialState);
  const [error, setError] = useState(null);

  function changeHandler({ target: { name, value } }) {
    setReservation((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  function changeHandlerNum({ target: { name, value } }) {
    setReservation((prevState) => ({
      ...prevState,
      [name]: Number(value),
    }));
  }

  function validate(reservation) {
    const errors = [];

    function isFutureDate({ reservation_date, reservation_time }) {
      const dt = new Date(`${reservation_date}T${reservation_time}`);
      if (dt < new Date()) {
        errors.push(new Error("Reservation must be set in the future"));
      }
    }

    function isTuesday({ reservation_date }) {
      const day = new Date(reservation_date).getUTCDay();
      if (day === 2) {
        errors.push(new Error("No reservations available on Tuesday."));
      }
    }

    isFutureDate(reservation);
    isTuesday(reservation);

    return errors;
  }

  //submit handler
  function submitHandler(event) {
    event.preventDefault();
    const reservationError = validate(reservation);
    // do not send POST request if there is an error message
    if (reservationError.length) {
      return setError(reservationError);
    }

    const abortController = new window.AbortController();
    // POST request (new reservation)

    postReservation(reservation)
      .then((createdReservation) => {
        const res_date =
          createdReservation.reservation_date.match(/\d{4}-\d{2}-\d{2}/)[0];
        history.push(`/dashboard?date=` + res_date);
      })
      .catch(setError);
  }

  return (
    <div>
      <form onSubmit={submitHandler}>
        <ReservationErrors errors={error} />

        <div className="form-group row">
          <label htmlFor="first_name">
            First Name
            <input
              id="first_name"
              name="first_name"
              onChange={changeHandler}
              value={reservation.first_name}
              placeholder="John"
              required="required"
              className="form-control"
            />
          </label>
        </div>

        <div className="form-group row">
          <label htmlFor="last_name">Last Name</label>
          <input
            id="last_name"
            name="last_name"
            onChange={changeHandler}
            value={reservation.last_name}
            placeholder="Smith"
            required="required"
            className="form-control"
          ></input>
        </div>

        <div className="form-group row">
          <label htmlFor="mobile_number">Phone Number</label>
          <input
            id="mobile_number"
            type="tel"
            name="mobile_number"
            onChange={changeHandler}
            value={reservation.mobile_number}
            placeholder="xxx-xxx-xxxx or xxx-xxxx"
            pattern="([0-9]{3}-)?[0-9]{3}-[0-9]{4}"
            required="required"
            className="form-control"
          ></input>
        </div>

        <div className="form-group row">
          <label htmlFor="reservation_date">Reservation Date</label>
          <input
            id="reservation_date"
            name="reservation_date"
            onChange={changeHandler}
            value={reservation.reservation_date}
            type="date"
            placeholder="YYYY-MM-DD"
            pattern="\d{4}-\d{2}-\d{2}"
            required="required"
            className="form-control"
          ></input>
        </div>

        <div className="form-group row">
          <label htmlFor="reservation_time">Reservation Time</label>
          <input
            id="reservation_time"
            name="reservation_time"
            onChange={changeHandler}
            value={reservation.reservation_time}
            type="time"
            placeholder="HH:MM"
            pattern="[0-9]{2}:[0-9]{2}"
            required="required"
            className="form-control"
          />
        </div>

        <div className="form-group row">
          <label htmlFor="people">Party Size</label>
          <input
            id="people"
            name="people"
            onChange={changeHandlerNum}
            value={reservation.people}
            type="number"
            min={1}
            required="required"
            className="form-control"
          ></input>
        </div>

        <button type="submit" className="btn btn-primary">
          Submit
        </button>
        {/* //TODO: allow someone to click cancel without anything in the form  */}
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => history.goBack()}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default ReservationForm;
