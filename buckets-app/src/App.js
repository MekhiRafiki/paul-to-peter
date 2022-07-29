import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import complexUserGraph from './cash_graph/complex_user.js';
import mockUserGraph from './cash_graph/mock_user.js';
import blankGraph from './cash_graph/blank.js';
import {getUpToDateGraph, publishGraph} from './cash_graph/main.js';
import Button from '@mui/material/Button';

import NodeQuickView from './components/NodeQuickView';
import NodeInspectView from './components/NodeInspectView';
import CashGraphView from './components/CashGraphView';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import { InputLabel } from '@mui/material';


const graphDisplayStyle = {
  display: "flex",
  flexDirection: "row"
};
const GraphDisplay = (props) => {
  return(
    <div>
      <CashGraphView 
          handleNodeFocusClick={props.handleNodeFocusClick}
          nodes={props.data.get_nodes()}
          edges={props.data.get_edges()}
      />
      <NodeInspectView
          node={props.focusNode}
          nodes={props.data.get_nodes()}
          incoming_edges={props.incoming_edges}
          outgoing_edges={props.outgoing_edges}
          newEdgeFunction={props.newEdgeFunction}
          displayFullInfo={false}
        />
    </div>
  );
};

function App() {
  const [data, setData] = useState({});
  /**
   * Data Graph changes won't trigger a change of state re-rendering
   * because of the function supporting it. Toggle a boolean instead
   * to trigger the sub-component refresh when necessary.
  */
  const [refreshGraphToggle, setRefreshGraphToggle] = useState(true);
  const [focusNode, setFocusNode] = useState({});
  const [isLoading, setLoading] = useState(true);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showGraph, seeGraphView] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('All');
  const [displayedNodes, setDisplayedNodes] = useState({});

  function setStatesWithGraph(cashGraph) {
    setData(cashGraph);
    const default_display_node_id = Object.keys(cashGraph.nodes)[0]
    setFocusNode(cashGraph.nodes[default_display_node_id]);
    setDisplayedNodes(cashGraph.nodes)
    setRefreshGraphToggle(!refreshGraphToggle);
  };

  /**Loads the data from backend (which doesnt exist today) */
  useEffect(() => {
    console.log('Effect Executing');
    setStatesWithGraph(blankGraph)
    setLoading(false);
  }, []);

  /** Hard Coded Graph Values.
   *  TODO(mjones): Change to dynamically load these values.
  */
  const AvailableGraphs = {}
  function getUpdatedGraph(graph){
    AvailableGraphs[graph.graph_id] = getUpToDateGraph(graph);
  }
  getUpdatedGraph(mockUserGraph);
  getUpdatedGraph(complexUserGraph);
  getUpdatedGraph(blankGraph);

  /**Toggle between available graphs */
  function changeDisplayedGraph(e){
    const newGraph = AvailableGraphs[e.target.value];
    console.log(newGraph)
    setStatesWithGraph(newGraph)
  }

  /**Publish Graph to persistent storage */
  function SaveGraph(graph) {
    publishGraph(graph);
    setUnsavedChanges(false);
  };

  /**Handle a node focus event. */
  function handleNodeFocusClick(node) {
    console.log(node);
    let id = node.id;
    setFocusNode(data.get_node(id));
  };

  /**Adds a new node to the graph */
  function addNodeFunction(name, type, current_balance){
    data.add_node_to_graph(name, type, current_balance)
    setUnsavedChanges(true);
  }

  /**Adds a new edge to the graph. */
  function newEdgeFunction(sourceID, destinationID, amount){
    console.log('New edge being added from ' + sourceID + "->" + destinationID + "of amont: " + amount)
    console.log(sourceID)
    console.log(destinationID)
    data.add_new_edge_to_graph(sourceID, destinationID, amount)
    setRefreshGraphToggle(!refreshGraphToggle);
    setUnsavedChanges(true);
  }

  /**Updates an existing edge in the graph */
  function updateEdgeAmountInGraph(edge_id, amount) {
    console.log(edge_id);
    console.log(amount);
    data.update_edge(edge_id, amount);
    setRefreshGraphToggle(!refreshGraphToggle);
    setUnsavedChanges(true);
  }

  /**Removes an edge form the graph */
  function removeEdgeFromGraphFunction(edge_id) {
    data.remove_edge(edge_id);
    setData(data);
    setRefreshGraphToggle(!refreshGraphToggle);
    setUnsavedChanges(true);
  }

  /**Filter the Nodes displayed on the screen by category. */
  function filterNodesByCategory(category) {
    const nodesInCategory = Object.fromEntries(Object.entries(data.nodes).filter(([key, node]) => node.type === category || category === 'All'))
    setDisplayedNodes(nodesInCategory)
  }

  function filterNodesByStr(substr) {
    const nodesInCategory = Object.fromEntries(Object.entries(data.nodes).filter(([key, node]) => node.name.toLowerCase().indexOf(substr.toLowerCase()) !== -1))
    setDisplayedNodes(nodesInCategory)
  }

  /**Render the app. */
  if (isLoading) {
    return <div className="App">Loading..</div>
  }
  return (
    <>
    <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
    <h1>Welcome to your financial health</h1>
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
      <InputLabel id="demo-select-small">Available Graphs</InputLabel>
      <Select
              labelId="demo-simple-select-label-small"
              id="demo-simple-select-small"
              label="Available Graphs"
              value={data.graph_id}
              onChange={changeDisplayedGraph}
              style={{minWidth: "40%"}}
          >
            {
              Object.keys(AvailableGraphs).map((key, i) => {
                const val = AvailableGraphs[key].graph_id
                return (
                  <MenuItem key={val} value={val}>{val}</MenuItem>
                )
              })
            }
      </Select>
      {(unsavedChanges) ? 
        <Button variant="outlined" onClick={()=>SaveGraph(data)}>
          Publish Changes.
        </Button>:
        <></>
      }
    </FormControl>
    </div>

    <div className="dev-area">
      <div className="info-side">
        <NodeQuickView
          displayedNodes={displayedNodes}
          handleClick={handleNodeFocusClick}
          categories={data.node_types}
          currentCategory={currentCategory}
          setCurrentCategory={setCurrentCategory}
          filterNodesByCategory={filterNodesByCategory}
          filterNodesByStr={filterNodesByStr}
          addNodeFunction={addNodeFunction}
        />
      </div>
      <div className="inspect-side">
        <Button
          onClick={()=>{
            seeGraphView(!showGraph)}
          }
          variant="outlined"
        >Toggle Graph</Button>
        {showGraph ? 
           <GraphDisplay 
            data={data}
            focusNode={focusNode}
            incoming_edges={data.get_incoming_edges(focusNode.id)}
            outgoing_edges={data.get_outgoing_edges(focusNode.id)}
            newEdgeFunction={newEdgeFunction}
            handleNodeFocusClick={handleNodeFocusClick}
           />:
          <NodeInspectView
            data={data}
            node={focusNode}
            nodes={data.get_nodes()}
            incoming_edges={data.get_incoming_edges(focusNode.id)}
            outgoing_edges={data.get_outgoing_edges(focusNode.id)}
            newEdgeFunction={newEdgeFunction}
            updateEdgeAmountInGraph={updateEdgeAmountInGraph}
            removeEdgeFromGraphFunction={removeEdgeFromGraphFunction}
            displayFullInfo={true}
          />
        }
      </div>
    </div>
    </>

  );
  
}

export default App;
