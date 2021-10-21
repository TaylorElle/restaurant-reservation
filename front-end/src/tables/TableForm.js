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

  const [error, setError] = useState(null);

  function submitHandler(event) {
    const abortController = new window.AbortController();
    event.preventDefault();
    setError(null);

    createTable(table)
      .then(() => {
        history.push(`/dashboard?date=${today()}`);
      })
      .catch(setError);
    return () => abortController.abort();
  }

  return (
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
          />
        </div>
      </div>
      <div className="form-group row">
        <label htmlFor="capacity" className="col-sm-2 col-form-label">
          Number of people:
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
          />
        </div>
      </div>
      <button type="submit">Submit</button>
      <button type="button" onClick={() => history.goBack()}>
        Cancel
      </button>
    </form>
  );
}

export default TableForm;
