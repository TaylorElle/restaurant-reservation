import React, { useEffect, useState } from "react";
import {
  listReservations,
  listTables,
  finishTable,
  cancelReservation,
} from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { previous, today, next } from "../utils/date-time";

import Reservations from "./Reservations";
import useQuery from "../utils/useQuery";
import Tables from "./Tables";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard() {
  const query = useQuery();
  const date = query.get("date") ? query.get("date") : today();
  console.log("date", date);

  // const dateInUrl = useQuery().get("date");
  // if (dateInUrl) {
  //   date = dateInUrl;
  // }
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new window.AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    listTables().then(setTables).catch(setTablesError);

    return () => abortController.abort();
  }

  function onCancel(reservation_id) {
    cancelReservation(reservation_id)
      .then(loadDashboard)
      .catch(setReservationsError);
  }

  function onFinish(table_id, reservation_id) {
    finishTable(table_id, reservation_id).then(loadDashboard);
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for: {date}</h4>
      </div>
      {/*//////////// PREVIOUS //////////////*/}
      <button
        className="btn btn-info m-1 p-3"
        onClick={() => history.push(`/dashboard?date=${previous(date)}`)}
      >
        Previous
      </button>

      {/*//////////// TODAY //////////////*/}
      <button
        className="btn btn-dark m-1 p-3"
        onClick={() => history.push(`/dashboard?date=${today()}`)}
      >
        Today
      </button>

      {/*//////////// NEXT //////////////*/}
      <button
        className="btn btn-info m-1 p-3"
        onClick={() => history.push(`/dashboard?date=${next(date)}`)}
      >
        Next
      </button>

      <ErrorAlert error={reservationsError} />
      <Reservations reservations={reservations} onCancel={onCancel} />
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Tables</h4>
      </div>
      <ErrorAlert error={tablesError} />
      <Tables tables={tables} onFinish={onFinish} />
    </main>
  );
}

export default Dashboard;
