import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { TableData, MenuItem, Bill } from './types';
import { INITIAL_TABLES, MENU_CATEGORIES } from './constants';
import InsideView from './components/InsideView';
import OutsideView from './components/OutsideView';
import OrderView from './components/OrderView';
import StartView from './components/StartView';
import ViewSelectionView from './components/ViewSelectionView';
import HistoryView from './components/HistoryView';
import QuickOrderView from './components/QuickOrderView';
import { checkVersion } from './src/lib/version-manager';

type Screen = 'start' | 'viewSelection' | 'inside' | 'outside' | 'order' | 'history' | 'quickOrder';

const App: React.FC = () => {
  useEffect(() => {
    checkVersion();
  }, []);

  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    const savedScreen = localStorage.getItem('currentScreen');
    return (savedScreen as Screen) || 'start';
  });
  const [tables, setTables] = useState<Map<number, TableData>>(() => {
    const savedTables = localStorage.getItem('tables');
    if (savedTables) {
      return new Map(JSON.parse(savedTables));
    }
    const initialTables = new Map<number, TableData>();
    INITIAL_TABLES.forEach(table => {
      initialTables.set(table.id, table);
    });
    return initialTables;
  });
  const [selectedTableId, setSelectedTableId] = useState<number | null>(() => {
    const savedTableId = localStorage.getItem('selectedTableId');
    return savedTableId ? parseInt(savedTableId, 10) : null;
  });
  const [history, setHistory] = useState<Bill[]>(() => {
    const savedHistory = localStorage.getItem('history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  useEffect(() => {
    localStorage.setItem('currentScreen', currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    localStorage.setItem('tables', JSON.stringify(Array.from(tables.entries())));
  }, [tables]);

  useEffect(() => {
    if (selectedTableId) {
      localStorage.setItem('selectedTableId', JSON.stringify(selectedTableId));
    } else {
      localStorage.removeItem('selectedTableId');
    }
  }, [selectedTableId]);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  const updateTable = useCallback((tableId: number, updatedData: Partial<TableData>) => {
    setTables((prev: Map<number, TableData>) => {
      const newTables = new Map(prev);
      const currentTable = newTables.get(tableId);
      if (currentTable) {
        const updatedTable = { ...currentTable, ...updatedData } as TableData;
        newTables.set(tableId, updatedTable);
      }
      return newTables;
    });
  }, []);

  const handleTableSelect = useCallback((tableId: number) => {
    setSelectedTableId(tableId);
    setCurrentScreen('order');
  }, []);

  const handleAddItem = useCallback((tableId: number, menuItem: MenuItem) => {
    const table = tables.get(tableId);
    if (!table) return;
    const existingItem = table.order.find((item) => item.menuItem.id === menuItem.id);
    let newOrder;
    if (existingItem) {
      newOrder = table.order.map((item) =>
        item.menuItem.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newOrder = [...table.order, { menuItem, quantity: 1 }];
    }
    updateTable(tableId, { order: newOrder, status: 'occupied' });
  }, [tables, updateTable]);

  const handleUpdateItemQuantity = useCallback((tableId: number, menuItemId: number, change: number) => {
    const table = tables.get(tableId);
    if (!table) return;
    const newOrder = table.order.map(item =>
        item.menuItem.id === menuItemId
        ? {...item, quantity: item.quantity + change}
        : item
    ).filter(item => item.quantity > 0);
    const newStatus = newOrder.length > 0 ? 'occupied' : 'available';
    updateTable(tableId, { order: newOrder, status: newStatus });
  }, [tables, updateTable]);

  const handleUpdateItemNote = useCallback((tableId: number, menuItemId: number, note: string) => {
    const table = tables.get(tableId);
    if (!table) return;
    const newOrder = table.order.map(item =>
        item.menuItem.id === menuItemId
        ? {...item, note: note}
        : item
    );
    updateTable(tableId, { order: newOrder });
  }, [tables, updateTable]);

  const handlePayment = useCallback((tableId: number) => {
    const table = tables.get(tableId);
    if (!table) return;

    const bill: Bill = {
      id: Date.now(),
      table: table.name,
      items: table.order,
      total: table.order.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0),
      date: new Date().toISOString(),
    };
    setHistory(prevHistory => [...prevHistory, bill]);

    const previousScreen = table.layout === 'Inside' ? 'inside' : 'outside';
    updateTable(tableId, { order: [], status: 'available' });
    setCurrentScreen(previousScreen);
    setSelectedTableId(null);
  }, [tables, updateTable]);

  const handleCompleteQuickOrder = useCallback((order: Omit<Bill, 'id' | 'date'>) => {
    const newBill: Bill = {
      ...order,
      id: Date.now(),
      date: new Date().toISOString(),
    };
    setHistory(prevHistory => [...prevHistory, newBill]);
    setCurrentScreen('viewSelection');
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const deleteSelectedHistory = useCallback((selectedIds: number[]) => {
    setHistory(prevHistory => prevHistory.filter(bill => !selectedIds.includes(bill.id)));
  }, []);

  const selectedTable = useMemo(() => {
    if (selectedTableId === null) return null;
    return tables.get(selectedTableId) || null;
  }, [selectedTableId, tables]);

  const insideTables = useMemo(() => Array.from(tables.values()).filter(t => t.layout === 'Inside'), [tables]);
  const outsideTables = useMemo(() => Array.from(tables.values()).filter(t => t.layout === 'Outside'), [tables]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'start':
        return <StartView onStart={() => setCurrentScreen('viewSelection')} />;
      case 'viewSelection':
        return <ViewSelectionView onSelect={(view) => setCurrentScreen(view)} onBack={() => setCurrentScreen('start')} onHistory={() => setCurrentScreen('history')} />;
      case 'inside':
        return <InsideView tables={insideTables} onTableSelect={handleTableSelect} onBack={() => setCurrentScreen('viewSelection')} />;
      case 'outside':
        return <OutsideView tables={outsideTables} onTableSelect={handleTableSelect} onBack={() => setCurrentScreen('viewSelection')} />;
      case 'order':
        if (!selectedTable) return <ViewSelectionView onSelect={(view) => setCurrentScreen(view)} onBack={() => setCurrentScreen('start')} onHistory={() => setCurrentScreen('history')} />;
        return (
          <OrderView
            table={selectedTable}
            menuCategories={MENU_CATEGORIES}
            onBack={() => setCurrentScreen(selectedTable.layout === 'Inside' ? 'inside' : 'outside')}
            onAddItem={handleAddItem}
            onUpdateQuantity={handleUpdateItemQuantity}
            onPayment={handlePayment}
            onUpdateNote={handleUpdateItemNote}
          />
        );
      case 'history':
        return <HistoryView history={history} onClearHistory={clearHistory} onDeleteSelected={deleteSelectedHistory} onBack={() => setCurrentScreen('viewSelection')} menuCategories={MENU_CATEGORIES} />;
      case 'quickOrder':
        return <QuickOrderView onBack={() => setCurrentScreen('viewSelection')} onCompleteOrder={handleCompleteQuickOrder} />;
      default:
        return <StartView onStart={() => setCurrentScreen('viewSelection')} />;
    }
  };

  return renderScreen();
};

export default App;
