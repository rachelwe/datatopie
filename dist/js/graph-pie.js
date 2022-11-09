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

/**
 * Get the sum/total from a specific key in an object
 * @param {Object} object 
 * @param {String} key 
 * @returns {Float}
 */
function getTotalFromObjectKey(object, key) {
  return object.reduce((acc, v) => acc + v[key], 0);
}

/**
 * Get the Percentage from the sum/total of a specific key in an object.
 * Useful to display pie or donut chart for example.
 * @param {Object} object 
 * @param {String} key 
 * @param {Float} total
 * @returns {Float}
 */
function getPercentageFromTotalOfObjectKey(object, key, total) {
  const percentageArray = [];
  object.map((data, index) => {
    percentageArray[index] = data[key] / total * 100;
  });
  return percentageArray;
}

// Add space between zeros & cut to two decimals (if necessary)
function applyPrettyNumber(number, decimals = 2) {
  if (!number || Number.isNaN(number)) return 0;
  let parts = parseFloat(number.toFixed(decimals)).toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return parts.join(".");
}

/**
 * Renvoie un élément HTML depuis une chaine
 * return an html element that can be queried befor added to the DOM
 * easier to work with & more performant
 * @param {string} string 
 * @returns {HTMLElement}
 */
 function stringToDom(string) {
  return document.createRange().createContextualFragment(string).firstChild;
}

/**
 * Utility for setting multiple attributes (NS specific for SVG)
 * @source Borrowed and slightly modified from gomakethings.com
 * @param {node} elem - NS specific DOM node
 * @param {Object[]} atts - array of attributes
 * @param {string} attribute[0] - name of the attribute
 * @param {string} attribute[1] - value of the attribute
 */
function _setAttributesNS (elem, atts) {
	atts.forEach(function (attribute) {
    attribute = Object.entries(attribute)[0];
		elem.setAttributeNS(null, attribute[0], attribute[1]);
	});
}

/**
 * Utility for setting multiple attributes in an html tag
 * @source Borrowed and slightly modified from gomakethings.com
 * @param {node} elem - HTML DOM node
 * @param {Object[]} atts - array of attributes
 * @param {string} attribute[0] - name of the attribute
 * @param {string} attribute[1] - value of the attribute
 */
 function _setAttributes (elem, atts) {
	atts.forEach(function (attribute) {
    attribute = Object.entries(attribute)[0];
		elem.setAttribute(attribute[0], attribute[1]);
	});
}
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
function _createSVGElement(parent, nodeType, attributes, content) {
  const svgns = "http://www.w3.org/2000/svg";
  const element = document.createElementNS(svgns, nodeType);
  _setAttributesNS(element, attributes);
  if(content) {element.innerHTML = content;}
  parent.appendChild(element);
  return element;
}

/**
 * Utility for creating and inserting into the DOM a new SVG element
 * @param {node} parent - node in which the new element is inserted
 * @param {string} nodeType - type of node created (line, circle, text...)
 * @param {Object[]} attributes - array of attributes
 * @param {string} [content] - Optional textContent of the node
 * @returns {node} SVG element created
 * 
 * @example
 * const labelY = _createHTMLElement(someNodeVariable, 'text', [
 *   {'x': 10},
 *   {'y': 50},
 * ], 'I am the label of Y axis');
 */
 function _createHTMLElement(parent, nodeType, attributes, content) {
  const element = document.createElement(nodeType);
  _setAttributes(element, attributes);
  if(content) {element.innerHTML = content;}
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
function _select (selector, parent) {
  return (parent ? parent : document).querySelector(selector);
}

/**
 * nice scale utility
 * @source  https://stackoverflow.com/a/8855530
 * 
 * @param {number} min - minimum value
 * @param {number} max - maximum value
 * @param {number} tickCount - number of steps wished (-+ 2 steps)
 * @returns {array} array of ticks values
 * 
 * @example
 * // returns [ 0, 500, 1000, 1500, 2000 ]
 * _calculateTicks(0, 2200, 6)
 */


function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
}

/**
 * A module to generate a pie or donut chart
 * @author Rachel Pellin <pellin.rachel@gmail.com>
 * @license MIT License Copyright (c) 2022 Rachel Pellin
 * @version 0.1
 */

/**
* Représente un point
* @property {number} x
* @property {number} y
*/
class Point {
  constructor (x, y) {
      this.x = x; 
      this.y = y; 
  }

  toSvgPath () {
      return `${this.x} ${this.y}`
  }

  toArray () {
    return [this.x, this.y];
  }

  static fromAngle (angle) {
      return new Point(Math.cos(angle), Math.sin(angle))
  }
}

/**
 * @class GraphPie, generate a pie or donut chart
 */
class GraphPie {
  /**
   * A class to generate a pie or donut chart
   * Naming convention : functions starting with "_" 
   * are private and should not be used outside of the class
   * @param {object[]} datas - Array of datas as objects containing property and value
   * @param {object} config - Object listing all the config options
   * @property {object} nodes - The diferent nodes (svg & html) created inside the wrapper
   * @property {object} paths - The diferent paths created inside the svg
   * @property {object} tooltips - The diferent tooltips created inside the html tooltip wrapper
   */
  constructor(datas, config) {
    // Get the parameters
    this.datas = datas;
    this.config = config;
    this.nodes = {};
    this.paths = {};
    this.tooltips = {};
    this.output = {};
  }

  /**
   * @
   * Temporary debug
   */  
  debug() {
    console.log(this);
  }

  /**
   * Create the svg & tooltip node
   * & query the data group inside the svg for later use
   */
  _setTemplate() {
    this.nodes.donut = stringToDom(
      `<div class="graph_wrapper_svg">
        <svg class="graph" aria-labelledby="${this.config.id}-title" id="${this.config.id}" viewBox="-1 -1 2 2">
          <title id="${this.config.id}-title">${this.config.mainTitle}</title>
          <g class="graph_data" data-datas data-hide="" mask="url(#${this.config.id}-mask)">
          </g>
          <circle r="${this.config.donut + .01 || 0}" fill="white" mask="url(#${this.config.id}-mask)"/>
          <mask id="${this.config.id}-mask">
              <rect fill="white" x="-2" y="-2" width="4" height="4"/>
              <circle r="${this.config.donut || 0}" fill="black"/>
          </mask>
        </svg>
        <div class="graph_tooltips" data-tooltips></div>
      </div>`
    );
    this.nodes.legend = stringToDom(`<div class="graph_wrapper_legend"></div>`);
    this.nodes.svg = _select('.graph',this.nodes.donut);
    this.nodes.data = _select('[data-datas]',this.nodes.donut);
    this.nodes.tooltips = _select('[data-tooltips]',this.nodes.donut);
  }

  /**
   * Private function to create the diferent paths tags
   * store the nodes created in this.path object for later use
   */
  _setPaths() {
    this.paths = this.datas.map((data, index) => {
      return _createSVGElement(this.nodes.data, 'path', [
        {'fill': data.color},
        {'stroke': "#fff"},
        {'stroke-width': "0.01px"},
        {'data-value': data.value},
        {'data-label': data.label},
        {'id': this.config.id + '-path-' + index},
        {'aria-labelledby': this.config.id + '-tooltip-' + index},
        {'tabindex': 0}
      ]);
    });
  }

  /**
   * Private function to create the diferent paths tags
   * store the nodes created in this.path object for later use
   */
   _setTooltips() {
    this.tooltips = this.datas.map((data, index) => {
      return _createHTMLElement(this.nodes.tooltips, 'div', [
        {'class': "graph_tooltip"},
        {'data-value': data.value},
        {'data-color': data.color},
        {'style': '--data-color:' + data.color},
        {'id': this.config.id + '-tooltip-' + index}
      ], `<p>${data.label}</p>
      <p>${applyPrettyNumber(data.value, this.config.decimals || 2)}&nbsp;${this.config.unite} &ndash; ${applyPrettyNumber(this.output.percentages[index], this.config.decimals || 2)}&nbsp;%</p>
    `);
    });
  }

  /**
   * Private function to create the different legends
   * store the nodes created in this.legend object for later use
   * can be overwritten by this.config.legend properties
   */
   _setLegend() {
    this.config.legend = this.config.legend || {};
    const elementAttributes = (data, index) => {return this.config.legend.attributes 
          ? this.config.legend.attributes(data, index) 
          : [
              {'class': "graph_legend"},
              {'data-value': data.value},
              {'style': '--data-color:' + data.color + ';--data-percentage:' + this.output.percentages[index]},
              {'data-index': index},
              {'data-display': true},
              {'id': this.config.id + '-legend-' + index}
            ];};
    const elementContent = (data, index) => {return this.config.legend.content 
          ? this.config.legend.content(data, index) 
          : ` <div class="graph_legend_label">
                <p>${data.label}</p>
                <p id="${this.config.id + '-legend-meter-' + index}">${applyPrettyNumber(data.value, this.config.decimals || 2)}&nbsp;${this.config.unite} &ndash; ${applyPrettyNumber(this.output.percentages[index], this.config.decimals || 2)}&nbsp;%</p>
              </div>
              <div class="meter" role="meter" aria-valuenow="${data.value}" aria-valuemin="0" aria-valuemax="${this.output.total}" aria-labelledby="${this.config.id + '-legend-meter-' + index}"></div>
              <button data-toggle>${this.config.legend.hideButton}</button>`;};
    this.config.legend.hideButton = this.config.legend.hideButton 
          ? this.config.legend.hideButton 
          : "cacher";
    // We are not using the native meter element because custom styling is not supported in chrome
    this.legend = this.datas.map((data, index) => {
      const appliedAttributes = elementAttributes(data, index);
      console.log(appliedAttributes);
      return _createHTMLElement(this.nodes.legend, 'div', elementAttributes(data, index), elementContent(data, index));
    });
  }

  _getDataGap(newData, oldData) {
    const gap = newData.map((data, index) => {
      return data.value - oldData[index].value;
    });
    return gap;
  }

  /**
   * Positionne le label en fonction de l'angle
   * @param {HTMLDivElement|undefined} label 
   * @param {number} angle 
   */
  _positionLabel (label, angle) {
    if (!label || !angle) {
        return;
    }
    const point = Point.fromAngle(angle);
    label.style.setProperty('--y', `${(point.y * 0.5 + 0.5) * 100}%`);
    label.style.setProperty('--x', `${(point.x * 0.5 + 0.5) * 100}%`);
    label.setAttribute("data-side", point.x > 0 ? "right" : "left");
  }

  /**
   * Dessine le graphique
   * @param {object} datas 
   */
  draw (datas = this.datas, progress = 1) {
    let angle = Math.PI / -2;
    let start = new Point(0, -1);
    datas.forEach((data, index) => {
      const ratio = (data.value / getTotalFromObjectKey(datas, 'value')) * progress;
      if (progress === 1) {
          this._positionLabel(this.tooltips[index], angle + ratio * Math.PI);
      }

      // TODO: best way to animate : interpolate values, not paths
      angle += ratio * 2 * Math.PI;
      const end = Point.fromAngle(angle);
      const largeFlag = ratio > .5 ? '1' : '0';
      this.paths[index].setAttribute('d', `M 0 0 L ${start.toSvgPath()} A 1 1 0 ${largeFlag} 1 ${end.toSvgPath()} L 0 0`);
      start = end;
    });
    this.displayedDatas = [...datas];
  }

  update (newData, oldData = this.displayedDatas) {
    let duration = 10;

    const dataGap = this._getDataGap(newData, oldData);
    const dataIncrement = dataGap.map((data, index) => {
      return data / duration;
    });
    let animatedData = [...oldData];

    const launchDraw = () => {
      duration += -1;
      if (duration > 1) {
        this.draw(animatedData, 1);
        animatedData = animatedData.map((data, index) => {
          const temp = {...data};
          temp.value = data.value + dataIncrement[index];
          return temp
        });
        window.requestAnimationFrame(launchDraw);
      } else {
        this.draw(newData, 1);
      }
    };
    window.requestAnimationFrame(launchDraw);
  }

  animate (datas = this.datas) {
    const now = Date.now();
    const duration = 1000;
    const launchDraw = () => {
        const t = (Date.now() - now) / duration;
        if (t < 1) {
            this.draw(datas, easeOutExpo(t));
            window.requestAnimationFrame(launchDraw);
        } else {
            this.draw(datas, 1);
        }
    };
    window.requestAnimationFrame(launchDraw);
  }
  
  /**
   * Dessine le graphique
   * @param {number} progress 
   */
  _toggleElement (event) {
    if (!event.target.closest('.graph_legend button')) return;
    const elementLegend = event.target.closest('.graph_legend');
    const elementState = elementLegend.getAttribute("data-display");
    const elementIndex = parseInt(elementLegend.getAttribute("data-index"));
    const dataIndex = this.datas.find((element, index) => index === elementIndex);

    if (elementState === "true") {
      elementLegend.setAttribute("data-display", "false");
      dataIndex.display = false;
    } else if (elementState === "false") {
      elementLegend.setAttribute("data-display", "true");
      delete dataIndex.display;
    }

    const updatedData = this.datas.map((data, index) => {
      const newData = {...data};
      if (newData.display === false) {newData.value = 0;}
      return newData;
    });
    this.update(updatedData);
  }

  _events() {
    ['mouseenter','focus'].forEach( eventType => {
      this.nodes.svg.addEventListener(eventType, event => {
        if (event.target.matches('path')) {
          const id = event.target.getAttribute('aria-labelledby');
          const tt = document.getElementById(id);
          tt.classList.add('is-active');
        }
      }, true);
    });
      
    ['mouseleave','blur'].forEach( eventType => {
      this.nodes.donut.addEventListener(eventType, event => {
        const isPath = event.target.matches('path');
        const isTooltip = event.target.closest('.graph_tooltip');
        const isPathOut = event.relatedTarget ? event.relatedTarget.matches('path') : false;
        const isTooltipOut = event.relatedTarget ? event.relatedTarget.closest(".graph_tooltip") : false;
        if (isPath && !isTooltipOut) {
          const id = event.target.getAttribute('aria-labelledby');
          const tt = document.getElementById(id);
          tt.classList.remove('is-active');
        } else if (isTooltip && !isPathOut) {
          isTooltip.classList.remove('is-active');
        }
      }, true);
    });

    this.config.wrapper.addEventListener("click", event => {
      this._toggleElement(event);
    }, true);
  }

  init() {
    this.output.total = getTotalFromObjectKey(this.datas, 'value');
    this.output.percentages = getPercentageFromTotalOfObjectKey(this.datas, 'value', this.output.total);
    this._setTemplate();
    this._setPaths();
    this._setTooltips();
    this._setLegend();
    this.config.wrapper.appendChild(this.nodes.donut);
    this.config.wrapper.appendChild(this.nodes.legend);
    this.animate();
    this._events();
  }
}

// TODO: switch all class selectors for data-attributes & document a naming system.
// TODO: implement hooks with default for tooltips, legends etc.
// TODO: better way to define css variables
// TODO: make it exportable (call the css inside the svg ?)

export default GraphPie;
