import { useState, useEffect } from "react";
import { tabData } from "./mockData";

import "./index.css";

// function hashMapFromNestedValues(data) {
//   const values = data.flat().filter((val) => val);
//   const hashMap = {};
//   values.forEach((val) => {
//     hashMap[val.id] = val;
//   });
//   console.log({ hashMap });
//   return hashMap;
// }

function getValuesFromIds(ids, data, key = "value") {
  const newData = data.map((row) => {
    return row
      .map((cell) => {
        if (ids.includes(cell.id)) {
          return cell[key];
        }
        return null;
      })
      .filter((val) => val);
  });
  // .filter((row) => row.length);
  return newData;
}

function updateTableData(data, hashMapToDelete) {
  const newData = data.map((row) => {
    return row.map((cell) => {
      if (hashMapToDelete[cell.id]) {
        return {
          ...cell,
          first_name: "",
        };
      }
      return cell;
    });
  });

  return newData;
}

function App() {
  const [tableData, setTableData] = useState(tabData);
  const [selectedIds, setSelectedIds] = useState({});
  const [mouseDown, setMouseDown] = useState(false);
  const [ctrlKeyDown, setCtrlKeyDown] = useState(false);
  const [clickedCell, setClickedCell] = useState("");
  const [clipboardData, setClipboardData] = useState("");
  const [pastedData, setPastedData] = useState("");

  const clickCell = (cell, isSelected) => {
    const id = cell.target.id;
    if (ctrlKeyDown) {
      return setSelectedIds({ ...selectedIds, [id]: !isSelected });
    }

    if (!isSelected) return setSelectedIds({ [id]: true });
    if (isSelected) return setSelectedIds({});
  };

  const hoverCell = (cell) => {
    const id = cell.target.id;
    mouseDown && setSelectedIds({ ...selectedIds, [id]: true });
  };

  const deleteCells = (selectedIds) => {
    const newTable = updateTableData(tableData, selectedIds);
    setTableData(newTable);
  };

  function handleCopy(event) {
    const ids = getValuesFromIds(
      Object.keys(selectedIds),
      tableData,
      "first_name"
    );

    console.log({ ids });
    const formattedData = transformArrayToExcelLikeParsing(ids);

    event.clipboardData.setData("text/plain", formattedData);
    setClipboardData(preDataFormat(formattedData));

    event.preventDefault();
  }

  function preDataFormat(data) {
    return (
      "[ new cell ]  " +
      data
        .replaceAll("\n", "\n\n[ new row  ]\n\t")
        .replaceAll("\t", "\n[ new cell ]  ")
        .replaceAll(",", "\n[ new cell ]  ")
    );
  }

  function transformArrayToExcelLikeParsing(data) {
    let string = "";
    data.forEach((elem) => {
      elem.forEach((val, cellIndex) => {
        if (cellIndex !== 0) string += "\t";

        string += val;
      });
      string += "\n";
    });
    return string.trim();
  }

  function handlePaste(e) {
    var clipboardData, pastedData;

    // Stop data actually being pasted into div
    e.stopPropagation();
    e.preventDefault();

    // Get pasted data via clipboard API
    clipboardData = e.clipboardData || window.clipboardData;

    pastedData = clipboardData.getData("Text");
    console.log({ pastedData });
    setPastedData(preDataFormat(pastedData));
  }

  useEffect(() => {
    window.onmousemove = function (e) {
      if (!e) e = window.event;
      if (e.ctrlKey) {
        setCtrlKeyDown(true);
      } else if (e.metaKey) {
        setCtrlKeyDown(true);
        /*cmd is down*/
      } else {
        setCtrlKeyDown(false);
      }
    };

    document.body.onmousedown = function () {
      setMouseDown(true);
    };
    document.body.onmouseup = function () {
      setMouseDown(false);
    };

    document.body.addEventListener("paste", (event) => {
      handlePaste(event);
      event.preventDefault();
    });
  }, []);

  useEffect(() => {
    document.body.onkeydown = function (e) {
      if (e?.keyCode) {
        e?.keyCode === 8 && deleteCells(selectedIds);
      }
    };
    document.body.addEventListener("copy", handleCopy);
    return () => {
      document.body.removeEventListener("copy", handleCopy);
    };
  }, [selectedIds, deleteCells, handleCopy]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: 32,
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <table>
        <tbody>
          {tableData.map((row) => {
            return (
              <tr key={row[0].id}>
                {row.map((cell) => {
                  if (!cell) return <></>;
                  const isSelected = selectedIds[cell.id];
                  const isClicked = clickedCell === cell.id;

                  return (
                    <td
                      tabIndex="-1"
                      key={cell.id}
                      id={cell.id}
                      onMouseDown={(e) => clickCell(e, isSelected)}
                      onFocus={() => setClickedCell(cell.id)}
                      onMouseOver={hoverCell}
                      style={{
                        border: isSelected
                          ? "3px solid green"
                          : "3px solid transparent",
                        backgroundColor: isClicked ? "lightblue" : "white",
                        width: 100,
                        height: 30,
                      }}
                    >
                      {cell.first_name}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p>
        <ul>
          <li>Press backspace to delete data</li>
          <li>
            Press CMD (MacOS) or CTRL (Windows/Linux) to select/deselect
            multiple cells
          </li>
          <li>Or keep mouse clicked to select multiple cells</li>
        </ul>
      </p>
      <p>
        <h3>Clipboard copied data</h3>
        <pre>{clipboardData}</pre>
      </p>
      <p>
        <h3>Clipboard pasted data</h3>
        <pre>{pastedData}</pre>
      </p>
    </div>
  );
}

export default App;
