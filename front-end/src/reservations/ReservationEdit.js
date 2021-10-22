import React from "react";
import { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { readReservation, updateReservation } from "../utils/api";
import ReservationErrors from "./ReservationError";
// import { today } from "../utils/date-time.js";

function ReservationEdit() {
  const history = useHistory();
  const abortController = new window.AbortController();

  const { reservation_id } = useParams();

  const initialState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 0,
  };
  const [error, setError] = useState(null);
  const [reservation, setReservation] = useState(initialState);

  useEffect(() => {
    setError(null);
    readReservation(reservation_id, abortController.signal)
      .then(setReservation)
      .catch(setError);
  }, [reservation_id]);

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
    // console.log(errors);

    function isFutureDate({ reservation_date, reservation_time }) {
      //reservation date
      const reservationDateTime = new Date(
        `${reservation_date}T${reservation_time}`
      );
      // console.log("reservationDateTime line 50", reservationDateTime);
      // //date right now = new Date()
      // console.log(
      //   reservationDateTime,
      //   "---",
      //   new Date(),
      //   "-------->>>today",
      //   today()
      // );
      // console.log("date now()", Date.now());
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
    // console.log(isFutureDate(reservation));
    isTuesday(reservation);
    // console.log(isTuesday(reservation));
    isOpenHours(reservation);
    // console.log(isOpenHours(reservation));

    if (errors.length) {
      setError(errors);
      return false;
    }
    return true;

    // return errors;

    //set the state
    //dont return it
  }
  // function validate(reservation) {
  //   const errors = [];

  //   function isFutureDate({ reservation_date, reservation_time }) {
  //     const dt = new Date(`${reservation_date}T${reservation_time}`);
  //     if (dt < new Date()) {
  //       errors.push(new Error("Reservation must be set in the future"));
  //     }
  //   }

  //   function isTuesday({ reservation_date }) {
  //     const day = new Date(reservation_date).getUTCDay();
  //     if (day === 2) {
  //       errors.push(new Error("No reservations available on Tuesday."));
  //     }
  //   }

  //   function isOpenHours({ reservation_time }) {
  //     const hour = parseInt(reservation_time.split(":")[0], 10);
  //     const mins = parseInt(reservation_time.split(":")[1], 10);

  //     if (hour <= 10 && mins <= 30) {
  //       errors.push(new Error("Restaurant is only open after 10:30 am"));
  //     }

  //     if (hour >= 22) {
  //       errors.push(new Error("Restaurant is closed after 10:00 pm"));
  //     }
  //   }

  //   isFutureDate(reservation);
  //   isTuesday(reservation);
  //   isOpenHours(reservation);

  //   return errors;
  // }

  function submitHandler(event) {
    const abortController = new window.AbortController();
    event.preventDefault();
    event.preventPropogation();
    setError(null);
    const itValidated = validate(reservation);

    if (itValidated) {
      updateReservation(reservation, abortController.signal)
        .then(() =>
          history.push(`/dashboard?date=${reservation.reservation_date}`)
        )
        .catch(setError);
      return () => abortController.abort();
    }

    // if (reservationErrors.length) {
    // console.log(reservationErrors);
    //   return setError(reservationErrors);
    // }
  }

  return (
    <div>
      <form onSubmit={submitHandler}>
        <div>
          <ReservationErrors errors={error} />
        </div>
        <div className="form-group row">
          <label htmlFor="first_name" className="col-sm-2 col-form-label">
            First name:
          </label>
          <div className="col-sm-10">
            <input
              id="first_name"
              type="text"
              name="first_name"
              value={reservation.first_name}
              onChange={changeHandler}
              required={true}
              className="form-control"
            />
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="last_name" className="col-sm-2 col-form-label">
            Last name:
          </label>
          <div className="col-sm-10">
            <input
              id="last_name"
              type="text"
              name="last_name"
              value={reservation.last_name}
              onChange={changeHandler}
              required={true}
              className="form-control"
            />
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="mobile_number" className="col-sm-2 col-form-label">
            Phone Number
          </label>
          <div className="col-sm-10">
            <input
              id="mobile_number"
              type="text"
              name="mobile_number"
              value={reservation.mobile_number}
              pattern="([0-9]{3}-)?[0-9]{3}-[0-9]{4}"
              onChange={changeHandler}
              required={true}
              className="form-control"
            />
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="reservation_date" className="col-sm-2 col-form-label">
            Reservation Date
          </label>
          <div className="col-sm-10">
            <input
              id="reservation_date"
              name="reservation_date"
              type="date"
              pattern="\d{4}-\d{2}-\d{2}"
              value={reservation.reservation_date}
              onChange={changeHandler}
              required={true}
              className="form-control"
            />
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="reservation_time" className="col-sm-2 col-form-label">
            Reservation Time
          </label>
          <div className="col-sm-10">
            <input
              id="reservation_time"
              name="reservation_time"
              type="time"
              value={reservation.reservation_time}
              pattern="[0-9]{2}:[0-9]{2}"
              onChange={changeHandler}
              required={true}
              className="form-control"
            />
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="people" className="col-sm-2 col-form-label">
            Party Size
          </label>
          <div className="col-sm-10">
            <input
              id="people"
              name="people"
              type="number"
              min={1}
              value={reservation.people}
              onChange={changeHandlerNum}
              required={true}
              className="form-control"
            />
          </div>
        </div>
        <button type="submit">Submit</button>
        <button type="button" onClick={() => history.goBack()}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default ReservationEdit;
