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

/**
 * Get the sum/total from a specific key in an object
 * @param {Object} object 
 * @param {String} key 
 * @returns {Float}
 */
export function getTotalFromObjectKey(object, key) {
  return object.reduce((acc, v) => acc + v[key], 0);
}


/**
 * Get the max value from a specific key in an object
 * @param {Object} object 
 * @param {String} key 
 * @returns {Float}
 */
 export function getMaxFromObjectKey(object, key) {
  return;
}

/**
 * Get the Percentage from the sum/total of a specific key in an object.
 * Useful to display pie or donut chart for example.
 * @param {Object} object 
 * @param {String} key 
 * @param {Float} total
 * @returns {Float}
 */
export function getPercentageFromTotalOfObjectKey(object, key, total) {
  const percentageArray = []
  object.map((data, index) => {
    percentageArray[index] = data[key] / total * 100
  })
  return percentageArray;
}

/**
 * Get the Percentage from the max value of a specific key in an object
 * Useful to display line or bar chart for example.
 * @param {Object} object 
 * @param {String} key 
 * @param {Float} total
 * @returns {Float}
 */
export function getPercentageFromMaxOfObjectKey(object, key, max) {
  return;
}

// Add space between zeros & cut to two decimals (if necessary)
export function applyPrettyNumber(number, decimals = 2) {
  if (!number || Number.isNaN(number)) return 0;
  let parts = parseFloat(number.toFixed(decimals)).toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return parts.join(".");
}