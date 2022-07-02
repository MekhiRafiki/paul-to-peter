const default_user_id = 'DefaultUser';

class Graph {
    constructor() {
        this.nodes = {};
        this.edges = {};
    }

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

    add_node(node) {
        this.nodes[node.id] = node;
    }

    get_edges() {
        let raw_edges = [];
        for (let edge_id in this.edges){
            raw_edges.push(this.edges[edge_id]);
        }
        return raw_edges;
    }

    add_edge(edge) {
        this.edges[edge.id] = edge;
    }
};
let globalGraph = new Graph();

class Edge {
    constructor(source_id, dest_id, amount){
        this.source_id = source_id;
        this.dest_id = dest_id;
        this.amount = amount;
        globalGraph.add_edge(this);
    }
}

class Node {
    constructor(name, type='default', current_balance=0.0) {
        this.id = name;
        this.name = name;
        this.current_balance = current_balance;
        this.type = type;
        this.user_id = default_user_id;
        globalGraph.add_node(this);
    }

    outflows() {
        console.log('Expenses ' + this.outgoing_edges);
    }

    inflows() {
        console.log('Incomes ' + this.outgoing_edges);
    }
};

class Investment extends Node {
    constructor(name, current_balance) {
        super(name, 'Investment', current_balance=current_balance);
        this.annual_return = 0.0;
        this.monthly_contribution = 0.0;
    }

    add_outgoing_edge(edge) {
        this.outgoing_edges.push(edge);
    }
};

class Expense extends Node {
    constructor(name) {
        super(name, 'Expense');
    }
};

class User extends Node {
    // Use the super constructor.
};

class IncomeSource extends Node {
    constructor(name, dest_id, amount) {
        super(name, 'Income Source');
        let income = new Edge(this.id, dest_id, amount)
    }
};

let user = new User('Self_User', 'User', 10000);

let nuro = new IncomeSource('Nuro', user.id, 100000);


let retirement = new Investment('401k', 10000);
let retirment_contribution = new Edge(user.id, retirement.id, 10000);

let bmw_expense = new Expense('BMW i3');
let bmw_cost = new Edge(user.id, bmw_expense.id, 9600);


console.log(globalGraph);
export default globalGraph;
