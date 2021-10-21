import React from "react";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../utils/api";
import TableErrors from "./TableError";
import { today } from "../utils/date-time";

function TableForm() {
  const history = useHistory();
  const initialState = {
    table_name: "",
    capacity: 0,
  };
  const [table, setTable] = useState(initialState);
  const [error, setError] = useState(null);

  function changeHandler({ target: { name, value } }) {
    setTable((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  function changeHandlerNum({ target: { name, value } }) {
    setTable((prevState) => ({
      ...prevState,
      [name]: Number(value),
    }));
  }

  function submitHandler(event) {
    const abortController = new window.AbortController();
    event.preventDefault();
    setError(null);

    createTable(table, abortController.signal)
      .then(() => {
        history.push(`/dashboard?date=${today()}`);
      })
      .catch(setError);
    return () => abortController.abort();
  }

  return (
    <div>
      <form onSubmit={submitHandler}>
        <TableErrors errors={error} />
        <div className="form-group row">
          <label htmlFor="table_name" className="col-sm-2 col-form-label">
            Table name:
          </label>
          <div className="col-sm-10">
            <input
              id="table_name"
              name="table_name"
              type="text"
              minLength={2}
              required={true}
              value={table.table_name}
              onChange={changeHandler}
              className="form-control"
            />
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="capacity" className="col-sm-2 col-form-label">
            Capacity of people:
          </label>
          <div className="col-sm-10">
            <input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              required={true}
              value={table.capacity}
              onChange={changeHandlerNum}
              className="form-control"
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
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

export default TableForm;
