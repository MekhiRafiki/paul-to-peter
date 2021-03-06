from cash_graph import CashGraph
from node import NodeCategories
from collections import namedtuple
from interactive import console_interact_with_graph

_MONTHS_IN_YEAR = 12
cached_allocation = namedtuple('cached_allocation', 'name monthly_amount')


class Profile():
    def __init__(self, name):
        """Creates a the graph object to represent a person."""
        self.graph = CashGraph()
        self.me = name
        self.setupProfile()

    def setupProfile(self):
        """Stable starter data for a personal profile."""
        self.graph.create_node(name=self.me, start_amount=0)
        _employment(self.me, self.graph)
        _investments(self.graph)
        _savings(self.graph)
        _expenses(self.graph)


    def add_grouping_to_graph(self, parent_node, cached_allocations):
        """Creates the nodes and edges in graph from the cached results."""
        for allocation in cached_allocations:
            parent_node.add_internal_allocation(
                allocation.name, amount=allocation.monthly_amount * _MONTHS_IN_YEAR)

def _employment(name, graph):
    # Nuro
    employer_name = 'Nuro'
    salary = 150000
    graph.create_node(name=employer_name, start_amount=salary)
    graph.create_edge(employer_name, name, amount=salary)

    # Side Hustle
    turo = 'turo'
    monthly_cashflow = 300
    graph.create_node(name=turo, start_amount=monthly_cashflow)
    graph.create_edge(turo, name, amount=salary)


def _investments(graph):
    investing_node = graph.create_node(name='Investments', node_type=NodeCategories.INVESTMENTS)
    investing_allocations = [
        cached_allocation('Vanguard Retirement', 500),
        cached_allocation('Speculative - Stock Market', 200),
        cached_allocation('Crypto Holdings', 500),
        cached_allocation('MMAD Holdings', 500)
    ]
    graph.add_grouping_to_graph(investing_node, investing_allocations)


def _savings(graph):
    savings_node = graph.create_node(name='Savings', node_type=NodeCategories.SAVINGS)
    savings_allocations = [
        cached_allocation('Emergency Savings', 600),
        cached_allocation('Motorcyle', 200)
    ]
    graph.add_grouping_to_graph(savings_node, savings_allocations)


def _expenses(graph):
    # Subscriptions
    subscriptions_node = graph.create_node(name='Subscriptions', node_type=NodeCategories.EXPENSES)
    subscriptions = [
        cached_allocation('Disney+', 8),
        cached_allocation('Netflix', 12),
        cached_allocation('LifeLock', 20)
    ]
    graph.add_grouping_to_graph(subscriptions_node, subscriptions)

    # Bills
    constant_expenses = graph.create_node(name='Constant Bills', node_type=NodeCategories.EXPENSES)
    bills = [
        cached_allocation('PG&E', 500),
        cached_allocation('Rent', 1750),
        cached_allocation('Parking', 150),
    ]
    graph.add_grouping_to_graph(constant_expenses, bills)

def main():
    me = Profile(name = 'Mekhi')
    print(me.graph.get_node('Mekhi'))
    console_interact_with_graph(me.graph)


if __name__ == '__main__':
    main()
