import React from 'react';
import type { OrderItem, MenuCategory } from '../../src/types';
import { groupItemsByCategory } from '../../src/lib/order-utils';
import OrderItemRow from './OrderItemRow';

interface OrderPanelProps {
  order: OrderItem[];
  menuCategories: MenuCategory[];
  orderSummaryTitle: string;
  onUpdateQuantity: (menuItemId: number, change: number) => void;
  onEditNote: (item: OrderItem) => void;
  onOpenToppings: (item: OrderItem) => void;
  panelRef: React.RefObject<HTMLDivElement>;
}

const OrderPanel: React.FC<OrderPanelProps> = ({
  order,
  menuCategories,
  orderSummaryTitle,
  onUpdateQuantity,
  onEditNote,
  onOpenToppings,
  panelRef,
}) => {
  const groupedOrder = React.useMemo(
    () => groupItemsByCategory(order, menuCategories),
    [order, menuCategories]
  );

  return (
    <div
      ref={panelRef}
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
        scrollMarginTop: 'calc(52px + env(safe-area-inset-top, 0px))',
        border: '1px solid var(--border)',
      }}
    >
      <h2
        style={{
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '15px',
          color: 'var(--text-main)',
        }}
      >
        {orderSummaryTitle}
      </h2>

      {order.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '30px 0',
            color: 'var(--text-muted)',
          }}
        >
          Chưa có món nào trong đơn hàng
        </div>
      ) : (
        Object.entries(groupedOrder).map(([category, items]) => (
          <div key={category}>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'var(--text-main)',
                marginTop: '20px',
                marginBottom: '10px',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '5px',
              }}
            >
              {category}
            </h3>
            {items.map((item) => (
              <OrderItemRow
                key={item.menuItem.id}
                item={item}
                onUpdateQuantity={(change) => onUpdateQuantity(item.menuItem.id, change)}
                onEditNote={() => onEditNote(item)}
                onOpenToppings={() => onOpenToppings(item)}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default React.memo(OrderPanel);
