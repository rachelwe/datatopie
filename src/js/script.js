import { _tableToJson } from "./helpers/data";
import { _select } from "./helpers/dom";
import GraphLine from "./graph-line";
import PieChart from "./pie";
import GraphPie from "./graph-pie";

customElements.define('pie-chart', PieChart)
const test2 = new GraphLine({}, {});

const pieChart = {
  "config": {
    "mainTitle": "A very simple pie chart about vegan diet",
    "legendKey": "label",
    "wrapper": document.querySelector('[data-graph="pie"]'),
    "id": Date.now(),
    "donut": .8,
    "unite": "parts",
    "hideButton": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M2.1 12a18.7 18.7 0 0 0 2.5 3.3A10 10 0 0 0 12 19c3.1 0 5.6-1.8 7.4-3.7a18.7 18.7 0 0 0 2.5-3.3 18.7 18.7 0 0 0-2.5-3.3A10 10 0 0 0 12 5C8.9 5 6.4 6.8 4.6 8.7A18.7 18.7 0 0 0 2.1 12zM23 12l.9-.4a10.6 10.6 0 0 0-.2-.4 20.7 20.7 0 0 0-2.8-3.9c-2-2-5-4.3-8.9-4.3-3.9 0-6.9 2.2-8.9 4.3a20.7 20.7 0 0 0-2.8 3.9 12.4 12.4 0 0 0-.2.3s0 0 .9.5l-.9-.4a1 1 0 0 0 0 .8L1 12l-.9.4a8.3 8.3 0 0 0 .2.4 20.7 20.7 0 0 0 2.8 3.9c2 2 5 4.3 8.9 4.3 3.9 0 6.9-2.2 8.9-4.3a20.7 20.7 0 0 0 2.8-3.9 11.8 11.8 0 0 0 .2-.3s0 0-.9-.5zm0 0 .9.4a1 1 0 0 0 0-.8l-.9.4z" clip-rule="evenodd"/><path fill-rule="evenodd" d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-4 2a4 4 0 1 1 8 0 4 4 0 0 1-8 0z" clip-rule="evenodd"/></svg>'
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
}


const graphPie = new GraphPie(pieChart.data, pieChart.config);
graphPie.init();
graphPie.debug();