import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { postReservation } from "../utils/api";

export default function ReservationForm() {
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
  const history = useHistory();

  // function changeHandler({ target: { name, value } }) {
  //   setReservation((prevState) => ({
  //     ...prevState,
  //     [name]: value,
  //   }));
  // }
  const formChange = ({ target: { name, value } }) => {
    const newChange = { ...reservationData };
    // newChange[event.target.id] = event.target.value;
    setReservationData((newChange) => ({
      ...newChange,
      [name]: value,
    }));
  };

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
  const handleSubmit = (event) => {
    event.preventDefault();
    // const reservationError = validate(reservationData);
    // do not send POST request if there is a pending error message
    // if (reservationsError.length) {
    //   return setReservationsError(reservationError);
    // }

    const abortController = new window.AbortController();
    // POST request (new reservation)
    async function postData() {
      try {
        await postReservation(reservationData, abortController.signal()).then(
          (createdReservation) => {
            history.push(
              `/dashboard?date=${createdReservation.reservation_date}`
            );
          }
        );
      } catch (error) {
        setReservationsError([...reservationsError, error.message]);
      }
    }

    postData();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="form-group row">
          <label htmlFor="first_name">
            First Name
            <input
              id="first_name"
              type="text"
              name="first_name"
              onChange={formChange}
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
            onChange={formChange}
            value={reservationData.last_name}
            placeholder="Smith"
            required="required"
          ></input>
          <label htmlFor="mobile_number">Phone Number</label>
          <input
            id="mobile_number"
            type="text"
            name="mobile_number"
            onChange={formChange}
            value={reservationData.mobile_number}
            placeholder="xxx-xxx-xxxx or xxx-xxxx"
            pattern="([0-9]{3}-)?[0-9]{3}-[0-9]{4}"
            required="required"
          ></input>
          <label htmlFor="reservation_date">Reservation Date</label>
          <input
            id="reservation_date"
            name="reservation_date"
            onChange={formChange}
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
            onChange={formChange}
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
            onChange={formChange}
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
