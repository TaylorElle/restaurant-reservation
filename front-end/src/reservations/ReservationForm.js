import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { postReservation } from "../utils/api";
import ReservationErrors from "./ReservationError";
import { today } from "../utils/date-time.js";

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

  const [reservation, setReservation] = useState({ ...initialState });
  const [error, setError] = useState(null);

  function changeHandler({ target: { name, value } }) {
    if (name === "people" && typeof value === "string") {
      value = +value;
    }
    setReservation((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    console.log(reservation);
  }

  // function changeHandlerNum({ target: { name, value } }) {
  //   if (name === "people" && typeof value === "string") {
  //     value = +value;
  //   }
  //   setReservation((prevState) => ({
  //     ...prevState,
  //     [name]: value,
  //   }));
  // }

  function validate(reservation) {
    const errors = [];
    console.log(errors);

    function isFutureDate({ reservation_date, reservation_time }) {
      //reservation date
      const reservationDateTime = new Date(
        `${reservation_date}T${reservation_time}`
      );
      console.log("reservationDateTime line 50", reservationDateTime);
      //date right now = new Date()
      console.log(
        reservationDateTime,
        "---",
        new Date(),
        "-------->>>today",
        today()
      );
      console.log("date now()", Date.now());
      //if reservation date is less than date right now,
      if (reservationDateTime < new Date()) {
        errors.push(new Error("Reservation must be set in the future"));
      }
    }

    function isTuesday({ reservation_date }) {
      const day = new Date(reservation_date).getUTCDay();
      if (day === 2) {
        errors.push(new Error("No reservations available on Tuesday."));
      }
    }

    function isOpenHours(reservation) {
      const reservationDateTime = new Date(
        `${reservation.reservation_date}T${reservation.reservation_time}:00.000`
      );

      // //should push an error if ANY time is before 10:30am
      if (
        reservationDateTime.getHours() < 10 ||
        (reservationDateTime.getHours() === 10 &&
          reservationDateTime.getMinutes() < 30)
      ) {
        errors.push(new Error("Restaurant is only open after 10:30 am"));
      }
      //should push an error if ANY time is AFTER 9:30pm but before 10:30
      else if (
        reservationDateTime.getHours() === 21 &&
        reservationDateTime.getMinutes() > 30
      ) {
        errors.push(
          new Error("Reservation must be made at least 1 hour before closing")
        );
      }
      // should push an error if ANY time is AFTER 10:30pm
      else if (
        reservationDateTime.getHours() >= 22 ||
        (reservationDateTime.getHours() === 22 &&
          reservationDateTime.getMinutes() >= 30)
      ) {
        errors.push(new Error("Restaurant closes at 10:30pm"));
      }
    }

    isFutureDate(reservation);
    console.log(isFutureDate(reservation));
    isTuesday(reservation);
    console.log(isTuesday(reservation));
    isOpenHours(reservation);
    console.log(isOpenHours(reservation));

    return errors;
  }

  //submit handler
  function submitHandler(event) {
    const abortController = new window.AbortController();
    event.preventDefault();
    const reservationError = validate(reservation);
    console.log(reservationError);
    // do not send POST request if there is an error message
    if (reservationError.length) {
      return setError(reservationError);
    }
    // POST request (new reservation)
    postReservation(reservation, abortController.signal)
      .then(
        () => history.push(`/dashboard?date=${reservation.reservation_date}`)

        // const res_date =
        //   createdReservation.reservation_date.match(/\d{4}-\d{2}-\d{2}/)[0];
        // history.push(`/dashboard?date=` + res_date);
      )
      .catch(setError);
    return () => abortController.abort();
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
              type="text"
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
            type="text"
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
            type="text"
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
            onChange={changeHandler}
            value={reservation.people}
            type="number"
            min="1"
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
