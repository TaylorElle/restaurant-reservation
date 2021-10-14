import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import Reservations from "./Reservations";
import { useHistory } from "react-router-dom";
import useQuery from "../utils/useQuery";

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

  // useEffect(() => {
  //   if (!theDate) history.push(`/dashboard?date=${date}`);
  // }, [query, history, theDate, date]);
  // useEffect(loadDashboard, [date, history, theDate]);
  // useEffect(() => {
  //   const abortController = new window.AbortController();
  //   listReservations({ date }, abortController.signal)
  //     .then(setReservations)
  //     .catch(setReservationsError);
  // }, [reservations]);

  function loadDashboard() {
    const abortController = new window.AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      <Reservations reservations={reservations} />
    </main>
  );
}

export default Dashboard;
