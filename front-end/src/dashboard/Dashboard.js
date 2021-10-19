import React, { useEffect, useState } from "react";
import {
  listReservations,
  listTables,
  finishTable,
  cancelReservation,
} from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import Reservations from "./Reservations";
import useQuery from "../utils/useQuery";
import Tables from "./Tables";
import DateNavigation from "./DateNavigation";

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
  const [tablesError, setTablesError] = useState(null);

  useEffect(loadReservations, [date]);
  useEffect(loadTables, []);

  // function loadDashboard() {
  //   const abortController = new window.AbortController();
  //   setReservationsError(null);
  //   listReservations({ date }, abortController.signal)
  //     .then(setReservations)
  //     .catch(setReservationsError);
  //   listTables().then(setTables).catch(setTablesError);

  //   return () => abortController.abort();
  // }
  // function onCancel(reservation_id) {
  //   cancelReservation(reservation_id)
  //     .then(loadDashboard)
  //     .catch(setReservationsError);
  // }

  function loadReservations() {
    setReservations("loading");

    const abortController = new window.AbortController();
    setReservationsError(null);

    // listReservations will run every time {date} changes
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);

    return () => abortController.abort();
  }

  function loadTables() {
    setTables("loading");
    const abortController = new window.AbortController();
    setTablesError(null);

    listTables(abortController.signal).then(setTables).catch(setTablesError);

    return () => abortController.abort();
  }

  const displayDateLong = formatDisplayDate(date, "long");

  // function onFinish(table_id, reservation_id) {
  //   finishTable(table_id, reservation_id).then(loadDashboard);
  // }

  return (
    <main>
      <div className="row">
        <div className="col-12 mx-auto my-3">
          <h2 className="mb-0 text-center">{displayDateLong}</h2>
          <DateNavigation date={date} />
        </div>
      </div>
      <div className="row">
        <div className="col-md-12 mx-auto">
          <fieldset className="border border-bottom-0 border-dark p-3 m-0">
            <legend className="pl-2 shadow bg-dark rounded sticky-top">
              <CurrentTime sectionTitle={"Reservations"} />
            </legend>
            <ReservationsList reservations={reservations} />
            <ErrorAlert error={reservationsError} />
          </fieldset>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-md-12 mx-auto">
          <fieldset className="border border-bottom-0 border-dark p-3 m-0">
            <legend className="pl-2 text-white shadow bg-dark rounded sticky-top">
              Tables
            </legend>
            <TablesList tables={tables} />
            <ErrorAlert error={tablesError} />
          </fieldset>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
