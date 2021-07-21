import { _tableToJson } from "./helpers/data";
import { _select } from "./helpers/dom";
import GraphLine from "./graph-line";


// TODO : Use proxies to update only the necessary parts when the data or the config change.
const node = _select('[data-graph]');
const table = _select('[data-graph-table]');
let [header, datas] = _tableToJson(table)

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
}

const graphline = new GraphLine(node, datas, config);
graphline.debug();
graphline.draw();
graphline.events();