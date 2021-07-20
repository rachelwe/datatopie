import Graph from "./graph";

export default class GraphLine extends Graph {
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
    `
  }
}