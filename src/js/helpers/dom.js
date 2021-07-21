/**
 * Utility for setting multiple attributes (NS specific for SVG)
 * @source Borrowed and slightly modified from gomakethings.com
 * @param {node} elem - NS specific DOM node
 * @param {Object[]} atts - array of attributes
 * @param {string} attribute[0] - name of the attribute
 * @param {string} attribute[1] - value of the attribute
 */
export function _setAttributesNS (elem, atts) {
  console.log(atts);
	atts.forEach(function (attribute) {
    attribute = Object.entries(attribute)[0]
		elem.setAttributeNS(null, attribute[0], attribute[1]);
	});
};

/**
 * Utility for creating and inserting into the DOM a new SVG element
 * @param {node} parent - node in which the new element is inserted
 * @param {string} nodeType - type of node created (line, circle, text...)
 * @param {Object[]} attributes - array of attributes
 * @param {string} [content] - Optional textContent of the node
 * @returns {node} SVG element created
 * 
 * @example
 * const labelY = _createSVGElement(someNodeVariable, 'text', [
 *   {'x': 10},
 *   {'y': 50},
 * ], 'I am the label of Y axis');
 */
export function _createSVGElement(parent, nodeType, attributes, content) {
  const svgns = "http://www.w3.org/2000/svg";
  const element = document.createElementNS(svgns, nodeType);
  _setAttributesNS(element, attributes);
  if(content) {element.textContent = content;}
  parent.appendChild(element);
  return element;
}


/**
 * Helper fonction for querySelector()
 * @source https://gomakethings.com/an-easier-way-to-get-elements-in-the-dom-with-vanilla-js/
 * @param {string} selector - String query to look for
 * @param {node} [parent=document] - Optional parent of the query
 * @returns {node} DOM Element queried
 */
export function _select (selector, parent) {
  return (parent ? parent : document).querySelector(selector);
}

/**
 * Helper fonction for querySelectorAll()
 * @source https://gomakethings.com/an-easier-way-to-get-elements-in-the-dom-with-vanilla-js/
 * @param {string} selector - String query to look for
 * @param {node} [parent=document] - Optional parent of the query
 * @returns {node[]} Array of DOM Elements queried
 */
export function _selectAll (selector, parent) {
  return Array.prototype.slice.call((parent ? parent : document).querySelectorAll(selector));
};

