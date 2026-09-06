import React, { useState, useCallback } from 'react';
import type { MenuItem, MenuCategory, PendingMenuLog } from '../src/types';

interface MenuViewProps {
  onBack: () => void;
  menuCategories: MenuCategory[];
  onUpdateMenuCategories: (categories: MenuCategory[]) => void;
}

const LOG_STORAGE_KEY = 'pending_menu_changes';

function loadPendingLogs(): PendingMenuLog[] {
  try {
    const raw = localStorage.getItem(LOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PendingMenuLog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePendingLogs(logs: PendingMenuLog[]): void {
  try {
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('[MenuView] Failed to save pending_menu_changes:', err);
  }
}

function downloadJson(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const MenuView: React.FC<MenuViewProps> = ({ onBack, menuCategories, onUpdateMenuCategories }) => {
  const [localMenuCategories, setLocalMenuCategories] = useState<MenuCategory[]>(menuCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    localMenuCategories[0]?.name || ''
  );
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    price: 0,
  });
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingPriceItem, setEditingPriceItem] = useState<{
    categoryName: string;
    itemId: number;
  } | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);

  // Log & Export state
  const [pendingLogs, setPendingLogs] = useState<PendingMenuLog[]>(() => loadPendingLogs());
  const [showLogModal, setShowLogModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const refreshPendingLogs = useCallback(() => {
    setPendingLogs(loadPendingLogs());
  }, []);

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100dvh',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    backgroundColor: '#111827',
    padding: '16px',
    paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))',
    paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
    boxSizing: 'border-box',
  };

  const wrapperStyle: React.CSSProperties = {
    maxWidth: '1280px',
    margin: '0 auto',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '24px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
  };

  const backButtonStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    padding: '8px 16px',
    backgroundColor: '#6b7280',
    color: 'white',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    opacity: 0,
    pointerEvents: 'auto',
  };

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '20px',
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #374151',
    backgroundColor: '#1f2937',
    color: 'white',
    flex: '1',
    minWidth: '140px',
  };

  const addButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    color: 'white',
  };

  const cellStyle: React.CSSProperties = {
    padding: '12px',
    borderBottom: '1px solid #374151',
    textAlign: 'left',
  };

  const deleteButtonStyle: React.CSSProperties = {
    padding: '6px 12px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  };

  const editButtonStyle: React.CSSProperties = {
    padding: '6px 12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginRight: '8px',
  };

  const saveButtonStyle: React.CSSProperties = {
    padding: '6px 12px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginRight: '8px',
  };

  const cancelButtonStyle: React.CSSProperties = {
    padding: '6px 12px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginRight: '8px',
  };

  const priceInputStyle: React.CSSProperties = {
    padding: '6px 8px',
    borderRadius: '4px',
    border: '1px solid #374151',
    backgroundColor: '#1f2937',
    color: 'white',
    width: '120px',
    fontSize: '14px',
  };

  // Sync toolbar button styles — CSS Variables compatible with Dark Theme
  const logButtonStyle: React.CSSProperties = {
    padding: '8px 14px',
    backgroundColor: 'var(--bg-surface, #1f2937)',
    color: 'var(--text-main, white)',
    border: '1px solid var(--border, #374151)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'background-color 0.2s',
  };

  const exportButtonStyle: React.CSSProperties = {
    padding: '8px 14px',
    backgroundColor: 'var(--bg-surface, #1f2937)',
    color: 'var(--text-main, white)',
    border: '1px solid var(--border, #374151)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'background-color 0.2s',
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.price) {
      const maxId = localMenuCategories.reduce((max, category) => {
        const categoryMaxId = Math.max(...category.items.map((item) => item.id), 0);
        return Math.max(max, categoryMaxId);
      }, 0);

      const item: MenuItem = {
        id: maxId + 1,
        name: newItem.name,
        price: Number(newItem.price),
      };

      const updatedCategories = localMenuCategories.map((category) =>
        category.name === selectedCategory
          ? { ...category, items: [...category.items, item] }
          : category
      );

      setLocalMenuCategories(updatedCategories);
      setNewItem({ name: '', price: 0 });

      // Tự động ghi log món mới vào pending_menu_changes
      const newLog: PendingMenuLog = {
        id: item.id,
        category: selectedCategory,
        name: item.name,
        price: item.price,
        addedAt: new Date().toISOString(),
      };
      const existingLogs = loadPendingLogs();
      const nextLogs = [...existingLogs, newLog];
      savePendingLogs(nextLogs);
      setPendingLogs(nextLogs);

      // Gọi callback để cập nhật menu ở cấp ứng dụng
      onUpdateMenuCategories(updatedCategories);
    }
  };

  const handleDeleteItem = (categoryName: string, itemId: number) => {
    const updatedCategories = localMenuCategories.map((category) =>
      category.name === categoryName
        ? { ...category, items: category.items.filter((item) => item.id !== itemId) }
        : category
    );

    setLocalMenuCategories(updatedCategories);

    // Gọi callback để cập nhật menu ở cấp ứng dụng
    onUpdateMenuCategories(updatedCategories);
  };

  const handleStartEditPrice = (categoryName: string, itemId: number, currentPrice: number) => {
    setEditingPriceItem({ categoryName, itemId });
    setEditingPrice(currentPrice);
  };

  const handleSavePrice = () => {
    if (editingPriceItem && editingPrice > 0) {
      const updatedCategories = localMenuCategories.map((category) =>
        category.name === editingPriceItem.categoryName
          ? {
              ...category,
              items: category.items.map((item) =>
                item.id === editingPriceItem.itemId ? { ...item, price: editingPrice } : item
              ),
            }
          : category
      );

      setLocalMenuCategories(updatedCategories);
      setEditingPriceItem(null);
      setEditingPrice(0);

      // Gọi callback để cập nhật menu ở cấp ứng dụng
      onUpdateMenuCategories(updatedCategories);
    }
  };

  const handleCancelEditPrice = () => {
    setEditingPriceItem(null);
    setEditingPrice(0);
  };

  const handleAddCategory = () => {
    if (newCategory && !localMenuCategories.some((cat) => cat.name === newCategory)) {
      const newCategoryObj: MenuCategory = {
        name: newCategory,
        items: [],
      };
      const updatedCategories = [...localMenuCategories, newCategoryObj];
      setLocalMenuCategories(updatedCategories);
      setSelectedCategory(newCategory);
      setNewCategory('');
      setShowCategoryForm(false);

      // Gọi callback để cập nhật menu ở cấp ứng dụng
      onUpdateMenuCategories(updatedCategories);
    }
  };

  const handleEditCategory = (oldName: string) => {
    if (newCategory && !localMenuCategories.some((cat) => cat.name === newCategory)) {
      const updatedCategories = localMenuCategories.map((category) =>
        category.name === oldName ? { ...category, name: newCategory } : category
      );
      setLocalMenuCategories(updatedCategories);
      setSelectedCategory(newCategory);
      setNewCategory('');
      setEditingCategory(null);

      // Gọi callback để cập nhật menu ở cấp ứng dụng
      onUpdateMenuCategories(updatedCategories);
    }
  };

  const handleDeleteCategory = (categoryName: string) => {
    if (localMenuCategories.length > 1) {
      const updatedCategories = localMenuCategories.filter((cat) => cat.name !== categoryName);
      setLocalMenuCategories(updatedCategories);
      setSelectedCategory(updatedCategories[0].name);

      // Gọi callback để cập nhật menu ở cấp ứng dụng
      onUpdateMenuCategories(updatedCategories);
    }
  };

  const handleCopyLogJson = async () => {
    const json = JSON.stringify(pendingLogs, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback cho iOS cũ / WebView
      const ta = document.createElement('textarea');
      ta.value = json;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error('[MenuView] copy failed:', e);
      }
      document.body.removeChild(ta);
    }
  };

  const handleDownloadLogJson = () => {
    const ts = new Date().toISOString().slice(0, 10);
    downloadJson(pendingLogs, `pending-menu-log-${ts}.json`);
  };

  const handleClearLog = () => {
    if (pendingLogs.length === 0) return;
    const confirmed = window.confirm(
      `Xóa toàn bộ ${pendingLogs.length} log món mới? Chỉ xóa sau khi đã đồng bộ vào code gốc.`
    );
    if (!confirmed) return;
    try {
      localStorage.removeItem(LOG_STORAGE_KEY);
    } catch (err) {
      console.error('[MenuView] Failed to clear log:', err);
    }
    setPendingLogs([]);
    setShowLogModal(false);
  };

  const handleExportFullMenu = () => {
    const ts = Date.now();
    downloadJson(localMenuCategories, `menu-backup-${ts}.json`);
  };

  const handleOpenLogModal = () => {
    refreshPendingLogs();
    setShowLogModal(true);
  };

  const categoryFormStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '16px',
  };

  const categoryStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: '#374151',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginRight: '8px',
    marginBottom: '8px',
  };

  const activeCategoryStyle: React.CSSProperties = {
    ...categoryStyle,
    backgroundColor: '#10b981',
  };

  const categoriesWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '20px',
  };

  return (
    <div style={containerStyle}>
      <div style={wrapperStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Quản Lý Menu</h1>
          <button
            onClick={onBack}
            style={backButtonStyle}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1f2937')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#6b7280')}
          >
            Quay lại
          </button>
        </div>

        {/* Toolbar: Log & Export */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          <button
            style={logButtonStyle}
            onClick={handleOpenLogModal}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#374151')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface, #1f2937)')}
          >
            📋 Log Món Mới ({pendingLogs.length})
          </button>
          <button
            style={exportButtonStyle}
            onClick={handleExportFullMenu}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#374151')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface, #1f2937)')}
          >
            📤 Xuất Full Menu Thiết Bị
          </button>
        </div>

        <div style={categoriesWrapperStyle}>
          <div style={{ width: '100%' }}>
            {showCategoryForm ? (
              <div style={categoryFormStyle}>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Tên nhóm mới"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <button style={addButtonStyle} onClick={handleAddCategory}>
                  Thêm nhóm
                </button>
                <button
                  style={backButtonStyle}
                  onClick={() => {
                    setShowCategoryForm(false);
                    setNewCategory('');
                  }}
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button style={addButtonStyle} onClick={() => setShowCategoryForm(true)}>
                + Thêm nhóm mới
              </button>
            )}
          </div>

          {localMenuCategories.map((category) => (
            <div key={category.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {editingCategory === category.name ? (
                <div style={categoryFormStyle}>
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="Tên nhóm mới"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <button style={addButtonStyle} onClick={() => handleEditCategory(category.name)}>
                    Lưu
                  </button>
                  <button
                    style={backButtonStyle}
                    onClick={() => {
                      setEditingCategory(null);
                      setNewCategory('');
                    }}
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <>
                  <button
                    style={category.name === selectedCategory ? activeCategoryStyle : categoryStyle}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    {category.name}
                  </button>
                  <button
                    style={{ ...deleteButtonStyle, padding: '4px 8px' }}
                    onClick={() => setEditingCategory(category.name)}
                  >
                    Sửa
                  </button>
                  <button
                    style={{ ...deleteButtonStyle, padding: '4px 8px' }}
                    onClick={() => handleDeleteCategory(category.name)}
                    disabled={localMenuCategories.length <= 1}
                  >
                    Xóa
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div style={formStyle}>
          <input
            style={inputStyle}
            type="text"
            placeholder="Tên món"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
          <input
            style={inputStyle}
            type="number"
            placeholder="Giá"
            value={newItem.price || ''}
            onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
          />
          <button
            style={addButtonStyle}
            onClick={handleAddItem}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#10b981')}
          >
            Thêm vào {selectedCategory}
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={cellStyle}>Tên món</th>
                <th style={cellStyle}>Giá</th>
                <th style={cellStyle}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {localMenuCategories
                .find((category) => category.name === selectedCategory)
                ?.items.map((item) => {
                  const isEditing =
                    editingPriceItem?.categoryName === selectedCategory &&
                    editingPriceItem?.itemId === item.id;
                  return (
                    <tr key={item.id}>
                      <td style={cellStyle}>{item.name}</td>
                      <td style={cellStyle}>
                        {isEditing ? (
                          <input
                            type="number"
                            style={priceInputStyle}
                            value={editingPrice}
                            onChange={(e) => setEditingPrice(Number(e.target.value))}
                            min="0"
                            step="1000"
                          />
                        ) : (
                          item.price.toLocaleString() + 'đ'
                        )}
                      </td>
                      <td style={cellStyle}>
                        {isEditing ? (
                          <>
                            <button
                              style={saveButtonStyle}
                              onClick={handleSavePrice}
                              onMouseOver={(e) =>
                                (e.currentTarget.style.backgroundColor = '#059669')
                              }
                              onMouseOut={(e) =>
                                (e.currentTarget.style.backgroundColor = '#10b981')
                              }
                            >
                              Lưu
                            </button>
                            <button
                              style={cancelButtonStyle}
                              onClick={handleCancelEditPrice}
                              onMouseOver={(e) =>
                                (e.currentTarget.style.backgroundColor = '#4b5563')
                              }
                              onMouseOut={(e) =>
                                (e.currentTarget.style.backgroundColor = '#6b7280')
                              }
                            >
                              Hủy
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              style={editButtonStyle}
                              onClick={() =>
                                handleStartEditPrice(selectedCategory, item.id, item.price)
                              }
                              onMouseOver={(e) =>
                                (e.currentTarget.style.backgroundColor = '#2563eb')
                              }
                              onMouseOut={(e) =>
                                (e.currentTarget.style.backgroundColor = '#3b82f6')
                              }
                            >
                              Sửa giá
                            </button>
                            <button
                              style={deleteButtonStyle}
                              onClick={() => handleDeleteItem(selectedCategory, item.id)}
                              onMouseOver={(e) =>
                                (e.currentTarget.style.backgroundColor = '#dc2626')
                              }
                              onMouseOut={(e) =>
                                (e.currentTarget.style.backgroundColor = '#ef4444')
                              }
                            >
                              Xóa
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setShowLogModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface, #1f2937)',
              color: 'var(--text-main, #f1f5f9)',
              border: '1px solid var(--border, #334155)',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '720px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border, #334155)',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                📋 Log Món Mới ({pendingLogs.length})
              </h2>
              <button
                onClick={() => setShowLogModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted, #94a3b8)',
                  fontSize: '22px',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
              {pendingLogs.length === 0 ? (
                <p style={{ color: 'var(--text-muted, #94a3b8)', margin: 0, fontSize: '14px' }}>
                  Chưa có món mới nào được thêm trên thiết bị này. Mỗi khi bấm &quot;Thêm vào [Category]&quot;,
                  món sẽ tự động ghi vào log này.
                </p>
              ) : (
                <pre
                  style={{
                    margin: 0,
                    padding: '12px',
                    backgroundColor: '#111827',
                    color: '#e5e7eb',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: '50vh',
                    overflowY: 'auto',
                  }}
                >
                  {JSON.stringify(pendingLogs, null, 2)}
                </pre>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                padding: '16px 20px',
                borderTop: '1px solid var(--border, #334155)',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={handleCopyLogJson}
                disabled={pendingLogs.length === 0}
                style={{
                  padding: '8px 16px',
                  backgroundColor: pendingLogs.length === 0 ? '#374151' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: pendingLogs.length === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  opacity: pendingLogs.length === 0 ? 0.6 : 1,
                }}
              >
                {copied ? '✓ Đã sao chép!' : 'Sao chép JSON'}
              </button>
              <button
                onClick={handleDownloadLogJson}
                disabled={pendingLogs.length === 0}
                style={{
                  padding: '8px 16px',
                  backgroundColor: pendingLogs.length === 0 ? '#374151' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: pendingLogs.length === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  opacity: pendingLogs.length === 0 ? 0.6 : 1,
                }}
              >
                Tải File JSON
              </button>
              <button
                onClick={handleClearLog}
                disabled={pendingLogs.length === 0}
                style={{
                  padding: '8px 16px',
                  backgroundColor: pendingLogs.length === 0 ? '#374151' : '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: pendingLogs.length === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  opacity: pendingLogs.length === 0 ? 0.6 : 1,
                }}
              >
                Xóa Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuView;
