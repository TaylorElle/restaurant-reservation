import React, { useEffect, useState } from "react";
import { listReservations, listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import Reservations from "./Reservations";
import useQuery from "../utils/useQuery";
import Tables from "./Tables";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const dateInUrl = useQuery().get("date");
  if (dateInUrl) {
    date = dateInUrl;
  }
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new window.AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    listTables().then(setTables);

    return () => abortController.abort();
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for: {date}</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      <Reservations reservations={reservations} />
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Tables</h4>
      </div>
      <Tables tables={tables} />
    </main>
  );
}

export default Dashboard;
