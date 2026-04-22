import React from 'react';
import type { OrderItem } from '../../src/types';

const NoteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

interface OrderItemRowProps {
  item: OrderItem;
  onUpdateQuantity: (change: number) => void;
  onEditNote: () => void;
  onOpenToppings: () => void;
  isDark: boolean;
  textMain: string;
  textMuted: string;
  borderColor: string;
}

const OrderItemRow: React.FC<OrderItemRowProps> = ({
  item,
  onUpdateQuantity,
  onEditNote,
  onOpenToppings,
  isDark,
  textMain,
  textMuted,
  borderColor,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: `1px solid ${borderColor}`,
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '16px', color: textMain }}>{item.menuItem.name}</span>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#3498db',
            }}
            onClick={onEditNote}
            aria-label="Ghi chú"
          >
            <NoteIcon />
          </button>
          <button
            style={{
              fontSize: '12px',
              padding: '4px 8px',
              border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`,
              borderRadius: '8px',
              color: isDark ? '#f8fafc' : '#1f2937',
              background: isDark ? '#334155' : '#f8fafc',
              cursor: 'pointer',
            }}
            onClick={onOpenToppings}
          >
            Topping
          </button>
        </div>

        {item.note && (
          <div style={{ fontSize: '13px', color: '#e74c3c', marginTop: '4px' }}>{item.note}</div>
        )}

        {item.toppings && item.toppings.length > 0 && (
          <div style={{ marginTop: '8px', color: textMuted, fontSize: '13px' }}>
            {item.toppings.map((topping, index) => (
              <div key={`${item.menuItem.id}-topping-${index}`}>
                + {topping.quantity} x {topping.name} —{' '}
                {(topping.price * topping.quantity).toLocaleString()}đ
              </div>
            ))}
          </div>
        )}

        <div style={{ color: textMuted, marginTop: '6px' }}>
          {(item.menuItem.price * item.quantity).toLocaleString()}đ
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          style={{
            width: '28px',
            height: '28px',
            border: `1px solid ${isDark ? '#475569' : '#ddd'}`,
            borderRadius: '50%',
            backgroundColor: isDark ? '#334155' : '#f8f9fa',
            color: textMain,
            cursor: 'pointer',
            fontSize: '18px',
            lineHeight: '24px',
          }}
          onClick={() => onUpdateQuantity(-1)}
        >
          -
        </button>
        <span
          style={{
            color: textMain,
            minWidth: '22px',
            textAlign: 'center',
          }}
        >
          {item.quantity}
        </span>
        <button
          type="button"
          style={{
            width: '28px',
            height: '28px',
            border: `1px solid ${isDark ? '#475569' : '#ddd'}`,
            borderRadius: '50%',
            backgroundColor: isDark ? '#334155' : '#f8f9fa',
            color: textMain,
            cursor: 'pointer',
            fontSize: '18px',
            lineHeight: '24px',
          }}
          onClick={() => onUpdateQuantity(1)}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default React.memo(OrderItemRow);
