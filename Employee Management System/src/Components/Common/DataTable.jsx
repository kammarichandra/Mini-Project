import React from "react";

function DataTable({ columns, data }) {
  return (
    <div className="table-responsive">
      <table className="table table-bordered table-hover">

        <thead className="table-dark">
          <tr>
            {columns.map((column) => (
              <th key={column.key}> {column.label} </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center" >
                No data available
              </td>
            </tr>
          )}
        </tbody>

      </table>
    </div>
  );
}

export default DataTable;