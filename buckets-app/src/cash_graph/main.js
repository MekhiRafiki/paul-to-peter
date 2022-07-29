const default_user_id = 'DefaultUser';
const DEFAULT_NODE_TYPES = ['User', 'Investment', 'Expense', 'Savings', 'Income Source', 'All']

export class Graph {
    /**Creates a new Cash Graph object with the associated user_id. */
    constructor(graphID=default_user_id) {
        this.nodes = {};
        this.edges = {};
        this.edges_outgoing_index = {};
        this.edges_incoming_index = {};
        this.node_types = DEFAULT_NODE_TYPES;
        this.graph_id = graphID
    }
    /**Creates a Cash Graph from an encoding of raw data. */
    static ParseFromEncoding(encoding) {
        let newGraph = new Graph(encoding.graph_id)
        newGraph.nodes = encoding.nodes
        newGraph.edges = encoding.edges
        newGraph.edges_outgoing_index = encoding.edges_outgoing_index 
        newGraph.edges_incoming_index = encoding.edges_incoming_index;
        newGraph.node_types = encoding.node_types;
        return newGraph;
    }

    /**Data modification functions (CRUD) */
    get_nodes() {
        let raw_nodes = [];
        for (let node_id in this.nodes) {
            raw_nodes.push(this.nodes[node_id]);
        }
        return raw_nodes;
    }
    
    get_node(node_id) {
        return this.nodes[node_id];
    }

    add_node_to_graph(name, type, current_balance){
        let node = new Node(name, type, current_balance);
        this.add_node(node);
    }

    add_node(node) {
        this.nodes[node.id] = node;
        // Migrate to Maps for more efficient edge deletion.
        this.edges_outgoing_index[node.id] = [];
        this.edges_incoming_index[node.id] = [];
    }

    add_new_edge_to_graph(sourceID, destinationID, amount, desc=''){
        let new_edge = new Edge(sourceID, destinationID, amount, desc)
        this.add_edge(new_edge);
    }

    get_edges() {
        console.log(this.edges)
        let raw_edges = [];
        for (let edge_id in this.edges){
            raw_edges.push(this.edges[edge_id]);
        }
        return raw_edges;
    }

    add_edge(edge) {
        this.edges[edge.id] = edge;
        this.edges_outgoing_index[edge.source_id].push(edge);
        console.log(this.edges_outgoing_index)
        this.edges_incoming_index[edge.dest_id].push(edge);
        console.log(this.edges_incoming_index)
    }

    update_edge(edge_id, newAmount) {
        let edge = this.edges[edge_id];
        edge.amount = newAmount;
    }

    remove_edge_id_from_array(edge_id, edge_array) {
        let foundIndex = -1;
        for (let i = 0; i < edge_array.length; i++) {
            console.log(edge_array[i].id)
            if (edge_array[i].id == edge_id){
                foundIndex = i;
                break;
            }
        }
        if (foundIndex > -1) {
            edge_array.splice(foundIndex, 1);
        }
        return edge_array;
    }

    remove_edge(edge_id) {
        console.log('Removing edge_id: ' + edge_id)
        if (this.edges[edge_id]){
            let edge = this.edges[edge_id]
            // Remove from the indexed array maps for source/destinations
            let source_node_outgoing_edges = this.edges_outgoing_index[edge.source_id]
            this.edges_outgoing_index[edge.source_id] = this.remove_edge_id_from_array(edge_id, source_node_outgoing_edges)
            
            let dest_node_incoming_edges = this.edges_incoming_index[edge.dest_id]
            this.edges_incoming_index[edge.dest_id] = this.remove_edge_id_from_array(edge_id, dest_node_incoming_edges)
            // Remove Edge object from graph.
            delete this.edges[edge_id];
            console.log('Deleted')
            return true;
        }
        return false;
    }

    get_incoming_edges(node_id) {
        return this.edges_incoming_index[node_id];
    }

    get_outgoing_edges(node_id) {
        return this.edges_outgoing_index[node_id];
    }
};

export class Edge {
    constructor(source_id, dest_id, amount, desc=''){
        this.id = source_id + "_" + dest_id + "_" + amount
        this.source_id = source_id;
        this.dest_id = dest_id;
        this.amount = amount;
        this.desc = desc
    }
}

export class Node {
    constructor(name, type='default', current_balance=0.0) {
        this.id = name;
        this.name = name;
        this.current_balance = current_balance;
        this.type = type;
        this.user_id = default_user_id;
        this.transactions = [];
    }

    outflows() {
        console.log('Expenses ' + this.outgoing_edges);
    }

    inflows() {
        console.log('Incomes ' + this.outgoing_edges);
    }
};


export class Investment extends Node {
    constructor(name, current_balance) {
        super(name, DEFAULT_NODE_TYPES[1], current_balance=current_balance);
        this.annual_return = 0.0;
        this.monthly_contribution = 0.0;
    }

    add_outgoing_edge(edge) {
        this.outgoing_edges.push(edge);
    }
};

export class Savings extends Node {
    constructor(name, current_balance) {
        super(name, DEFAULT_NODE_TYPES[3], current_balance=current_balance);
        this.annual_return = 0.0;
        this.monthly_contribution = 0.0;
    }

    add_outgoing_edge(edge) {
        this.outgoing_edges.push(edge);
    }
};

export class Expense extends Node {
    constructor(name) {
        super(name, DEFAULT_NODE_TYPES[2]);
    }
};

export class User extends Node {
    // Use the super constructor.
    constructor(name, current_balance){
        super(name, DEFAULT_NODE_TYPES[0], current_balance)
    }
};

export class IncomeSource extends Node {
    constructor(name, dest_id, amount) {
        super(name, DEFAULT_NODE_TYPES[4]);
        let income = new Edge(this.id, dest_id, amount)
    }
};

/**Persistent Storage functions, today relies on LocalStorage. */
function encode_data(graph){
    const encoding = {
        nodes: graph.nodes,
        edges: graph.edges,
        edges_outgoing_index: graph.edges_outgoing_index,
        edges_incoming_index: graph.edges_incoming_index,
        node_types: graph.node_types,
        graph_id: graph.graph_id
    }
    console.log(encoding);
    return encoding;
}

export function publishGraph(graph) {
    console.log('Publishing Graph ' + graph.graph_id)
    window.localStorage.setItem(
        graph.graph_id,
        JSON.stringify(encode_data(graph))
    );
};

export function getUpToDateGraph(graph) {
    let persistent_storage_version = window.localStorage.getItem(graph.graph_id)
    if (persistent_storage_version != undefined) {
        console.log('Found version in LocalStorage.')
        let freshGraph = Graph.ParseFromEncoding(JSON.parse(persistent_storage_version));
        console.log(freshGraph);
        return freshGraph;
    }
    console.log('Default Graph Value.')
    return graph;
    
};

