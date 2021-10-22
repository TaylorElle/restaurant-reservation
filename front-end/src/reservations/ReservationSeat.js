import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { listTables, updateTable, listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { today } from "../utils/date-time";

function ReservationSeat() {
  const history = useHistory();
  const { reservation_id } = useParams();

  const [tables, setTables] = useState([]);
  const [tableId, setTableId] = useState("");
  const [errors, setErrors] = useState(null);
  const foundErrors = [];

  useEffect(() => {
    listTables().then(setTables);
  }, []);

  function validateSeat() {
    if (!tableId) {
      foundErrors.push("Table does not exist.");
    }
    if (!reservation_id) {
      foundErrors.push("Reservation does not exist.");
    }

    if (tableId.reservation_id) {
      foundErrors.push("Table selected is occupied.");
    }

    if (tableId.capacity < reservation_id.people) {
      foundErrors.push("Table selected cannot seat number of people.");
    }

    if (foundErrors) {
      setErrors(new Error(foundErrors.toString()));
      return false;
    }
    return true;
  }

  function changeHandler({ target: { value } }) {
    return value ? setTableId(value) : setTableId(null);
  }

  async function submitHandler(event) {
    const abortController = new window.AbortController();

    event.preventDefault();
    setErrors(null);

    if (validateSeat) {
      updateTable(tableId, reservation_id, abortController.signal)
        .then(() => listTables())
        .then(setTables)
        .then(() => listReservations({ date: today() }))
        .then(() => history.push("/dashboard"))
        .catch(setErrors);
    }
    return () => abortController.abort();
  }

  return (
    <main>
      <h1>Seat</h1>
      <ErrorAlert error={errors} />

      <form onSubmit={submitHandler}>
        <fieldset>
          <div className="row">
            <div className="col">
              <select
                id="table_id"
                name="table_id"
                value={tableId}
                required={true}
                onChange={changeHandler}
              >
                <option key={0} value={0}>
                  --- Please select a table ---
                </option>
                {tables.map((table) => (
                  <option key={table.table_id} value={table.table_id}>
                    {table.table_name} - {table.capacity}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => history.goBack()}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </fieldset>
      </form>
    </main>
  );
}

export default ReservationSeat;
