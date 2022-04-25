<a name="Graph"></a>

## Graph
Class creating a graph.

**Kind**: global class  

* [Graph](#Graph)
    * [new Graph(node, datas, config)](#new_Graph_new)
    * [.debug()](#Graph+debug)
    * [.generateRelativePosition()](#Graph+generateRelativePosition)
    * [.setPoints()](#Graph+setPoints)
    * [.setLegend()](#Graph+setLegend)
    * [.setGraphSize()](#Graph+setGraphSize)
    * [.setBreakpoints()](#Graph+setBreakpoints)
    * [.events()](#Graph+events)
    * [.draw()](#Graph+draw)

<a name="new_Graph_new"></a>

### new Graph(node, datas, config)

| Param | Type | Description |
| --- | --- | --- |
| node | <code>node</code> | Graph wrapper node, with a [data-graph] attribute |
| datas | <code>Array.&lt;object&gt;</code> | Array of datas as objects containing property and value |
| config | <code>object</code> | Object listing all the config options |

<a name="Graph+debug"></a>

### graph.debug()
Temporary debug

**Kind**: instance method of [<code>Graph</code>](#Graph)  
<a name="Graph+generateRelativePosition"></a>

### graph.generateRelativePosition()
Transforming each value to a portion of the max one, for easier display

**Kind**: instance method of [<code>Graph</code>](#Graph)  
<a name="Graph+setPoints"></a>

### graph.setPoints()
Append in the graph

**Kind**: instance method of [<code>Graph</code>](#Graph)  
<a name="Graph+setLegend"></a>

### graph.setLegend()
Set the legend

**Kind**: instance method of [<code>Graph</code>](#Graph)  
<a name="Graph+setGraphSize"></a>

### graph.setGraphSize()
Define Graph size

**Kind**: instance method of [<code>Graph</code>](#Graph)  
<a name="Graph+setBreakpoints"></a>

### graph.setBreakpoints()
manual responsivnessTODO: add resize event listener

**Kind**: instance method of [<code>Graph</code>](#Graph)  
<a name="Graph+events"></a>

### graph.events()
Events

**Kind**: instance method of [<code>Graph</code>](#Graph)  
<a name="Graph+draw"></a>

### graph.draw()
Draw the graph

**Kind**: instance method of [<code>Graph</code>](#Graph)  
