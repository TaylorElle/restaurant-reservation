import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    if (typeof window !== undefined) {
      const abortController = new window.AbortController();
      setReservationsError(null);
      listReservations({ date }, abortController.signal)
        .then(setReservations)
        .catch(setReservationsError);
      return () => abortController.abort();
    }
  }

  /* function to change the date */
  function changeDateUrl(scalar) {
    const temp = date.split("-");
    const newDate = new Date(
      Number(temp[0]),
      Number(temp[1]) - 1,
      Number(temp[2]) + scalar
    )
      .then(console.log(newDate))
      .toISOString()
      .split("T")[0];
    history.push(`/dashboard?date=${newDate}`);
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for Date: {date}</h4>
        <p>{listReservations} </p>
      </div>
      <ErrorAlert error={reservationsError} />
      {JSON.stringify(reservations)}
      <div>
        {/* display BUTTONS for next, previous, and today buttons that allow the
      user to see reservations on other dates //button for next */}

        {/* button for previous */}
        <button
          onClick={() => {
            changeDateUrl(-1);
          }}
          className="btn btn-secondary mr-1"
        >
          Previous
        </button>

        {/* button for next */}
        <button
          onClick={() => {
            changeDateUrl(1);
          }}
          className="btn btn-primary mr-1"
        >
          Next
        </button>

        {/* button for today just refreshes the page because the page is defaulted to today */}
        <button
          onClick={() => {
            history.push(`/dashboard`);
          }}
          className="btn btn-info"
        >
          Today
        </button>
      </div>
    </main>
  );
}

export default Dashboard;
