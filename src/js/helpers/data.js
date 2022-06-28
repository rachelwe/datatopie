/**
 * generate a header object and data array from an HTML table
 *
 * @param {node} table - an html table wrapper 
 * @return {number[]} The header object and data array in an array form
 *
 * @example
 *
 *     let [header, datas] = tableToJson(tableNode)
 */

export function _tableToJson(table) { 
  let header = {
    "x": table.rows[0].cells[0].innerHTML,
    "y": table.rows[0].cells[1].innerHTML
  }

  let datas = [];
  for (var i=1; i<table.rows.length; i++) { 
    var tableRow = table.rows[i]; 
    var rowData = {
      "x": tableRow.cells[0].innerHTML,
      "y": tableRow.cells[1].innerHTML
    }
    datas.push(rowData);
  }
  console.log([header, datas]);
  return [header, datas];
}