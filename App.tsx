import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { TableData, MenuItem, Bill, MenuCategory, PaymentMethod, ToppingItem } from './types';
import { INITIAL_TABLES, MENU_CATEGORIES } from './constants';
import InsideView from './components/InsideView';
import OutsideView from './components/OutsideView';
import OrderView from './components/OrderView';
import StartView from './components/StartView';
import ViewSelectionView from './components/ViewSelectionView';
import HistoryView from './components/HistoryView';
import MenuView from './components/MenuView';

import { checkVersion } from './src/lib/version-manager';
import { mergeMenuWithDefaults } from './src/lib/merge-menu-defaults';
import { mergeOrderItems } from './src/lib/merge-orders';

type Screen =
  | 'start'
  | 'viewSelection'
  | 'inside'
  | 'outside'
  | 'order'
  | 'history'
  | 'menu';

const App: React.FC = () => {
  useEffect(() => {
    checkVersion();
  }, []);

  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    const savedScreen = localStorage.getItem('currentScreen');
    const validScreens: Screen[] = ['start', 'viewSelection', 'inside', 'outside', 'order', 'history', 'menu'];
    if (savedScreen && validScreens.includes(savedScreen as Screen)) {
      return savedScreen as Screen;
    }
    return 'start';
  });
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>(() => {
    const savedMenu = localStorage.getItem('menuCategories');
    if (!savedMenu) return MENU_CATEGORIES;
    try {
      const parsed = JSON.parse(savedMenu) as MenuCategory[];
      return mergeMenuWithDefaults(parsed);
    } catch {
      return MENU_CATEGORIES;
    }
  });
  const [tables, setTables] = useState<Map<number, TableData>>(() => {
    const savedTables = localStorage.getItem('tables');
    if (savedTables) {
      try {
        const parsedTables = JSON.parse(savedTables);
        return new Map(parsedTables);
      } catch {
        const initialTables = new Map<number, TableData>();
        INITIAL_TABLES.forEach(table => {
          initialTables.set(table.id, table);
        });
        return initialTables;
      }
    }
    const initialTables = new Map<number, TableData>();
    INITIAL_TABLES.forEach(table => {
      initialTables.set(table.id, table);
    });
    return initialTables;
  });
  const [selectedTableId, setSelectedTableId] = useState<number | null>(() => {
    const savedTableId = localStorage.getItem('selectedTableId');
    if (!savedTableId) return null;
    const parsedId = parseInt(savedTableId, 10);
    return Number.isNaN(parsedId) ? null : parsedId;
  });
  const [history, setHistory] = useState<Bill[]>(() => {
    const savedHistory = localStorage.getItem('history');
    if (!savedHistory) return [];
    try {
      return JSON.parse(savedHistory);
    } catch {
      return [];
    }
  });

  // Lưu menuCategories vào localStorage khi có sự thay đổi
  useEffect(() => {
    localStorage.setItem('menuCategories', JSON.stringify(menuCategories));
  }, [menuCategories]);

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

  const handleAddItems = useCallback((tableId: number, itemsToAdd: { menuItem: MenuItem; toppings?: ToppingItem[] }[]) => {
    setTables((prev) => {
      const table = prev.get(tableId);
      if (!table) return prev;

      let newOrder = [...table.order];
      
      itemsToAdd.forEach(({ menuItem, toppings }) => {
        const existing = newOrder.find((item) => 
          item.menuItem.id === menuItem.id && (!toppings || toppings.length === 0)
        );
        
        if (existing) {
          newOrder = newOrder.map((item) =>
            item.menuItem.id === menuItem.id 
              ? { ...item, quantity: item.quantity + 1 } 
              : item
          );
        } else {
          newOrder = [...newOrder, { menuItem, quantity: 1, toppings: toppings || [] }];
        }
      });

      const newTable = { 
        ...table, 
        order: newOrder, 
        status: 'occupied' as const,
        occupiedSince: table.occupiedSince || new Date().toISOString()
      };
      
      return new Map(prev).set(tableId, newTable);
    });
  }, []);

  const handleUpdateItemQuantity = useCallback((tableId: number, menuItemId: number, change: number) => {
    const table = tables.get(tableId);
    if (!table) return;
    const newOrder = table.order.map(item =>
        item.menuItem.id === menuItemId
        ? {...item, quantity: item.quantity + change}
        : item
    ).filter(item => item.quantity > 0);
    const newStatus = newOrder.length > 0 ? 'occupied' : 'available';
    const patch: Partial<TableData> = { order: newOrder, status: newStatus };
    if (newOrder.length === 0) {
      patch.occupiedSince = undefined;
    }
    updateTable(tableId, patch);
  }, [tables, updateTable]);

  const handleUpdateItemNote = useCallback((tableId: number, menuItemId: number, note: string) => {
    const table = tables.get(tableId);
    if (!table) return;
    const newOrder = table.order.map(item =>
        item.menuItem.id === menuItemId
            ? { ...item, note }
            : item
    );
    updateTable(tableId, { order: newOrder });
  }, [tables, updateTable]);

  const handleAddTopping = useCallback((tableId: number, mainItemId: number, toppingsToAdd: { id: number; name: string; price: number }[]) => {
    setTables((prev) => {
      const table = prev.get(tableId);
      if (!table) return prev;

      const newOrder = table.order.map(item => {
        if (item.menuItem.id !== mainItemId) return item;

        let toppings = item.toppings || [];
        
        toppingsToAdd.forEach((t) => {
          const idx = toppings.findIndex((tp) => tp.id === t.id);
          
          if (idx >= 0) {
            toppings = toppings.map((tp, i) =>
              i === idx ? { ...tp, quantity: tp.quantity + 1 } : tp
            );
          } else {
            toppings = [...toppings, { id: t.id, name: t.name, price: t.price, quantity: 1 }];
          }
        });

        return { ...item, toppings };
      });

      return new Map(prev).set(tableId, { ...table, order: newOrder });
    });
  }, []);

  const handlePayment = useCallback((tableId: number, paymentMethod: PaymentMethod) => {
    const table = tables.get(tableId);
    if (!table) return;

    const bill: Bill = {
      id: Date.now(),
      table: table.name,
      items: table.order,
      total: table.order.reduce((sum, item) => {
        const toppingsTotal = item.toppings?.reduce((tSum, t) => tSum + t.price * t.quantity, 0) || 0;
        return sum + item.menuItem.price * item.quantity + toppingsTotal;
      }, 0),
      date: new Date().toISOString(),
      paymentMethod: paymentMethod,
    };
    setHistory(prevHistory => [...prevHistory, bill]);

    const previousScreen = table.layout === 'Inside' ? 'inside' : 'outside';
    updateTable(tableId, { order: [], status: 'available', occupiedSince: undefined });
    setCurrentScreen(previousScreen);
    setSelectedTableId(null);
  }, [tables, updateTable]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const deleteSelectedHistory = useCallback((selectedIds: number[]) => {
    setHistory(prevHistory => prevHistory.filter(bill => !selectedIds.includes(bill.id)));
  }, []);

  const handleRevertBill = useCallback((bill: Bill) => {
    if (!window.confirm(`Bạn có chắc muốn hoàn tác hóa đơn bàn ${bill.table}? Món ăn sẽ quay lại bàn này.`)) {
      return;
    }

    setTables((prev) => {
      const next = new Map(prev);
      
      // Tìm bàn dựa trên tên bàn trong bill
      let targetTable = Array.from(next.values()).find(t => t.name === bill.table);
      
      if (targetTable) {
        if (targetTable.status === 'available' && targetTable.order.length === 0) {
          // Bàn trống -> đưa order cũ quay lại
          next.set(targetTable.id, {
            ...targetTable,
            order: bill.items,
            status: 'occupied',
            occupiedSince: bill.date,
          });
        } else {
          // Bàn đang có khách -> tạo bàn tạm
          const allTables = Array.from(next.values());
          let tempId = Math.max(...allTables.map(t => t.id)) + 1;
          let tempName = `${bill.table}-temp`;
          
          // Kiểm tra id trùng, nếu trùng thì tăng lên
          while (next.has(tempId)) {
            tempId++;
          }
          
          const newTable: TableData = {
            id: tempId,
            name: tempName,
            layout: targetTable.layout,
            status: 'occupied',
            order: bill.items,
            occupiedSince: bill.date,
          };
          next.set(tempId, newTable);
        }
      } else {
        // Không tìm thấy bàn -> tạo bàn mới (cho trường hợp bị xóa)
        const allTables = Array.from(next.values());
        const maxId = allTables.length > 0 ? Math.max(...allTables.map(t => t.id)) : 0;
        
        const newTable: TableData = {
          id: maxId + 1,
          name: bill.table,
          layout: 'Inside', // default
          status: 'occupied',
          order: bill.items,
          occupiedSince: bill.date,
        };
        next.set(maxId + 1, newTable);
      }
      
      return next;
    });

    // Xóa hóa đơn khỏi lịch sử
    setHistory(prev => prev.filter(b => b.id !== bill.id));
    
    alert(`Đã hoàn tác hóa đơn bàn ${bill.table}.`);
  }, []);

  const handleMoveTable = useCallback((fromId: number, toId: number) => {
    setTables((prev) => {
      const next = new Map(prev);
      const from = next.get(fromId);
      const to = next.get(toId);
      if (!from || !to) return prev;
      if (to.status !== 'available' || to.order.length > 0) return prev;
      if (from.order.length === 0) return prev;
      next.set(toId, {
        ...to,
        order: [...from.order],
        status: 'occupied',
        occupiedSince: from.occupiedSince ?? new Date().toISOString(),
      });
      next.set(fromId, {
        ...from,
        order: [],
        status: 'available',
        occupiedSince: undefined,
      });
      return next;
    });
    setSelectedTableId(toId);
  }, []);

  const handleMergeFromTable = useCallback((currentId: number, sourceId: number) => {
    if (currentId === sourceId) return;
    setTables((prev) => {
      const next = new Map(prev);
      const current = next.get(currentId);
      const source = next.get(sourceId);
      if (!current || !source) return prev;
      if (source.order.length === 0) return prev;
      const merged = mergeOrderItems(current.order, source.order);
      const since =
        current.occupiedSince && source.occupiedSince
          ? current.occupiedSince < source.occupiedSince
            ? current.occupiedSince
            : source.occupiedSince
          : current.occupiedSince ?? source.occupiedSince ?? new Date().toISOString();
      next.set(currentId, {
        ...current,
        order: merged,
        status: 'occupied',
        occupiedSince: since,
      });
      next.set(sourceId, {
        ...source,
        order: [],
        status: 'available',
        occupiedSince: undefined,
      });
      return next;
    });
  }, []);

  const selectedTable = useMemo(() => {
    if (selectedTableId === null) return null;
    return tables.get(selectedTableId) || null;
  }, [selectedTableId, tables]);

  const insideTables = useMemo(() => Array.from(tables.values()).filter(t => t.layout === 'Inside'), [tables]);
  const outsideTables = useMemo(() => Array.from(tables.values()).filter(t => t.layout === 'Outside'), [tables]);

  const insideStats = useMemo(
    () => ({
      occupied: insideTables.filter((t) => t.status === 'occupied').length,
      total: insideTables.length,
    }),
    [insideTables]
  );
  const outsideStats = useMemo(
    () => ({
      occupied: outsideTables.filter((t) => t.status === 'occupied').length,
      total: outsideTables.length,
    }),
    [outsideTables]
  );

  const renderScreen = () => {
    switch (currentScreen) {
      case 'start':
        return <StartView onStart={() => setCurrentScreen('viewSelection')} />;
      case 'viewSelection':
        return (
          <ViewSelectionView
            onSelect={(view) => setCurrentScreen(view as Screen)}
            onBack={() => setCurrentScreen('start')}
            onHistory={() => setCurrentScreen('history')}
            insideStats={insideStats}
            outsideStats={outsideStats}
          />
        );
      case 'inside':
        return <InsideView tables={insideTables} onTableSelect={handleTableSelect} onBack={() => setCurrentScreen('viewSelection')} />;
      case 'outside':
        return <OutsideView tables={outsideTables} onTableSelect={handleTableSelect} onBack={() => setCurrentScreen('viewSelection')} />;
      case 'order':
        if (!selectedTable) {
          return (
            <ViewSelectionView
              onSelect={(view) => setCurrentScreen(view as Screen)}
              onBack={() => setCurrentScreen('start')}
              onHistory={() => setCurrentScreen('history')}
              insideStats={insideStats}
              outsideStats={outsideStats}
            />
          );
        }
        return (
          <OrderView
            table={selectedTable}
            menuCategories={menuCategories}
            allTables={Array.from(tables.values())}
            onBack={() => setCurrentScreen(selectedTable.layout === 'Inside' ? 'inside' : 'outside')}
            onAddItem={handleAddItems}
            onUpdateQuantity={handleUpdateItemQuantity}
            onPayment={handlePayment}
            onUpdateNote={handleUpdateItemNote}
            onMoveTable={handleMoveTable}
            onMergeFromTable={handleMergeFromTable}
            onAddTopping={handleAddTopping}
          />
        );
      case 'history':
        return <HistoryView history={history} onClearHistory={clearHistory} onDeleteSelected={deleteSelectedHistory} onBack={() => setCurrentScreen('viewSelection')} menuCategories={menuCategories} onRevertBill={handleRevertBill} />;
      case 'menu':
        return <MenuView 
          onBack={() => setCurrentScreen('viewSelection')} 
          menuCategories={menuCategories}
          onUpdateMenuCategories={setMenuCategories}
        />;
      default:
        return <StartView onStart={() => setCurrentScreen('viewSelection')} />;
    }
  };

  return renderScreen();
};

export default App;
