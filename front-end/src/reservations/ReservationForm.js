import React, { useState } from "react";
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

  const [reservation, setReservation] = useState({ ...initialState });
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
      const reservationDateTime = new Date(
        `${reservation_date}T${reservation_time}`
      );
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
        errors.push(new Error("Restaurant is only open after 10:30am"));
      }
      //should push an error if ANY time is AFTER 9:30pm but before 10:30
      else if (
        reservationDateTime.getHours() === 21 &&
        reservationDateTime.getMinutes() > 30
      ) {
        errors.push(
          new Error(
            "Reservation must be made at least 1 hour before closing time (10:30pm)"
          )
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
    isTuesday(reservation);
    isOpenHours(reservation);

    if (errors.length) {
      setError(errors);
      return false;
    }
    return true;
  }

  //submit handler
  function submitHandler(event) {
    const abortController = new window.AbortController();
    event.preventDefault();
    event.preventPropogation();
    setError(null);
    const itValidated = validate(reservation);

    if (itValidated) {
      // POST request (new reservation)
      postReservation(reservation, abortController.signal)
        .then(() =>
          history.push(`/dashboard?date=${reservation.reservation_date}`)
        )
        .catch(setError);
      return () => abortController.abort();
    }
  }

  //display errors if there's state
  return (
    <div>
      <form onSubmit={submitHandler}>
        <div>
          <ReservationErrors errors={error} />
        </div>
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
              required={true}
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
            required={true}
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
            required={true}
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
            required={true}
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
            required={true}
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
            required={true}
            className="form-control"
          ></input>
        </div>

        <button type="submit" className="btn btn-primary">
          Submit
        </button>
        {/* allow someone to click cancel without anything in the form  */}
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
