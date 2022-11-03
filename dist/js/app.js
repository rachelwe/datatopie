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
function _calculateTicks(min, max, tickCount) {
  let span = max - min,
      step = Math.pow(10, Math.floor(Math.log(span / tickCount) / Math.LN10)),
      err = tickCount / span * step;

  // Filter ticks to get closer to the desired count.
  if (err <= .15) step *= 10;
  else if (err <= .35) step *= 5;
  else if (err <= .75) step *= 2;

  // Round start and stop values to step interval.
  let tstart = Math.ceil(min / step) * step,
      tstop = Math.floor(max / step) * step + step * .5,
      ticks = [];

  // now generate ticks
  for (let i = tstart; i < tstop; i += step) {
      ticks.push(i);  
  }

  return ticks;
}


function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
}

/** Class creating a graph. */
class Graph {
  /**
   * @param {node} node - Graph wrapper node, with a [data-graph] attribute
   * @param {object[]} datas - Array of datas as objects containing property and value
   * @param {object} config - Object listing all the config options
   */
  constructor(datas, config) {
    // Get the parameters
    this.datas = datas;
    this.config = config;

    // set new variables
    this.nodes = {};
    this.dimentions = {};
    this.legend = [];
    this.values = {};
    this.maxValue = {};
    this.percentages = {};
    this.scale = {
      "x": 100,
      "y": 80
    };
  }

  /**
   * Temporary debug
   */  
  debug() {
    console.log(this);
  }

  makeTemplate() {
    return `
      <svg class="graph" aria-labelledby="title">
        <title id="title">${this.config.mainTitle}</title>
        <g class="graph_legend" data-legend>
        </g>
        <g class="graph_data" data-datas>
        </g>
      </svg>
      <div class="graph_tooltips" data-tooltips></div>
    `;
  }

  

  /**
   * Take the data array of objects, separate the header (defined in config.legendKey) & make arrays of data
   */
   _dataAsArrays() {
    // Iterate data list
    this.datas.forEach(data => {

      // Turn object {key:value,...} into array of arrays [[key, value],...]
      // => iterate
      Object.entries(data).forEach(([entryKey, entryValues]) => {
        // Separate the legent from the values, 
        // push each one into its own array.
        if(entryKey === this.config.legendKey) {
          this.legend.push({
            "label": entryValues,
            "position": 0
          });
        } else {
          this.values[entryKey] = this.values[entryKey] || [];
          this.values[entryKey].push(entryValues);
        }
      });      
    });
  }

  /**
   * Get highest value from nested array
   */
  _getMaxValue() {
    let allvalues = [];
    Object.entries(this.values).forEach(([groupKey, groupValues]) => {
      allvalues.push(groupValues);
    });
    return Math.max(...[].concat(...allvalues));
  }

  /**
   * Transforming each value to a portion of the max one, for easier display
   */
   _generateRelativePosition() {
    this.percentages = {};
    // Max value inside the array
    this.maxValue = this._getMaxValue();
    Object.entries(this.values).forEach(([groupKey, groupValues]) => {
      this.percentages[groupKey] = [];

      groupValues.forEach(value => {
        this.percentages[groupKey].push(value / this.maxValue * 100);
      });
    });
  }

  /**
   * Transforming each value to it's percentage from total
   * Mainly used in pie charts
   */
  _generateProportions() {

  }

  _setViewbox(value) {
    this.nodes['svg'].setAttributeNS(null, 'viewBox', value);
  }

  _setEndGraph(value = 0) {
    if (!this.dimentions.endGraph) this.dimentions.endGraph = value;
    this.dimentions.endGraph = parseFloat(this.dimentions.endGraph) < value ? value : this.dimentions.endGraph;
    var bBox = this.nodes.svg.getBBox();
    // this._setViewbox(`0 0 ${this.dimentions.endGraph} 102`); 
    this._setViewbox(`0 0 ${bBox.width} ${bBox.height}`); 
    _setAttributesNS(this.nodes.svg, [
      {'width': bBox.width,
      'height': bBox.height}
    ]);
  }

  _setGridTranslate() {
    const bbox = _select('[data-labels="y"]').getBBox();
    const bboxDatas =  _select('[data-datas]').getBBox();
    _setAttributesNS(this.nodes.datas, [
      {'transform': `translate(${bbox.x * -1},10)`}
    ]);
    _setAttributesNS(this.nodes.legend, [
      {'transform': `translate(${bbox.x * -1},10)`}
    ]);
    this.config.wrapper.style.setProperty("--translate-left", bbox.x * -1);
    this.config.wrapper.style.setProperty("--translate-top", "10");
    this.config.wrapper.style.setProperty("--datas-width", bboxDatas.width);
    this.config.wrapper.style.setProperty("--datas-height", bboxDatas.height);
    // TODO: move the tooltips accordingly
  }

  _setPosition(element, index, group) {
    // position definition
    return {
      'x': index * (this.scale.x / (group.length - 1)),
      'y': this.scale.y - (this.scale.y / 100 * element)
    }
  }

  _setLinePoint(position) {
    // display in a line
    return position.x + ', ' + position.y + ' ';
  }

  _setPoint(position, index, parentNode, group) {
    // create a circle
    return _createSVGElement(parentNode, 'circle', [
      {'cx': position.x},
      {'cy': position.y},
      {'r': 4},
      {'tabindex': 0},
      {'role': 'img'},
      {'aria-labelledby': "graph_tooltip_" + group + index},
    ]);
  }

  _setTooltip(position, group, index) {
    const tooltipGroup = document.createElement('div');
    tooltipGroup.setAttribute('style', `--left: ${position.x}; --top: ${position.y}`);
    tooltipGroup.setAttribute('class', "graph_tooltip");
    tooltipGroup.setAttribute('id', "graph_tooltip_" + group + index);
    tooltipGroup.innerHTML = `
      <p>${this.legend[index].label}</p>
      <p>${group} ${this.values[group][index]}</p>
    `;
    return tooltipGroup;
  }

  _setLabelX(element, index, group) {
    const labelsWrapper = _select('[data-labels="x"]', this.nodes.svg);
    return _createSVGElement(labelsWrapper, 'text', [
      {'x': index * (this.scale.x / (group.length - 1))},
      {'y': this.dimentions.datas.height},
      {'transform': "rotate(-90, " + (index * (this.scale.x / (group.length - 1))) + ", " +  this.dimentions.datas.height + ")"},
    ], element.label)
  }

  addLine() {
    const svg = _select('[data-datas]',this.config.wrapper);
    Object.entries(this.percentages).forEach(([groupKey, groupValues], groupIndex) => {
      const Line = _createSVGElement(svg, 'polyline', [
        {'x': 0},
        {'y': 0},
        {'data-line': ''},
        {'aria-label': groupKey}
      ]);
  
      let linePoints = '';

      groupValues.forEach((element, index) => {
        const position = this._setPosition(element, index, groupValues);
        linePoints += this._setLinePoint(position);
        this._setPoint(position, index, svg, groupKey);       
        this.nodes.tooltips.appendChild(this._setTooltip(position, groupKey, index));
        this.legend[index].position = position.x;

        if (index == groupValues.length - 1) {this._setEndGraph(position.x);}
      });
      
      Line.setAttributeNS(null, 'points', linePoints);

      _setAttributesNS(Line, [
        {'stroke-dasharray': Line.getTotalLength()},
        {'stroke-dashoffset': Line.getTotalLength()},
        {'style': '--stroke-size: ' + Line.getTotalLength()},
      ]);
    });
  }
  _setGridTemplate() {
    const legendTemplate = `
      <g class="graph_grid graph_grid--x" id="xGrid" data-grid="x"></g>
      <g class="graph_grid graph_grid--y" id="yGrid" data-grid="y"></g>
      <g class="graph_labels graph_labels--x" data-labels="x"></g>
      <g class="graph_labels graph_labels--y" data-labels="y"></g>
    `;

    this.nodes.legend.innerHTML = legendTemplate;
  }
  _setDimentions() {
    const wrapperBBox = this.config.wrapper.getBoundingClientRect();
    const svgBBox = this.nodes.svg.getBBox();
    const datasBBox = this.nodes.datas.getBBox();
    const labelsYBBox = _select('[data-labels="y"]', this.nodes.svg).getBBox();
    const labelsXBBox = _select('[data-labels="x"]', this.nodes.svg).getBBox();

    this.dimentions = {
      "wrapper": wrapperBBox,
      "graph" : svgBBox,
      "datas" : datasBBox,
      "labelsY" : labelsYBBox,
      "labelsX" : labelsXBBox,
    };
  }
  _setLegendY() {
    let labelsYValues = _calculateTicks(0, this.maxValue, 6);

    labelsYValues.forEach((label, index) => {
      // point definition

      _createSVGElement(_select('[data-labels="y"]', this.nodes.svg), 'text', [
        {'x': -10},
        {'y': 0},
        {'data-update': index}
      ], label);
    });

    _createSVGElement(_select('[data-labels="y"]', this.nodes.svg), 'text', [
      {'x': -10},
      {'y': 0},
      {'class': 'label-title'},
    ], this.config.titleY);

    this._setDimentions();
    this.scale.x = this.dimentions.wrapper.width + this.dimentions.labelsY.x;

    return labelsYValues;
  }
  _setLegendX() {
    this.legend.forEach((label, index) => {
      this._setLabelX(label, index, this.legend);
    });

    _createSVGElement(_select('[data-labels="x"]', this.nodes.svg), 'text', [
      {'x': (this.scale.x / 2)},
      {'y': this.dimentions.datas.height + _select('[data-labels="x"]').getBBox().height + 20},
      {'class': 'label-title'},
    ], this.config.titleX);

    this._setDimentions();
    this.scale.y = this.dimentions.wrapper.height - this.dimentions.labelsX.height - 10;
    
    _createSVGElement(_select('[data-grid="x"]', this.nodes.svg), 'line', [
      {'x1': 0},
      {'x2': 0},
      {'y1': 0},
      {'y2': this.scale.y},
    ]);

    _setAttributesNS(_select('[data-labels="x"]'), [
      {'transform': `translate(0,${this.scale.y + 10})`}
    ]);
  }
  addGrid() {
    const legendY = this._setLegendY();
    this._setLegendX();

    let labelsYPositions = [];
    legendY.forEach(labelValue => {
      labelsYPositions.push(labelValue / this.maxValue * this.scale.y);
    });

    labelsYPositions.forEach((position, index) => {
      // point definition
      const positionY = position;
      const Ywrapper = _select('[data-labels="y"]');

      _setAttributesNS(_select(`[data-update="${index}"]`, Ywrapper), [
        {'y': 0 + (this.scale.y - positionY)}
      ]);
      
      _createSVGElement(_select('[data-grid="y"]', this.nodes.svg), 'line', [
        {'x1': 0},
        {'x2': this.scale.x},
        {'y1': 0 + (this.scale.y - positionY)},
        {'y2': 0 + (this.scale.y - positionY)},
      ]);
    });
    
    this._setEndGraph();
  }
  addPie() {}
  addColumns() {}
  updateLine() {}
  updateGrid() {}

  _events() {
    ['mouseenter','focus'].forEach( eventType => {
      this.nodes.svg.addEventListener(eventType, event => {
        if (eventType == 'focus') event.target.classList.add('is-focused');
        if (event.target.matches('circle')) {
          const id = event.target.getAttribute('aria-labelledby');
          const tt = document.getElementById(id);
          tt.classList.add('is-active');
        }
      }, true);
    });
      
    ['mouseleave','blur'].forEach( eventType => {
      this.nodes.svg.addEventListener(eventType, event => {
        if (eventType == 'blur') event.target.classList.remove('is-focused');
        if (event.target.matches('circle')) {
          const id = event.target.getAttribute('aria-labelledby');
          const tt = document.getElementById(id);
          
          if (!event.target.classList.contains('is-focused')) {tt.classList.remove('is-active');}
          
        }
      }, true);
    });
  }

  init() {
    this.config.wrapper.innerHTML = this.makeTemplate();
    this.nodes['svg'] = _select('svg', this.config.wrapper);
    this.nodes['legend'] = _select('[data-legend]', this.config.wrapper);
    this.nodes['datas'] = _select('[data-datas]', this.config.wrapper);
    this.nodes['tooltips'] = _select('[data-tooltips]', this.config.wrapper);
    this._setEndGraph();
    this._dataAsArrays();
    this._generateRelativePosition();
    this._setGridTemplate();
    this._setDimentions();
    this.addGrid();
    this._setDimentions();
    this.addLine();
    this._setGridTranslate();
    this._events();
  }
}

class GraphLine extends Graph {
  constructor(node, datas, config) {
    super(node, datas, config);
  }
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
          <g class="graph_data" data-datas data-hide="" mask="url(#graphMask)">
          </g>
          <mask id="graphMask">
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
    label.style.setProperty('top', `${(point.y * 0.5 + 0.5) * 100}%`);
    label.style.setProperty('left', `${(point.x * 0.5 + 0.5) * 100}%`);
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

new GraphLine({}, {});

const pieChart = {
  "config": {
    "mainTitle": "A very simple pie chart about vegan diet",
    "legendKey": "label",
    "wrapper": document.querySelector('[data-graph="pie"]'),
    "id": Date.now(),
    "donut": 0.8,
    "unite": "parts",
    "legend" : {
      "hideButton": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M2.1 12a18.7 18.7 0 0 0 2.5 3.3A10 10 0 0 0 12 19c3.1 0 5.6-1.8 7.4-3.7a18.7 18.7 0 0 0 2.5-3.3 18.7 18.7 0 0 0-2.5-3.3A10 10 0 0 0 12 5C8.9 5 6.4 6.8 4.6 8.7A18.7 18.7 0 0 0 2.1 12zM23 12l.9-.4a10.6 10.6 0 0 0-.2-.4 20.7 20.7 0 0 0-2.8-3.9c-2-2-5-4.3-8.9-4.3-3.9 0-6.9 2.2-8.9 4.3a20.7 20.7 0 0 0-2.8 3.9 12.4 12.4 0 0 0-.2.3s0 0 .9.5l-.9-.4a1 1 0 0 0 0 .8L1 12l-.9.4a8.3 8.3 0 0 0 .2.4 20.7 20.7 0 0 0 2.8 3.9c2 2 5 4.3 8.9 4.3 3.9 0 6.9-2.2 8.9-4.3a20.7 20.7 0 0 0 2.8-3.9 11.8 11.8 0 0 0 .2-.3s0 0-.9-.5zm0 0 .9.4a1 1 0 0 0 0-.8l-.9.4z" clip-rule="evenodd"/><path fill-rule="evenodd" d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-4 2a4 4 0 1 1 8 0 4 4 0 0 1-8 0z" clip-rule="evenodd"/></svg>'
    },
    "displayTotal": true
  },
  "data": [
    {
      "label": "Legumes",
      "value": 3,
      "color": "blue"
    },
    {
      "label": "Grains",
      "value": 5,
      "color": "peru"
    },
    {
      "label": "Fruits",
      "value": 2,
      "color": "red"
    },
    {
      "label": "Nuts, oil",
      "value": 1,
      "color": "yellow"
    },
    {
      "label": "Vegetables",
      "value": 4,
      "color": "green"
    }
  ]
};

const pieChart2 = {"config": {
  "mainTitle": "A very simple pie chart about vegan diet",
  "legendKey": "label",
  "wrapper": document.querySelector('[data-graph="pie-compact"]'),
  "id": performance.now(),
  "donut": 0.8,
  "unite": "parts",
  "legend" : {
    "hideButton": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M2.1 12a18.7 18.7 0 0 0 2.5 3.3A10 10 0 0 0 12 19c3.1 0 5.6-1.8 7.4-3.7a18.7 18.7 0 0 0 2.5-3.3 18.7 18.7 0 0 0-2.5-3.3A10 10 0 0 0 12 5C8.9 5 6.4 6.8 4.6 8.7A18.7 18.7 0 0 0 2.1 12zM23 12l.9-.4a10.6 10.6 0 0 0-.2-.4 20.7 20.7 0 0 0-2.8-3.9c-2-2-5-4.3-8.9-4.3-3.9 0-6.9 2.2-8.9 4.3a20.7 20.7 0 0 0-2.8 3.9 12.4 12.4 0 0 0-.2.3s0 0 .9.5l-.9-.4a1 1 0 0 0 0 .8L1 12l-.9.4a8.3 8.3 0 0 0 .2.4 20.7 20.7 0 0 0 2.8 3.9c2 2 5 4.3 8.9 4.3 3.9 0 6.9-2.2 8.9-4.3a20.7 20.7 0 0 0 2.8-3.9 11.8 11.8 0 0 0 .2-.3s0 0-.9-.5zm0 0 .9.4a1 1 0 0 0 0-.8l-.9.4z" clip-rule="evenodd"/><path fill-rule="evenodd" d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-4 2a4 4 0 1 1 8 0 4 4 0 0 1-8 0z" clip-rule="evenodd"/></svg>',
    "content": (data, index) => {return ` <div class="graph_legend_label">
    <p id="${pieChart2.config.id + '-legend-meter-' + index}">${data.label}</p>
    </div>
    <button data-toggle>${pieChart2.config.legend.hideButton}</button>`}
  },
  "displayTotal": true
},
"data": [
  {
    "label": "Legumes",
    "value": 3,
    "color": "blue"
  },
  {
    "label": "Grains",
    "value": 5,
    "color": "peru"
  },
  {
    "label": "Fruits",
    "value": 2,
    "color": "red"
  },
  {
    "label": "Nuts, oil",
    "value": 1,
    "color": "yellow"
  },
  {
    "label": "Vegetables",
    "value": 4,
    "color": "green"
  }
]};

const graphPie = new GraphPie(pieChart.data, pieChart.config);
graphPie.init();
graphPie.debug();

const graphPie2 = new GraphPie(pieChart2.data, pieChart2.config);
graphPie2.init();
graphPie2.debug();
