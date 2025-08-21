
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { TableData, MenuItem } from './types';
import { INITIAL_TABLES, MENU_CATEGORIES } from './constants';
import { supabase } from './src/lib/supabase';
import InsideView from './components/InsideView';
import OutsideView from './components/OutsideView';
import OrderView from './components/OrderView';
import StartView from './components/StartView';
import ViewSelectionView from './components/ViewSelectionView';

type Screen = 'start' | 'viewSelection' | 'inside' | 'outside' | 'order';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    const savedScreen = localStorage.getItem('currentScreen');
    return (savedScreen ? JSON.parse(savedScreen) : 'start') as Screen;
  });
  const [tables, setTables] = useState<Map<number, TableData>>(() => {
    const savedTables = localStorage.getItem('tables');
    if (savedTables) {
      const parsed = JSON.parse(savedTables);
      // Check if parsed is an array before calling new Map(parsed)
      if (Array.isArray(parsed)) {
        return new Map(parsed);
      }
    }
    return new Map();
  });
  const [selectedTableId, setSelectedTableId] = useState<number | null>(() => {
    const savedTableId = localStorage.getItem('selectedTableId');
    return savedTableId ? JSON.parse(savedTableId) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('currentScreen', JSON.stringify(currentScreen));
  }, [currentScreen]);

  useEffect(() => {
    localStorage.setItem('selectedTableId', JSON.stringify(selectedTableId));
  }, [selectedTableId]);

  useEffect(() => {
    // Don't save an empty map to localStorage
    if (tables.size > 0) {
      localStorage.setItem('tables', JSON.stringify(Array.from(tables.entries())));
    }
  }, [tables]);

  // Khởi tạo dữ liệu bàn nếu chưa có
  const initializeTables = useCallback(async () => {
    const { error } = await supabase
      .from('tables')
      .upsert(INITIAL_TABLES, { onConflict: 'id' });

    if (error) {
      console.error("Error initializing tables:", error);
    } else {
      setTables(new Map(INITIAL_TABLES.map((table: TableData) => [table.id, table])));
    }
  }, []);

  // Load dữ liệu từ Supabase khi component mount
  useEffect(() => {
    if (tables.size > 0) {
      setLoading(false);
      return;
    }

    const loadTables = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('id');

      if (error) {
        console.error('Lỗi tải dữ liệu:', error);
        setTables(new Map(INITIAL_TABLES.map((table: TableData) => [table.id, table])));
      } else if (data && data.length > 0) {
        const tableMap = new Map<number, TableData>();
        (data as any[]).forEach((table: any) => {
          tableMap.set(table.id, { ...table, order: table.order || [] });
        });
        setTables(tableMap);
      } else {
        await initializeTables();
      }
      setLoading(false);
    };

    loadTables();

    const channel = supabase
      .channel('tables-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tables' },
        (payload: any) => {
          const updatedTable = payload.new as TableData;
          setTables((prev: Map<number, TableData>) => {
            const newMap = new Map(prev);
            newMap.set(updatedTable.id, { ...updatedTable, order: updatedTable.order || [] });
            return newMap;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initializeTables, tables.size]);

  // Cập nhật bàn lên Supabase
  const updateTableOnSupabase = async (tableId: number, updatedData: Partial<TableData>) => {
    const { error } = await supabase
      .from('tables')
      .update(updatedData)
      .eq('id', tableId);
    if (error) {
      console.error("Error updating table on Supabase:", error);
    }
  };

  const updateTable = useCallback((tableId: number, updatedData: Partial<TableData>) => {
    let updatedTableForSupabase: Partial<TableData> | null = null;
    setTables((prev: Map<number, TableData>) => {
      const newTables = new Map(prev);
      const currentTable = newTables.get(tableId);
      if (currentTable) {
        const updatedTable = { ...currentTable, ...updatedData } as TableData;
        newTables.set(tableId, updatedTable);
        updatedTableForSupabase = { status: updatedTable.status, order: updatedTable.order };
      }
      return newTables;
    });

    if (updatedTableForSupabase) {
      updateTableOnSupabase(tableId, updatedTableForSupabase);
    }
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

  const handlePayment = useCallback((tableId: number) => {
    const table = tables.get(tableId);
    if (!table) return;
    const previousScreen = table.layout === 'Inside' ? 'inside' : 'outside';
    updateTable(tableId, { order: [], status: 'available' });
    setCurrentScreen(previousScreen);
    setSelectedTableId(null);
  }, [tables, updateTable]);

  const selectedTable = useMemo(() => {
    if (selectedTableId === null) return null;
    return tables.get(selectedTableId) || null;
  }, [selectedTableId, tables]);

  const insideTables = useMemo(() => Array.from(tables.values()).filter(t => t.layout === 'Inside'), [tables]);
  const outsideTables = useMemo(() => Array.from(tables.values()).filter(t => t.layout === 'Outside'), [tables]);

  if (loading) {
    return <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '1.25rem'}}>Đang tải dữ liệu từ server...</div>;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'start':
        return <StartView onStart={() => setCurrentScreen('viewSelection')} />;
      case 'viewSelection':
        return <ViewSelectionView onSelect={(view) => setCurrentScreen(view)} onBack={() => setCurrentScreen('start')} />;
      case 'inside':
        return <InsideView tables={insideTables} onTableSelect={handleTableSelect} onBack={() => setCurrentScreen('viewSelection')} />;
      case 'outside':
        return <OutsideView tables={outsideTables} onTableSelect={handleTableSelect} onBack={() => setCurrentScreen('viewSelection')} />;
      case 'order':
        if (loading) {
          return <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '1.25rem'}}>Đang tải dữ liệu từ server...</div>;
        }
        if (!selectedTable) return <ViewSelectionView onSelect={(view) => setCurrentScreen(view)} onBack={() => setCurrentScreen('start')} />;
        return (
          <OrderView
            table={selectedTable}
            menuCategories={MENU_CATEGORIES}
            onBack={() => setCurrentScreen(selectedTable.layout === 'Inside' ? 'inside' : 'outside')}
            onAddItem={handleAddItem}
            onUpdateQuantity={handleUpdateItemQuantity}
            onPayment={handlePayment}
          />
        );
      default:
        return <StartView onStart={() => setCurrentScreen('viewSelection')} />;
    }
  };

  return renderScreen();
};

export default App;
