// this chart is a work in progress
// It can be refactored A LOT
// IDEA : Une proxies to update only the necessary parts when the data or the config change.
let datas = [];
let header = []
const svgTable = document.querySelector('[data-graph-table]');

function tableToJson(table) { 
  header = {
    "x": table.rows[0].cells[0].innerHTML,
    "y": table.rows[0].cells[1].innerHTML
  }
  
  for (var i=1; i<table.rows.length; i++) { 
    var tableRow = table.rows[i]; 
    var rowData = {
      "x": tableRow.cells[0].innerHTML,
      "y": tableRow.cells[1].innerHTML
    }
    datas.push(rowData);
  }
}
tableToJson(svgTable)

let config = {
  "titleY": header.y,
  "titleX": header.x,
  "labelsSizeY": 55,
  "labelsSizeX": 120,
  "scaleY": 150,
  "scaleX": 50,
  "startGraph": 65,
  "endGraph": 0, // dynamically set
  "offsetY": 35
}

const template = `
  <title id="title">A very simple line chart about income</title>
  <g class="graph_grid graph_grid--x" id="xGrid" data-grid="x"></g>
  <g class="graph_grid graph_grid--y" id="yGrid" data-grid="y"></g>
  <g class="graph_labels graph_labels--x" data-labels="x"></g>
  <g class="graph_labels graph_labels--y" data-labels="y"></g>
  <g class="graph_data" data-datas>
    <polyline data-line points="" />
  </g>
  `;

const svgns = "http://www.w3.org/2000/svg";


// Get the graph elements
const svgGraph = document.querySelector('[data-graph]');
const svgGraphInner = svgGraph.querySelector('svg');
const tooltips = svgGraph.querySelector('[data-tooltips]');
const toggle = svgGraph.querySelector('[data-graph-toggle]');
let svgDatasWrapper;
let svgLine;
let svgLabelsX;
let svgLabelsY;
let svgGridX;
let svgGridY;
let points = "";
let percentages = [];


// all the values in an array
let values = [];
datas.forEach(data => {values.push(data.y)});

// Max value inside the array
let maxValue = Math.max(...values);

// Transforming each value to a percentage of the max one, for easier display
function generateRelativePosition() {
  values.forEach(value => {percentages.push(value / maxValue * config.scaleY)})
}

// Append in the graph
function setPoints() {
  percentages.forEach((percentage, index) => {
    // point definition
    const position = {
      'x': config.startGraph + index * config.scaleX,
      'y': config.offsetY + (config.scaleY - percentage)
    }

    // display in a line
    points += position.x + ', ' + position.y + ' ';
    svgLine.setAttributeNS(null, 'points', points);

    // append the circles
    const circle = document.createElementNS(svgns, 'circle');
    setAttributesNS(circle, [
      {'cx': position.x},
      {'cy': position.y},
      {'r': 4},
      {'tabindex': 0},
      {'role': 'img'},
      {'aria-labelledby': "graph_tooltip" + index},
      {'data-value': values[index]},
    ])
    svgDatasWrapper.appendChild(circle);

    const labelX = document.createElementNS(svgns, 'text');
    setAttributesNS(labelX, [
      {'x': position.x},
      {'y': config.offsetY + config.scaleY + 20},
      {'transform': "rotate(-45, " + position.x + ", " + (config.offsetY + config.scaleY + 20) + ")"},
    ]);
    labelX.textContent = datas[index].x;
    svgLabelsX.appendChild(labelX);

    const tooltipGroup = document.createElement('div');
    tooltipGroup.setAttribute('style', `left: ${position.x - 15}px; top: ${position.y  - 65}px`);
    tooltipGroup.setAttribute('class', "graph_tooltip");
    tooltipGroup.setAttribute('id', "graph_tooltip" + index);
    tooltipGroup.innerHTML = `
      <p>${datas[index].x}</p>
      <p>${datas[index].y} €</p>
    `
    tooltips.appendChild(tooltipGroup);

    // end graph position
    if (index = percentages.length - 1) {
      config.endGraph = position.x;
      setAttributesNS(svgLine, [
        {'stroke-dasharray': svgLine.getTotalLength()},
        {'stroke-dashoffset': svgLine.getTotalLength()},
        {'style': '--stroke-size: ' + svgLine.getTotalLength()},
      ])
    };
    
    
  })
}

function setLegend() {
  const lineX = document.createElementNS(svgns, 'line');
  setAttributesNS(lineX, [
      {'x1': config.startGraph},
      {'x2': config.startGraph},
      {'y1': config.offsetY},
      {'y2': config.offsetY + (config.scaleY)},
    ]);
  svgGridX.appendChild(lineX);  

  const labelXMaster = document.createElementNS(svgns, 'text');
  setAttributesNS(labelXMaster, [
    {'x': (config.endGraph / 2) + (config.startGraph / 2)},
    {'y': config.scaleY + config.labelsSizeX + config.offsetY / 2},
    {'class': 'label-title'},
  ]);
  labelXMaster.textContent = config.titleX;
  svgLabelsX.appendChild(labelXMaster);

  // Append Y label
  let labelsYValues = calculateTicks(0, maxValue, 6);

  let labelsYPositions = [];
  labelsYValues.forEach(labelValue => {
    labelsYPositions.push(labelValue / maxValue * config.scaleY)
  })


  labelsYPositions.forEach((position, index) => {
    // point definition
    const positionY = position;

    const labelY = document.createElementNS(svgns, 'text');
    setAttributesNS(labelY, [
      {'x': config.startGraph - 10},
      {'y': config.offsetY + (config.scaleY - positionY)},
    ]);
    labelY.textContent = labelsYValues[index];
    svgLabelsY.appendChild(labelY);

    const lineY = document.createElementNS(svgns, 'line');
    setAttributesNS(lineY, [
      {'x1': config.startGraph},
      {'x2': config.endGraph},
      {'y1': config.offsetY + (config.scaleY - positionY)},
      {'y2': config.offsetY + (config.scaleY - positionY)},
    ]);
    svgGridY.appendChild(lineY);  
  })

  const labelYMaster = document.createElementNS(svgns, 'text');
  setAttributesNS(labelYMaster, [
    {'x': config.startGraph - 10},
    {'y': config.offsetY / 2},
    {'class': 'label-title'},
  ]);
  labelYMaster.textContent = config.titleY;
  svgLabelsY.appendChild(labelYMaster);
  
}

function setGraphSize() {
  const graphWidth = config.endGraph + 10;
  const graphHeight = config.scaleY + config.labelsSizeX + config.offsetY;
  setAttributesNS(svgGraphInner, [
    {'viewBox': '0 0 ' + graphWidth + ' ' + graphHeight},
    {'width': graphWidth},
    {'height': graphHeight},
  ]);
  svgGraph.style.setProperty('--graph-width', graphWidth + 'px');
}


// Make it responsive on resize WIP
// Function to draw the graph : reset previous values & generate new ones
// it's meh, but working !
// TODO: draw again only when size change.
function drawGraph() {
  points = 0;
  percentages = [];
  svgGraphInner.innerHTML = template;
  tooltips.innerHTML = '';
  svgDatasWrapper = svgGraph.querySelector('[data-datas]');
  svgLine = svgGraph.querySelector('[data-line]');
  svgLabelsX = svgGraph.querySelector('[data-labels="x"]');
  svgLabelsY = svgGraph.querySelector('[data-labels="y"]');
  svgGridX = svgGraph.querySelector('[data-grid="x"]');
  svgGridY = svgGraph.querySelector('[data-grid="y"]');
  
  // manual responsivness
  // TODO : add resize event listener
  if  (window.matchMedia(`(max-width: 400px)`).matches) {
    config.scaleX = 20;
    config.scaleY = 60;
  } else if (window.matchMedia(`(max-width: 700px) and (min-width: 401px)`).matches) {
    config.scaleX = 35;
    config.scaleY = 100;
  } else {
    config.scaleX = 50;
    config.scaleY = 150;
  }
  generateRelativePosition();
  setPoints()
  setLegend()
  setGraphSize()
}

// Generate the graph on load & on resize after a little debounce.
window.addEventListener("DOMContentLoaded", drawGraph);
window.addEventListener("resize", debounce( drawGraph, 200 ));

// Display the tooltips (with event delegation please)
['mouseenter','focus'].forEach( eventType => {
  svgGraphInner.addEventListener(eventType, event => {
    if (eventType == 'focus') event.target.classList.add('is-focused')
    if (event.target.matches('circle')) {
      const id = event.target.getAttribute('aria-labelledby');
      const tt = document.getElementById(id);
      tt.classList.add('is-active');
    }
  }, true)
});
  
['mouseleave','blur'].forEach( eventType => {
  svgGraphInner.addEventListener(eventType, event => {
    if (eventType == 'blur') event.target.classList.remove('is-focused')
    if (event.target.matches('circle')) {
      const id = event.target.getAttribute('aria-labelledby');
      const tt = document.getElementById(id);
      
      if (!event.target.classList.contains('is-focused')) {tt.classList.remove('is-active');}
      
    }
  }, true)
});


toggle.addEventListener("click", () => {
  const togglable = document.querySelectorAll('[data-toggle-state]');
  togglable.forEach( element => {
    const state = element.getAttribute('data-toggle-state');
    let toggleName = element.getAttribute('data-toggle-name');
    if (state == 'true') {toggle.innerHTML = "affichage " + toggleName;}
    element.setAttribute('data-toggle-state', state == 'true' ? false : true)
  })
})