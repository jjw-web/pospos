import React, { useState, useMemo, useCallback, useEffect, Suspense, lazy } from 'react';
import type { PaymentMethod, Bill, AppScreen } from './src/types';
import { useTableManager } from './src/hooks/useTableManager';
import { useHistoryManager } from './src/hooks/useHistoryManager';
import { useMenuManager } from './src/hooks/useMenuManager';
import { db, DB_KEYS } from './src/lib/db';
import InsideView from './components/InsideView';
import OutsideView from './components/OutsideView';
import OrderView from './components/OrderView';
import StartView from './components/StartView';
import ViewSelectionView from './components/ViewSelectionView';

const HistoryView = lazy(() => import('./components/HistoryView'));
const MenuView = lazy(() => import('./components/MenuView'));
const DailySummaryView = lazy(() => import('./components/DailySummaryView'));

import { checkVersion } from './src/lib/version-manager';

const LoadingScreen: React.FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontSize: '16px',
      color: '#94a3b8',
    }}
  >
    Đang tải...
  </div>
);

function loadScreen(): AppScreen {
  try {
    const saved = localStorage.getItem(DB_KEYS.CURRENT_SCREEN);
    const valid: AppScreen[] = [
      'start',
      'viewSelection',
      'inside',
      'outside',
      'order',
      'history',
      'menu',
      'dailySummary',
    ];
    if (saved && valid.includes(saved as AppScreen)) {
      return saved as AppScreen;
    }
  } catch {
    // ignore
  }
  return 'start';
}

async function loadScreenFromDB(): Promise<AppScreen | null> {
  try {
    const saved = await db.getItem<string>(DB_KEYS.CURRENT_SCREEN);
    const valid: AppScreen[] = [
      'start',
      'viewSelection',
      'inside',
      'outside',
      'order',
      'history',
      'menu',
      'dailySummary',
    ];
    if (saved && valid.includes(saved as AppScreen)) {
      return saved as AppScreen;
    }
  } catch {
    // ignore
  }
  return null;
}

function loadSelectedTableId(): number | null {
  try {
    const saved = localStorage.getItem(DB_KEYS.SELECTED_TABLE_ID);
    if (!saved) return null;
    const parsed = parseInt(saved, 10);
    return Number.isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

async function loadSelectedTableIdFromDB(): Promise<number | null> {
  try {
    const saved = await db.getItem<string>(DB_KEYS.SELECTED_TABLE_ID);
    if (!saved) return null;
    const parsed = parseInt(saved, 10);
    return Number.isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

const App: React.FC = () => {
  const [initialScreenLoaded, setInitialScreenLoaded] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('start');
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);

  useEffect(() => {
    checkVersion();
    loadScreenFromDB().then((screen) => {
      if (screen) setCurrentScreen(screen);
    });
    loadSelectedTableIdFromDB().then((id) => {
      if (id !== null) setSelectedTableId(id);
    });
    setInitialScreenLoaded(true);
  }, []);

  const tableManager = useTableManager();
  const historyManager = useHistoryManager();
  const menuManager = useMenuManager();

  useEffect(() => {
    if (!initialScreenLoaded) return;
    localStorage.setItem(DB_KEYS.CURRENT_SCREEN, currentScreen);
    db.setItem(DB_KEYS.CURRENT_SCREEN, currentScreen);
  }, [currentScreen, initialScreenLoaded]);

  useEffect(() => {
    if (!initialScreenLoaded) return;
    if (selectedTableId !== null) {
      localStorage.setItem(DB_KEYS.SELECTED_TABLE_ID, String(selectedTableId));
      db.setItem(DB_KEYS.SELECTED_TABLE_ID, String(selectedTableId));
    } else {
      localStorage.removeItem(DB_KEYS.SELECTED_TABLE_ID);
      db.removeItem(DB_KEYS.SELECTED_TABLE_ID);
    }
  }, [selectedTableId, initialScreenLoaded]);

  const selectedTable = useMemo(
    () => (selectedTableId !== null ? (tableManager.tables.get(selectedTableId) ?? null) : null),
    [selectedTableId, tableManager.tables]
  );

  const insideStats = useMemo(
    () => ({
      occupied: tableManager.insideTables.filter((t) => t.status === 'occupied').length,
      total: tableManager.insideTables.length,
    }),
    [tableManager.insideTables]
  );

  const outsideStats = useMemo(
    () => ({
      occupied: tableManager.outsideTables.filter((t) => t.status === 'occupied').length,
      total: tableManager.outsideTables.length,
    }),
    [tableManager.outsideTables]
  );

  const handleTableSelect = useCallback((tableId: number) => {
    setSelectedTableId(tableId);
    setCurrentScreen('order');
  }, []);

  const handlePayment = useCallback(
    (tableId: number, method: PaymentMethod) => {
      const bill = tableManager.checkoutTable(tableId, method);
      if (!bill) return;
      historyManager.addBill(bill);
      const table = tableManager.tables.get(tableId);
      setCurrentScreen(table?.layout === 'Inside' ? 'inside' : 'outside');
      setSelectedTableId(null);
    },
    [tableManager, historyManager]
  );

  const handleRevertBill = useCallback(
    (bill: Bill) => {
      if (!window.confirm(`Bạn có chắc muốn hoàn tác hóa đơn bàn ${bill.table}?`)) {
        return;
      }
      tableManager.revertBill(bill);
      historyManager.removeBill(bill.id);
      alert(`Đã hoàn tác hóa đơn bàn ${bill.table}.`);
    },
    [tableManager, historyManager]
  );

  const allTables = useMemo(() => Array.from(tableManager.tables.values()), [tableManager.tables]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'start':
        return <StartView onStart={() => setCurrentScreen('viewSelection')} />;

      case 'viewSelection':
        return (
          <ViewSelectionView
            onSelect={(view) => setCurrentScreen(view as AppScreen)}
            onBack={() => setCurrentScreen('start')}
            onHistory={() => setCurrentScreen('history')}
            insideStats={insideStats}
            outsideStats={outsideStats}
          />
        );

      case 'inside':
        return (
          <InsideView
            tables={tableManager.insideTables}
            onTableSelect={handleTableSelect}
            onBack={() => setCurrentScreen('viewSelection')}
          />
        );

      case 'outside':
        return (
          <OutsideView
            tables={tableManager.outsideTables}
            onTableSelect={handleTableSelect}
            onBack={() => setCurrentScreen('viewSelection')}
          />
        );

      case 'order':
        if (!selectedTable) {
          return (
            <ViewSelectionView
              onSelect={(view) => setCurrentScreen(view as AppScreen)}
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
            menuCategories={menuManager.menuCategories}
            allTables={allTables}
            onBack={() =>
              setCurrentScreen(selectedTable.layout === 'Inside' ? 'inside' : 'outside')
            }
            onHome={() => setCurrentScreen('viewSelection')}
            onAddItem={tableManager.addItemsToTable}
            onUpdateQuantity={tableManager.updateItemQuantity}
            onPayment={handlePayment}
            onUpdateNote={tableManager.updateItemNote}
            onMoveTable={(fromId, toId) => {
              tableManager.moveTable(fromId, toId);
              setSelectedTableId(toId);
            }}
            onMergeFromTable={tableManager.mergeTables}
            onAddTopping={tableManager.addToppingToItem}
          />
        );

      case 'history':
        return (
          <HistoryView
            history={historyManager.history}
            onClearHistory={historyManager.clearHistory}
            onDeleteSelected={historyManager.deleteBills}
            onBack={() => setCurrentScreen('viewSelection')}
            menuCategories={menuManager.menuCategories}
            onRevertBill={handleRevertBill}
          />
        );

      case 'menu':
        return (
          <MenuView
            onBack={() => setCurrentScreen('viewSelection')}
            menuCategories={menuManager.menuCategories}
            onUpdateMenuCategories={menuManager.updateMenuCategories}
          />
        );

      case 'dailySummary':
        return (
          <DailySummaryView
            history={historyManager.history}
            onBack={() => setCurrentScreen('viewSelection')}
          />
        );

      default:
        return <StartView onStart={() => setCurrentScreen('viewSelection')} />;
    }
  };

  return <Suspense fallback={<LoadingScreen />}>{renderScreen()}</Suspense>;
};

export default App;
