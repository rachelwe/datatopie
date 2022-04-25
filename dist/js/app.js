(function () {
  'use strict';

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

  function _tableToJson(table) { 
    let header = {
      "x": table.rows[0].cells[0].innerHTML,
      "y": table.rows[0].cells[1].innerHTML
    };

    let datas = [];
    for (var i=1; i<table.rows.length; i++) { 
      var tableRow = table.rows[i]; 
      var rowData = {
        "x": tableRow.cells[0].innerHTML,
        "y": tableRow.cells[1].innerHTML
      };
      datas.push(rowData);
    }

    return [header, datas];
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
    console.log(atts);
  	atts.forEach(function (attribute) {
      attribute = Object.entries(attribute)[0];
  		elem.setAttributeNS(null, attribute[0], attribute[1]);
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

  // Debounce
  function _debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
  }

  /** Class creating a graph. */
  class Graph {
    /**
     * @param {node} node - Graph wrapper node, with a [data-graph] attribute
     * @param {object[]} datas - Array of datas as objects containing property and value
     * @param {object} config - Object listing all the config options
     */
    constructor(node, datas, config) {
      this.node = node;
      this.datas = datas;
      this.config = config;
      this.template = `<title id="title">${this.config.mainTitle}</title>`;

      // Get the graph elements
      this.svgGraph = node;
      this.svgGraphInner = _select('svg', this.svgGraph);
      this.tooltips = _select('[data-tooltips]', this.svgGraph);
      this.toggle = _select('[data-graph-toggle]', this.svgGraph);
      this.svgDatasWrapper;
      this.svgLine;
      this.svgLabelsX;
      this.svgLabelsY;
      this.svgGridX;
      this.svgGridY;
      this.points = "";
      this.positions = [];
      this.values = [];
      this.maxValue = 0;
    }

    /**
     * Temporary debug
     */  
    debug() {
      console.log(this);
    }

    /**
     * Transforming each value to a portion of the max one, for easier display
     */
    generateRelativePosition() {
      this.positions = [];
      this.values = [];
      // all the values in an array
      this.datas.forEach(data => {this.values.push(data.y);});
      // Max value inside the array
      this.maxValue = Math.max(...this.values);
      this.values.forEach(value => {this.positions.push(value / this.maxValue * this.config.scaleY);});
    }

    /**
     * Append in the graph
     */
    setPoints() {
      this.positions.forEach((element, index) => {
        // point definition
        const position = {
          'x': this.config.startGraph + index * this.config.scaleX,
          'y': this.config.offsetY + (this.config.scaleY - element)
        };

        // display in a line
        this.points += position.x + ', ' + position.y + ' ';
        this.svgLine.setAttributeNS(null, 'points', this.points);

        // append the circles
        _createSVGElement(this.svgDatasWrapper, 'circle', [
          {'cx': position.x},
          {'cy': position.y},
          {'r': 4},
          {'tabindex': 0},
          {'role': 'img'},
          {'aria-labelledby': "graph_tooltip" + index},
          {'data-value': this.values[index]},
        ]);

        _createSVGElement(this.svgLabelsX, 'text', [
          {'x': position.x},
          {'y': this.config.offsetY + this.config.scaleY + 20},
          {'transform': "rotate(-45, " + position.x + ", " + (this.config.offsetY + this.config.scaleY + 20) + ")"},
        ], this.datas[index].x);


        const tooltipGroup = document.createElement('div');
        tooltipGroup.setAttribute('style', `left: ${position.x - 15}px; top: ${position.y  - 65}px`);
        tooltipGroup.setAttribute('class', "graph_tooltip");
        tooltipGroup.setAttribute('id', "graph_tooltip" + index);
        tooltipGroup.innerHTML = `
        <p>${this.datas[index].x}</p>
        <p>${this.datas[index].y} €</p>
      `;
        this.tooltips.appendChild(tooltipGroup);

        // end graph position
        if (index = this.positions.length - 1) {
          this.config.endGraph = position.x;
          _setAttributesNS(this.svgLine, [
            {'stroke-dasharray': this.svgLine.getTotalLength()},
            {'stroke-dashoffset': this.svgLine.getTotalLength()},
            {'style': '--stroke-size: ' + this.svgLine.getTotalLength()},
          ]);
        }      
        
      });
    }

    /**
     * Set the legend
     */
    setLegend() {

      _createSVGElement(this.svgGridX, 'line', [
        {'x1': this.config.startGraph},
        {'x2': this.config.startGraph},
        {'y1': this.config.offsetY},
        {'y2': this.config.offsetY + (this.config.scaleY)},
      ]);

      _createSVGElement(this.svgLabelsX, 'text', [
        {'x': (this.config.endGraph / 2) + (this.config.startGraph / 2)},
        {'y': this.config.scaleY + this.config.labelsSizeX + this.config.offsetY / 2},
        {'class': 'label-title'},
      ], this.config.titleX);

      // Append Y label
      let labelsYValues = _calculateTicks(0, this.maxValue, 6);
      console.log(labelsYValues, this.maxValue);

      let labelsYPositions = [];
      labelsYValues.forEach(labelValue => {
        labelsYPositions.push(labelValue / this.maxValue * this.config.scaleY);
      });


      labelsYPositions.forEach((position, index) => {
        // point definition
        const positionY = position;

        _createSVGElement(this.svgLabelsY, 'text', [
          {'x': this.config.startGraph - 10},
          {'y': this.config.offsetY + (this.config.scaleY - positionY)},
        ], labelsYValues[index]);
        
        _createSVGElement(this.svgGridY, 'line', [
          {'x1': this.config.startGraph},
          {'x2': this.config.endGraph},
          {'y1': this.config.offsetY + (this.config.scaleY - positionY)},
          {'y2': this.config.offsetY + (this.config.scaleY - positionY)},
        ]);
      });

      _createSVGElement(this.svgLabelsY, 'text', [
        {'x': this.config.startGraph - 10},
        {'y': this.config.offsetY / 2},
        {'class': 'label-title'},
      ], this.config.titleY);
      
    }

    /**
     * Define Graph size
     */
    setGraphSize() {
      const graphWidth = this.config.endGraph + 10;
      const graphHeight = this.config.scaleY + this.config.labelsSizeX + this.config.offsetY;
      _setAttributesNS(this.svgGraphInner, [
        {'viewBox': '0 0 ' + graphWidth + ' ' + graphHeight},
        {'width': graphWidth},
        {'height': graphHeight},
      ]);
      this.svgGraph.style.setProperty('--graph-width', graphWidth + 'px');
    }


    /**
     * manual responsivness
     * TODO: add resize event listener
     */
    setBreakpoints() {
      if  (window.matchMedia(`(max-width: 400px)`).matches) {
        this.config.scaleX = 20;
        this.config.scaleY = 60;
      } else if (window.matchMedia(`(max-width: 700px) and (min-width: 401px)`).matches) {
        this.config.scaleX = 35;
        this.config.scaleY = 100;
      } else {
        this.config.scaleX = 50;
        this.config.scaleY = 150;
      }
    }

    /**
     * Events
     */
    events() {
      window.addEventListener("resize", _debounce( this.draw(), 200 ));
      // Display the tooltips (with event delegation please)
      ['mouseenter','focus'].forEach( eventType => {
        this.svgGraphInner.addEventListener(eventType, event => {
          if (eventType == 'focus') event.target.classList.add('is-focused');
          if (event.target.matches('circle')) {
            const id = event.target.getAttribute('aria-labelledby');
            const tt = document.getElementById(id);
            tt.classList.add('is-active');
          }
        }, true);
      });
        
      ['mouseleave','blur'].forEach( eventType => {
        this.svgGraphInner.addEventListener(eventType, event => {
          if (eventType == 'blur') event.target.classList.remove('is-focused');
          if (event.target.matches('circle')) {
            const id = event.target.getAttribute('aria-labelledby');
            const tt = document.getElementById(id);
            
            if (!event.target.classList.contains('is-focused')) {tt.classList.remove('is-active');}
            
          }
        }, true);
      });


      this.toggle.addEventListener("click", () => {
        const togglable = document.querySelectorAll('[data-toggle-state]');
        togglable.forEach( element => {
          const state = element.getAttribute('data-toggle-state');
          let toggleName = element.getAttribute('data-toggle-name');
          if (state == 'true') {this.toggle.innerHTML = "affichage " + toggleName;}
          element.setAttribute('data-toggle-state', state == 'true' ? false : true);
        });
      });
    }


    // Make it responsive on resize WIP
    // Function to draw the graph : reset previous values & generate new ones
    // it's meh, but working !
    // TODO: draw again only when size change.
    /**
     * Draw the graph
     */
    draw() {
      this.points = 0;
      this.positions = [];
      this.svgGraphInner.innerHTML = this.template;
      this.tooltips.innerHTML = '';
      this.svgDatasWrapper = _select('[data-datas]', this.svgGraph);
      this.svgLine = _select('[data-line]', this.svgGraph);
      this.svgLabelsX = _select('[data-labels="x"]', this.svgGraph);
      this.svgLabelsY = _select('[data-labels="y"]', this.svgGraph);
      this.svgGridX = _select('[data-grid="x"]', this.svgGraph);
      this.svgGridY = _select('[data-grid="y"]', this.svgGraph);

      this.setBreakpoints();
      this.generateRelativePosition();
      this.setPoints();
      this.setLegend();
      this.setGraphSize();
    }


  }

  class GraphLine extends Graph {
    constructor(node, data, config) {
      super(node, data, config);
      this.template = `
    <title id="title">${this.config.mainTitle}</title>
    <g class="graph_grid graph_grid--x" id="xGrid" data-grid="x"></g>
    <g class="graph_grid graph_grid--y" id="yGrid" data-grid="y"></g>
    <g class="graph_labels graph_labels--x" data-labels="x"></g>
    <g class="graph_labels graph_labels--y" data-labels="y"></g>
    <g class="graph_data" data-datas>
      <polyline data-line points="" />
    </g>
    `;
    }
  }

  // TODO : Use proxies to update only the necessary parts when the data or the config change.
  const node = _select('[data-graph]');
  const table = _select('[data-graph-table]');
  let [header, datas] = _tableToJson(table);

  let config = {
    "mainTitle": "A very simple line chart about income",
    "titleY": header.y,
    "titleX": header.x,
    "labelsSizeY": 55,
    "labelsSizeX": 120,
    "scaleY": 150,
    "scaleX": 50,
    "startGraph": 65,
    "endGraph": 0, // dynamically set
    "offsetY": 35
  };

  const graphline = new GraphLine(node, datas, config);
  graphline.debug();
  graphline.draw();
  graphline.events();

}());
