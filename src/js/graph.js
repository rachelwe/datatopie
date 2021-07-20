import { setAttributesNS, createSVGElement, calculateTicks, _select, debounce } from "./helpers/utility";

export default class Graph {
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
  
  debug() {console.log(this);}

  
  // Transforming each value to a percentage of the max one, for easier display
  generateRelativePosition() {
    this.positions = [];
    this.values = []
    // all the values in an array
    this.datas.forEach(data => {this.values.push(data.y)});
    // Max value inside the array
    this.maxValue = Math.max(...this.values);
    this.values.forEach(value => {this.positions.push(value / this.maxValue * this.config.scaleY)})
  }

  // Append in the graph
  setPoints() {
    this.positions.forEach((percentage, index) => {
      // point definition
      const position = {
        'x': this.config.startGraph + index * this.config.scaleX,
        'y': this.config.offsetY + (this.config.scaleY - percentage)
      }

      // display in a line
      this.points += position.x + ', ' + position.y + ' ';
      this.svgLine.setAttributeNS(null, 'points', this.points);

      // append the circles
      const circle = createSVGElement(this.svgDatasWrapper, 'circle', [
        {'cx': position.x},
        {'cy': position.y},
        {'r': 4},
        {'tabindex': 0},
        {'role': 'img'},
        {'aria-labelledby': "graph_tooltip" + index},
        {'data-value': this.values[index]},
      ])

      const labelX = createSVGElement(this.svgLabelsX, 'text', [
        {'x': position.x},
        {'y': this.config.offsetY + this.config.scaleY + 20},
        {'transform': "rotate(-45, " + position.x + ", " + (this.config.offsetY + this.config.scaleY + 20) + ")"},
      ], this.datas[index].x)


      const tooltipGroup = document.createElement('div');
      tooltipGroup.setAttribute('style', `left: ${position.x - 15}px; top: ${position.y  - 65}px`);
      tooltipGroup.setAttribute('class', "graph_tooltip");
      tooltipGroup.setAttribute('id', "graph_tooltip" + index);
      tooltipGroup.innerHTML = `
        <p>${this.datas[index].x}</p>
        <p>${this.datas[index].y} €</p>
      `
      this.tooltips.appendChild(tooltipGroup);

      // end graph position
      if (index = this.positions.length - 1) {
        this.config.endGraph = position.x;
        setAttributesNS(this.svgLine, [
          {'stroke-dasharray': this.svgLine.getTotalLength()},
          {'stroke-dashoffset': this.svgLine.getTotalLength()},
          {'style': '--stroke-size: ' + this.svgLine.getTotalLength()},
        ])
      };
      
      
    })
  }

  setLegend() {

    const lineX = createSVGElement(this.svgGridX, 'line', [
      {'x1': this.config.startGraph},
      {'x2': this.config.startGraph},
      {'y1': this.config.offsetY},
      {'y2': this.config.offsetY + (this.config.scaleY)},
    ])

    const labelXMaster = createSVGElement(this.svgLabelsX, 'text', [
      {'x': (this.config.endGraph / 2) + (this.config.startGraph / 2)},
      {'y': this.config.scaleY + this.config.labelsSizeX + this.config.offsetY / 2},
      {'class': 'label-title'},
    ], this.config.titleX)

    // Append Y label
    let labelsYValues = calculateTicks(0, this.maxValue, 6);

    let labelsYPositions = [];
    labelsYValues.forEach(labelValue => {
      labelsYPositions.push(labelValue / this.maxValue * this.config.scaleY)
    })


    labelsYPositions.forEach((position, index) => {
      // point definition
      const positionY = position;

      const labelY = createSVGElement(this.svgLabelsY, 'text', [
        {'x': this.config.startGraph - 10},
        {'y': this.config.offsetY + (this.config.scaleY - positionY)},
      ], labelsYValues[index]);
      
      const lineY = createSVGElement(this.svgGridY, 'line', [
        {'x1': this.config.startGraph},
        {'x2': this.config.endGraph},
        {'y1': this.config.offsetY + (this.config.scaleY - positionY)},
        {'y2': this.config.offsetY + (this.config.scaleY - positionY)},
      ])
    })

    const labelYMaster = createSVGElement(this.svgLabelsY, 'text', [
      {'x': this.config.startGraph - 10},
      {'y': this.config.offsetY / 2},
      {'class': 'label-title'},
    ], this.config.titleY);
    
  }

  setGraphSize() {
    const graphWidth = this.config.endGraph + 10;
    const graphHeight = this.config.scaleY + this.config.labelsSizeX + this.config.offsetY;
    setAttributesNS(this.svgGraphInner, [
      {'viewBox': '0 0 ' + graphWidth + ' ' + graphHeight},
      {'width': graphWidth},
      {'height': graphHeight},
    ]);
    this.svgGraph.style.setProperty('--graph-width', graphWidth + 'px');
  }


  // manual responsivness
  // TODO : add resize event listener
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

  events() {
    window.addEventListener("resize", debounce( this.draw(), 200 ));
    // Display the tooltips (with event delegation please)
    ['mouseenter','focus'].forEach( eventType => {
      this.svgGraphInner.addEventListener(eventType, event => {
        if (eventType == 'focus') event.target.classList.add('is-focused')
        if (event.target.matches('circle')) {
          const id = event.target.getAttribute('aria-labelledby');
          const tt = document.getElementById(id);
          tt.classList.add('is-active');
        }
      }, true)
    });
      
    ['mouseleave','blur'].forEach( eventType => {
      this.svgGraphInner.addEventListener(eventType, event => {
        if (eventType == 'blur') event.target.classList.remove('is-focused')
        if (event.target.matches('circle')) {
          const id = event.target.getAttribute('aria-labelledby');
          const tt = document.getElementById(id);
          
          if (!event.target.classList.contains('is-focused')) {tt.classList.remove('is-active');}
          
        }
      }, true)
    });


    this.toggle.addEventListener("click", () => {
      const togglable = document.querySelectorAll('[data-toggle-state]');
      togglable.forEach( element => {
        const state = element.getAttribute('data-toggle-state');
        let toggleName = element.getAttribute('data-toggle-name');
        if (state == 'true') {this.toggle.innerHTML = "affichage " + toggleName;}
        element.setAttribute('data-toggle-state', state == 'true' ? false : true)
      })
    })
  }


  // Make it responsive on resize WIP
  // Function to draw the graph : reset previous values & generate new ones
  // it's meh, but working !
  // TODO: draw again only when size change.
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
    this.setPoints()
    this.setLegend()
    this.setGraphSize()
  }


}


