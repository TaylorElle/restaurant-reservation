import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { postReservation } from "../utils/api";

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

  const [reservationData, setReservationData] = useState(initialState);
  // const [error, setError] = useState(null);
  const [reservationsError, setReservationsError] = useState(null);

  // function changeHandler({ target: { name, value } }) {
  //   setReservation((prevState) => ({
  //     ...prevState,
  //     [name]: value,
  //   }));
  // }
  function changeHandler({ target: { name, value } }) {
    // newChange[event.target.id] = event.target.value;
    setReservationData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  function changeHandlerNum({ target: { name, value } }) {
    setReservationData((prevState) => ({
      ...prevState,
      [name]: Number(value),
    }));
  }

  // function validate(reservationData) {
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
  //     const hour = parseInt(reservation_time.split(":")[0]);
  //     const mins = parseInt(reservation_time.split(":")[1]);

  //     if (hour <= 10 && mins <= 30) {
  //       errors.push(new Error("Restaurant is only open after 10:30 am"));
  //     }

  //     if (hour >= 22) {
  //       errors.push(new Error("Restaurant is closed after 10:00 pm"));
  //     }
  //   }

  //   isFutureDate(reservationData);
  //   isTuesday(reservationData);
  //   isOpenHours(reservationData);

  //   return errors;
  // }

  //submit handler
  //take form data and give to server
  //POST request. endpoint - reservations/new
  //axios.post().then()  OR something like fetch(url, {post})
  function submitHandler(event) {
    event.preventDefault();
    // const reservationError = validate(reservationData);
    // do not send POST request if there is a pending error message
    // if (reservationsError.length) {
    //   return setReservationsError(reservationError);
    // }

    const abortController = new window.AbortController();
    // POST request (new reservation)

    postReservation(reservationData)
      .then((createdReservation) => {
        const res_date =
          createdReservation.reservation_date.match(/\d{4}-\d{2}-\d{2}/)[0];
        history.push(`/dashboard?date=` + res_date);
      })
      .catch(setReservationsError);

    // async function postData() {
    //   try {
    //     await postReservation(reservationData, abortController.signal()).then(
    //       (createdReservation) => {
    //         history.push(
    //           `/dashboard?date=${createdReservation.reservation_date}`
    //         );
    //       }
    //     );
    //   } catch (error) {
    //     setReservationsError([...reservationsError, error.message]);
    //   }
    // }

    // postData();
  }

  return (
    <div>
      <form onSubmit={submitHandler}>
        <div className="form-group row">
          <label htmlFor="first_name">
            First Name
            <input
              id="first_name"
              type="text"
              name="first_name"
              onChange={changeHandler}
              value={reservationData.first_name}
              placeholder="John"
              required="required"
            />
          </label>
          <label htmlFor="last_name">Last Name</label>
          <input
            id="last_name"
            type="text"
            name="last_name"
            onChange={changeHandler}
            value={reservationData.last_name}
            placeholder="Smith"
            required="required"
          ></input>
          <label htmlFor="mobile_number">Phone Number</label>
          <input
            id="mobile_number"
            type="tel"
            name="mobile_number"
            onChange={changeHandler}
            value={reservationData.mobile_number}
            placeholder="xxx-xxx-xxxx or xxx-xxxx"
            pattern="([0-9]{3}-)?[0-9]{3}-[0-9]{4}"
            required="required"
          ></input>
          <label htmlFor="reservation_date">Reservation Date</label>
          <input
            id="reservation_date"
            name="reservation_date"
            onChange={changeHandler}
            value={reservationData.reservation_date}
            type="date"
            placeholder="YYYY-MM-DD"
            pattern="\d{4}-\d{2}-\d{2}"
            required="required"
          ></input>
          <label htmlFor="reservation_time">Reservation Time</label>
          <input
            id="reservation_time"
            name="reservation_time"
            onChange={changeHandler}
            value={reservationData.reservation_time}
            type="time"
            placeholder="HH:MM"
            pattern="[0-9]{2}:[0-9]{2}"
            required="required"
          />
          <label htmlFor="people">Party Size</label>
          <input
            id="people"
            name="people"
            onChange={changeHandlerNum}
            value={reservationData.people}
            type="number"
            min="1"
            required="required"
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
