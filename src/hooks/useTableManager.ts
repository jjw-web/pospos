import { useState, useCallback, useMemo, useEffect } from 'react';
import type { TableData, MenuItem, ToppingItem, PaymentMethod, Bill } from '../types';
import { INITIAL_TABLES } from '../../constants';
import { mergeOrderItems } from '../lib/merge-orders';
import { calcOrderTotal } from '../lib/order-utils';
import { db, DB_KEYS } from '../lib/db';

function loadTables(): Map<number, TableData> {
  const map = new Map<number, TableData>();

  try {
    const saved = localStorage.getItem(DB_KEYS.TABLES);
    if (saved) {
      const savedEntries = JSON.parse(saved) as [number, TableData][];
      savedEntries.forEach(([id, data]) => map.set(id, data));
    }
  } catch {
    // ignore parse errors
  }

  INITIAL_TABLES.forEach((t) => {
    if (!map.has(t.id)) {
      map.set(t.id, t);
    }
  });

  return map;
}

async function persistTablesAsync(tables: Map<number, TableData>): Promise<void> {
  const value = JSON.stringify(Array.from(tables.entries()));
  localStorage.setItem(DB_KEYS.TABLES, value);
  await db.setItem(DB_KEYS.TABLES, value);
}

async function loadTablesFromDB(): Promise<Map<number, TableData> | null> {
  try {
    const saved = await db.getItem<string>(DB_KEYS.TABLES);
    if (saved) {
      const map = new Map<number, TableData>();
      const savedEntries = JSON.parse(saved) as [number, TableData][];
      savedEntries.forEach(([id, data]) => map.set(id, data));

      INITIAL_TABLES.forEach((t) => {
        if (!map.has(t.id)) {
          map.set(t.id, t);
        }
      });
      return map;
    }
  } catch {
    // ignore errors, will use localStorage fallback
  }
  return null;
}

export function useTableManager() {
  const [tables, setTables] = useState<Map<number, TableData>>(loadTables);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTablesFromDB().then((dbTables) => {
      if (dbTables) {
        setTables(dbTables);
      }
      setIsLoaded(true);
    });
  }, []);

  const addItemsToTable = useCallback(
    (tableId: number, itemsToAdd: { menuItem: MenuItem; toppings?: ToppingItem[] }[]) => {
      setTables((prev) => {
        const next = new Map(prev);
        const table = next.get(tableId);
        if (!table) return prev;

        let newOrder = [...table.order];
        itemsToAdd.forEach(({ menuItem, toppings }) => {
          const hasTopping = toppings && toppings.length > 0;
          const existingIdx = hasTopping
            ? -1
            : newOrder.findIndex((i) => i.menuItem.id === menuItem.id && !i.toppings?.length);

          if (existingIdx >= 0) {
            newOrder = newOrder.map((item, idx) =>
              idx === existingIdx ? { ...item, quantity: item.quantity + 1 } : item
            );
          } else {
            newOrder = [...newOrder, { menuItem, quantity: 1, toppings: toppings ?? [] }];
          }
        });

        const updated: TableData = {
          ...table,
          order: newOrder,
          status: 'occupied',
          occupiedSince: table.occupiedSince ?? new Date().toISOString(),
        };
        next.set(tableId, updated);
        persistTablesAsync(next);
        return next;
      });
    },
    []
  );

  const updateItemQuantity = useCallback((tableId: number, menuItemId: number, change: number) => {
    setTables((prev) => {
      const next = new Map(prev);
      const table = next.get(tableId);
      if (!table) return prev;

      const newOrder = table.order
        .map((item) =>
          item.menuItem.id === menuItemId ? { ...item, quantity: item.quantity + change } : item
        )
        .filter((item) => item.quantity > 0);

      const updated: TableData = {
        ...table,
        order: newOrder,
        status: newOrder.length > 0 ? 'occupied' : 'available',
        occupiedSince: newOrder.length > 0 ? table.occupiedSince : undefined,
      };
      next.set(tableId, updated);
      persistTablesAsync(next);
      return next;
    });
  }, []);

  const updateItemNote = useCallback((tableId: number, menuItemId: number, note: string) => {
    setTables((prev) => {
      const next = new Map(prev);
      const table = next.get(tableId);
      if (!table) return prev;
      const newOrder = table.order.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, note } : item
      );
      next.set(tableId, { ...table, order: newOrder });
      persistTablesAsync(next);
      return next;
    });
  }, []);

  const addToppingToItem = useCallback(
    (
      tableId: number,
      mainItemId: number,
      toppingsToAdd: { id: number; name: string; price: number }[]
    ) => {
      setTables((prev) => {
        const next = new Map(prev);
        const table = next.get(tableId);
        if (!table) return prev;

        const newOrder = table.order.map((item) => {
          if (item.menuItem.id !== mainItemId) return item;
          let toppings = item.toppings ?? [];
          toppingsToAdd.forEach((t) => {
            const idx = toppings.findIndex((tp) => tp.id === t.id);
            if (idx >= 0) {
              toppings = toppings.map((tp, i) =>
                i === idx ? { ...tp, quantity: tp.quantity + 1 } : tp
              );
            } else {
              toppings = [...toppings, { ...t, quantity: 1 }];
            }
          });
          return { ...item, toppings };
        });

        next.set(tableId, { ...table, order: newOrder });
        persistTablesAsync(next);
        return next;
      });
    },
    []
  );

  const moveTable = useCallback((fromId: number, toId: number) => {
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
      persistTablesAsync(next);
      return next;
    });
  }, []);

  const mergeTables = useCallback((currentId: number, sourceId: number) => {
    if (currentId === sourceId) return;
    setTables((prev) => {
      const next = new Map(prev);
      const current = next.get(currentId);
      const source = next.get(sourceId);
      if (!current || !source || source.order.length === 0) return prev;

      const merged = mergeOrderItems(current.order, source.order);
      const since =
        [current.occupiedSince, source.occupiedSince].filter((s): s is string => !!s).sort()[0] ??
        new Date().toISOString();

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
      persistTablesAsync(next);
      return next;
    });
  }, []);

  const checkoutTable = useCallback(
    (tableId: number, paymentMethod: PaymentMethod): Bill | null => {
      const table = tables.get(tableId);
      if (!table || table.order.length === 0) return null;

      const bill: Bill = {
        id: Date.now(),
        table: table.name,
        items: table.order,
        total: calcOrderTotal(table.order),
        date: new Date().toISOString(),
        paymentMethod,
      };

      setTables((prev) => {
        const next = new Map(prev);
        const t = next.get(tableId);
        if (!t) return prev;
        next.set(tableId, {
          ...t,
          order: [],
          status: 'available',
          occupiedSince: undefined,
        });
        persistTablesAsync(next);
        return next;
      });

      return bill;
    },
    [tables]
  );

  const revertBill = useCallback((bill: Bill) => {
    setTables((prev) => {
      const next = new Map(prev);
      const target = Array.from(next.values()).find((t) => t.name === bill.table);

      if (target) {
        if (target.status === 'available' && target.order.length === 0) {
          next.set(target.id, {
            ...target,
            order: bill.items,
            status: 'occupied',
            occupiedSince: bill.date,
          });
        } else {
          const maxId = Math.max(0, ...Array.from(next.keys())) + 1;
          next.set(maxId, {
            id: maxId,
            name: `${bill.table}-hoàn tác`,
            layout: target.layout,
            status: 'occupied',
            order: bill.items,
            occupiedSince: bill.date,
          });
        }
      } else {
        const maxId = Math.max(0, ...Array.from(next.keys())) + 1;
        next.set(maxId, {
          id: maxId,
          name: bill.table,
          layout: 'Inside',
          status: 'occupied',
          order: bill.items,
          occupiedSince: bill.date,
        });
      }

      persistTablesAsync(next);
      return next;
    });
  }, []);

  const insideTables = useMemo(
    () => Array.from(tables.values()).filter((t) => t.layout === 'Inside'),
    [tables]
  );

  const outsideTables = useMemo(
    () => Array.from(tables.values()).filter((t) => t.layout === 'Outside'),
    [tables]
  );

  return {
    tables,
    insideTables,
    outsideTables,
    addItemsToTable,
    updateItemQuantity,
    updateItemNote,
    addToppingToItem,
    moveTable,
    mergeTables,
    checkoutTable,
    revertBill,
  };
}
