import React from 'react';
import type { Bill, MenuCategory } from '../../src/types';
import { countOrderItems, calcItemTotal } from '../../src/lib/order-utils';
import { groupItemsByCategory } from '../../src/lib/order-utils';

interface BillCardProps {
  bill: Bill;
  isSelected: boolean;
  menuCategories: MenuCategory[];
  onToggleSelect: (id: number) => void;
  cardRef?: (el: HTMLDivElement | null) => void;
  surface: string;
  textMain: string;
  textMuted: string;
  borderColor: string;
  isDark: boolean;
}

const BillCard: React.FC<BillCardProps> = ({
  bill,
  isSelected,
  menuCategories,
  onToggleSelect,
  cardRef,
  surface,
  textMain,
  textMuted,
  borderColor,
  isDark,
}) => {
  const { mainCount, toppingCount, snackCount } = countOrderItems(
    bill.items,
    menuCategories
  );
  const groupedItems = groupItemsByCategory(bill.items, menuCategories);

  return (
    <div
      ref={cardRef}
      style={{
        backgroundColor: surface,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '15px',
        border: isSelected ? '2px solid #3498db' : '2px solid transparent',
        cursor: 'pointer',
      }}
      onClick={() => onToggleSelect(bill.id)}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
        }}
      >
        <label
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect(bill.id);
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <span style={{ fontWeight: 'bold', color: textMain }}>
            Bàn {bill.table}
          </span>
        </label>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600, color: textMain }}>
            {bill.total.toLocaleString()}đ
          </div>
          <div style={{ fontSize: '12px', color: textMuted }}>
            {mainCount > 0 ? `Đồ uống: ${mainCount}` : ''}
            {snackCount > 0
              ? `${mainCount > 0 ? ', ' : ''}Snack: ${snackCount}`
              : ''}
            {toppingCount > 0
              ? `${mainCount > 0 || snackCount > 0 ? ', ' : ''}Topping: ${toppingCount}`
              : ''}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '13px', color: textMuted }}>
        {new Date(bill.date).toLocaleString('vi-VN')}
        {bill.paymentMethod && (
          <span
            style={{
              marginLeft: '10px',
              color: '#3498db',
              fontWeight: 500,
            }}
          >
            •{' '}
            {bill.paymentMethod === 'Cash'
              ? '💵 Tiền mặt'
              : bill.paymentMethod === 'BIDV'
              ? '🏦 BIDV'
              : '💳 JJW'}
          </span>
        )}
      </div>

      <hr
        style={{
          border: 'none',
          borderTop: `1px solid ${borderColor}`,
          margin: '15px 0',
        }}
      />

      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category}>
          <h4
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: isDark ? '#cbd5e1' : '#555',
              marginTop: '15px',
              marginBottom: '8px',
            }}
          >
            {category}
          </h4>
          <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '14px' }}>
            {items.map((item, index) => (
              <li
                key={`${item.menuItem.id}-${index}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '8px 0',
                  borderBottom: `1px solid ${isDark ? '#334155' : '#f9f9f9'}`,
                  color: textMain,
                }}
              >
                <div style={{ flex: 1 }}>
                  <span>{item.menuItem.name}</span>
                  <div style={{ fontSize: '12px', color: textMuted }}>
                    {item.quantity} x{' '}
                    {item.menuItem.price.toLocaleString()}đ
                  </div>
                  {item.note && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#e74c3c',
                        paddingLeft: '10px',
                      }}
                    >
                      {item.note}
                    </div>
                  )}
                  {item.toppings && item.toppings.length > 0 && (
                    <div
                      style={{
                        marginTop: '6px',
                        fontSize: '12px',
                        color: textMuted,
                        paddingLeft: '10px',
                      }}
                    >
                      {item.toppings.map((topping, tIndex) => (
                        <div
                          key={`${item.menuItem.id}-topping-${tIndex}`}
                        >
                          + {topping.quantity} x {topping.name} —{' '}
                          {(
                            topping.price * topping.quantity
                          ).toLocaleString()}
                          đ
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span style={{ fontWeight: 'bold' }}>
                  {calcItemTotal(item).toLocaleString()}đ
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default React.memo(BillCard);