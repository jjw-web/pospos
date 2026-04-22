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
  isDark: boolean;
  surface: string;
  textMain: string;
  textMuted: string;
  borderColor: string;
}

const OrderPanel: React.FC<OrderPanelProps> = ({
  order,
  menuCategories,
  orderSummaryTitle,
  onUpdateQuantity,
  onEditNote,
  onOpenToppings,
  panelRef,
  isDark,
  surface,
  textMain,
  textMuted,
  borderColor,
}) => {
  const groupedOrder = React.useMemo(
    () => groupItemsByCategory(order, menuCategories),
    [order, menuCategories]
  );

  return (
    <div
      ref={panelRef}
      style={{
        backgroundColor: surface,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: isDark
          ? '0 2px 10px rgba(0,0,0,0.25)'
          : '0 2px 10px rgba(0,0,0,0.08)',
        scrollMarginTop: 'calc(52px + env(safe-area-inset-top, 0px))',
        border: `1px solid ${isDark ? '#334155' : 'transparent'}`,
      }}
    >
      <h2
        style={{
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '15px',
          color: textMain,
        }}
      >
        {orderSummaryTitle}
      </h2>

      {order.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '30px 0',
            color: textMuted,
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
                color: textMain,
                marginTop: '20px',
                marginBottom: '10px',
                borderBottom: `1px solid ${borderColor}`,
                paddingBottom: '5px',
              }}
            >
              {category}
            </h3>
            {items.map((item) => (
              <OrderItemRow
                key={item.menuItem.id}
                item={item}
                onUpdateQuantity={(change) =>
                  onUpdateQuantity(item.menuItem.id, change)
                }
                onEditNote={() => onEditNote(item)}
                onOpenToppings={() => onOpenToppings(item)}
                isDark={isDark}
                textMain={textMain}
                textMuted={textMuted}
                borderColor={borderColor}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default React.memo(OrderPanel);