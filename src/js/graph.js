import { _createSVGElement, _select, _setAttributesNS } from "./helpers/dom";
import { _calculateTicks } from "./helpers/draw";

/** Class creating a graph. */
export default class Graph {
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
    this.nodes = {}
    this.dimentions = {}
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
      })      
    })
  }

  /**
   * Get highest value from nested array
   */
  _getMaxValue() {
    let allvalues = []
    Object.entries(this.values).forEach(([groupKey, groupValues]) => {
      allvalues.push(groupValues);
    })
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
        this.percentages[groupKey].push(value / this.maxValue * 100)
      })
    })
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
    if (!this.dimentions.endGraph) this.dimentions.endGraph = value
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
    ])
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
      ])
  
      let linePoints = '';

      groupValues.forEach((element, index) => {
        const position = this._setPosition(element, index, groupValues)
        linePoints += this._setLinePoint(position);
        const circle = this._setPoint(position, index, svg, groupKey);       
        this.nodes.tooltips.appendChild(this._setTooltip(position, groupKey, index));
        this.legend[index].position = position.x;

        if (index == groupValues.length - 1) {this._setEndGraph(position.x)}
      });
      
      Line.setAttributeNS(null, 'points', linePoints);

      _setAttributesNS(Line, [
        {'stroke-dasharray': Line.getTotalLength()},
        {'stroke-dashoffset': Line.getTotalLength()},
        {'style': '--stroke-size: ' + Line.getTotalLength()},
      ])
    })
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
    }
  }
  _setLegendY() {
    let labelsYValues = _calculateTicks(0, this.maxValue, 6);

    labelsYValues.forEach((label, index) => {
      // point definition

      const labelY = _createSVGElement(_select('[data-labels="y"]', this.nodes.svg), 'text', [
        {'x': -10},
        {'y': 0},
        {'data-update': index}
      ], label);
    })

    const labelYMaster = _createSVGElement(_select('[data-labels="y"]', this.nodes.svg), 'text', [
      {'x': -10},
      {'y': 0},
      {'class': 'label-title'},
    ], this.config.titleY);

    this._setDimentions();
    this.scale.x = this.dimentions.wrapper.width + this.dimentions.labelsY.x

    return labelsYValues;
  }
  _setLegendX() {
    this.legend.forEach((label, index) => {
      this._setLabelX(label, index, this.legend);
    })

    const labelXMaster = _createSVGElement(_select('[data-labels="x"]', this.nodes.svg), 'text', [
      {'x': (this.scale.x / 2)},
      {'y': this.dimentions.datas.height + _select('[data-labels="x"]').getBBox().height + 20},
      {'class': 'label-title'},
    ], this.config.titleX)

    this._setDimentions();
    this.scale.y = this.dimentions.wrapper.height - this.dimentions.labelsX.height - 10;
    
    const lineX = _createSVGElement(_select('[data-grid="x"]', this.nodes.svg), 'line', [
      {'x1': 0},
      {'x2': 0},
      {'y1': 0},
      {'y2': this.scale.y},
    ]);

    _setAttributesNS(_select('[data-labels="x"]'), [
      {'transform': `translate(0,${this.scale.y + 10})`}
    ])
  }
  addGrid() {
    const legendY = this._setLegendY();
    this._setLegendX();

    let labelsYPositions = [];
    legendY.forEach(labelValue => {
      labelsYPositions.push(labelValue / this.maxValue * this.scale.y)
    })

    labelsYPositions.forEach((position, index) => {
      // point definition
      const positionY = position;
      const Ywrapper = _select('[data-labels="y"]');

      _setAttributesNS(_select(`[data-update="${index}"]`, Ywrapper), [
        {'y': 0 + (this.scale.y - positionY)}
      ]);
      
      const lineY = _createSVGElement(_select('[data-grid="y"]', this.nodes.svg), 'line', [
        {'x1': 0},
        {'x2': this.scale.x},
        {'y1': 0 + (this.scale.y - positionY)},
        {'y2': 0 + (this.scale.y - positionY)},
      ])
    })
    
    this._setEndGraph();
  }
  addPie() {}
  addColumns() {}
  updateLine() {}
  updateGrid() {}

  _events() {
    ['mouseenter','focus'].forEach( eventType => {
      this.nodes.svg.addEventListener(eventType, event => {
        if (eventType == 'focus') event.target.classList.add('is-focused')
        if (event.target.matches('circle')) {
          const id = event.target.getAttribute('aria-labelledby');
          const tt = document.getElementById(id);
          tt.classList.add('is-active');
        }
      }, true)
    });
      
    ['mouseleave','blur'].forEach( eventType => {
      this.nodes.svg.addEventListener(eventType, event => {
        if (eventType == 'blur') event.target.classList.remove('is-focused')
        if (event.target.matches('circle')) {
          const id = event.target.getAttribute('aria-labelledby');
          const tt = document.getElementById(id);
          
          if (!event.target.classList.contains('is-focused')) {tt.classList.remove('is-active');}
          
        }
      }, true)
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