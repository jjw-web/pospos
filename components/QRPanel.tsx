import React, { useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { QR_ACCOUNTS } from '../constants';
import type { PaymentMethod, QRAccount, TransferHistoryItem } from '../src/types';
import { useQRManager } from '../src/hooks/useQRManager';
import {
  VIETQR_BANKS,
  buildVietQRPayload,
  getBankShortName,
  sanitizeAccountNumber,
  sanitizeVietQRNote,
} from '../src/lib/vietqr';
import { compressImageFile, isValidImageUrl } from '../src/lib/image-utils';
import {
  buildAutoQRName,
  detectAccountFromDataUrl,
  fetchImageAsDataUrl,
  type DecodedQRAccount,
} from '../src/lib/qr-decode';
import { includesNormalized } from '../src/lib/string-utils';
import ConfirmDialog from './ConfirmDialog';

// Thêm field method vào QR_ACCOUNTS để map đúng method
// Ví dụ: { name: 'QR BIDV', path: '/qr/bidv.png', method: 'BIDV' }
type DefaultQRAccount = (typeof QR_ACCOUNTS)[number] & {
  method?: PaymentMethod;
  bankBin?: string;
  accountNumber?: string;
  accountName?: string;
};

type Tab = 'pics' | 'cash';
type CashScreen = 'form' | 'confirm' | 'result';

interface CashResult {
  dataUrl: string;
  bankBin: string;
  accountNumber: string;
  amount?: number;
  note: string;
}

interface CashPending {
  bankBin: string;
  accountNumber: string;
  amount?: number;
  note: string;
}

/**
 * Nội dung 2 tab Pics/Cash — dùng trong màn hình QRView.
 * Không còn overlay modal: màn hình cha (QRView) lo header + nút quay lại.
 */
const QRPanel: React.FC = () => {
  const [tab, setTab] = useState<Tab>('pics');
  const [selectedQR, setSelectedQR] = useState<QRAccount | null>(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<QRAccount | null>(null);

  // ─── Tab Cash state ───
  const [cashScreen, setCashScreen] = useState<CashScreen>('form');
  const [bankBin, setBankBin] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amountText, setAmountText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [cashError, setCashError] = useState<string | null>(null);
  const [cashPending, setCashPending] = useState<CashPending | null>(null);
  const [cashResult, setCashResult] = useState<CashResult | null>(null);
  const [generating, setGenerating] = useState(false);

  const qr = useQRManager();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleDefaults: QRAccount[] = useMemo(
    () =>
      (QR_ACCOUNTS as DefaultQRAccount[])
        .filter((d) => !qr.hiddenDefaults.includes(d.name))
        .map((d, i) => ({
          id: `default-${i}-${d.name}`,
          name: d.name,
          path: d.path,
          isCustom: false,
          bankBin: d.bankBin,
          accountNumber: d.accountNumber,
          accountName: d.accountName,
        })),
    [qr.hiddenDefaults]
  );

  const picsList: QRAccount[] = useMemo(
    () => [...visibleDefaults, ...qr.customQRs],
    [visibleDefaults, qr.customQRs]
  );

  const switchTab = (t: Tab) => {
    setTab(t);
    setSelectedQR(null);
    setShowAddPopup(false);
    setPendingDelete(null);
    setCashError(null);
    if (t === 'pics') {
      setCashScreen('form');
      setCashResult(null);
    }
  };

  // ─── Tab Pics: thêm / xóa ───
  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.isCustom) {
      qr.removeCustomQR(pendingDelete.id);
    } else {
      qr.hideDefaultQR(pendingDelete.name);
    }
    if (selectedQR?.id === pendingDelete.id) setSelectedQR(null);
    setPendingDelete(null);
  };

  const fillCashFromAccount = (acc: QRAccount) => {
    if (acc.bankBin) setBankBin(acc.bankBin);
    if (acc.accountNumber) setAccountNumber(acc.accountNumber);
    setCashScreen('form');
    setCashError(null);
    setTab('cash');
    setSelectedQR(null);
  };

  const parseAmount = (): number | undefined => {
    const digits = amountText.replace(/[^0-9]/g, '');
    if (!digits) return undefined;
    return parseInt(digits, 10);
  };

  // Bước 1: validate → màn xác nhận (chống chuyển nhầm STK).
  // Bước 2: xác nhận → vẽ QR offline + lưu lịch sử.
  const handleGenerateQR = () => {
    setCashError(null);
    const cleanStk = sanitizeAccountNumber(accountNumber);
    setAccountNumber(cleanStk);
    try {
      buildVietQRPayload({
        bankBin,
        accountNumber: cleanStk,
        amount: parseAmount(),
        note: noteText,
      });
      setCashPending({
        bankBin,
        accountNumber: cleanStk,
        amount: parseAmount(),
        note: sanitizeVietQRNote(noteText),
      });
      setCashScreen('confirm');
    } catch (err) {
      setCashError(err instanceof Error ? err.message : 'Không tạo được QR.');
    }
  };

  const handleConfirmGenerate = async () => {
    if (!cashPending) return;
    setCashError(null);
    try {
      const payload = buildVietQRPayload({
        bankBin: cashPending.bankBin,
        accountNumber: cashPending.accountNumber,
        amount: cashPending.amount,
        note: cashPending.note,
      });
      setGenerating(true);
      const dataUrl = await QRCode.toDataURL(payload, {
        width: 640,
        margin: 2,
        errorCorrectionLevel: 'M',
      });
      qr.pushTransferHistory({
        bankBin: cashPending.bankBin,
        accountNumber: cashPending.accountNumber,
        lastUsed: new Date().toISOString(),
      });
      setCashResult({ dataUrl, ...cashPending });
      setCashScreen('result');
    } catch (err) {
      setCashError(err instanceof Error ? err.message : 'Không tạo được QR.');
      setCashScreen('form');
    } finally {
      setGenerating(false);
    }
  };

  const handlePickHistory = (h: TransferHistoryItem) => {
    setBankBin(h.bankBin);
    setAccountNumber(h.accountNumber);
    setCashError(null);
  };

  const maskedStk = (stk: string) =>
    stk.length > 4 ? `•••${stk.slice(-4)}` : stk;

  const bankLabel = (bin: string) => getBankShortName(bin) ?? bin;

  return (
    <>
      {!selectedQR && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {(['pics', 'cash'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                backgroundColor: tab === t ? 'var(--border)' : 'transparent',
                color: 'var(--text-main)',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t === 'pics' ? 'Pics' : 'Cash'}
            </button>
          ))}
        </div>
      )}

        {tab === 'pics' ? (
          <PicsTab
            list={picsList}
            hasHidden={qr.hiddenDefaults.length > 0}
            selectedQR={selectedQR}
            onSelect={setSelectedQR}
            onBack={() => setSelectedQR(null)}
            onAdd={() => setShowAddPopup(true)}
            onDelete={setPendingDelete}
            onRestore={qr.restoreDefaults}
            onUseForCash={fillCashFromAccount}
          />
        ) : (
          <CashTab
            screen={cashScreen}
            bankBin={bankBin}
            accountNumber={accountNumber}
            amountText={amountText}
            noteText={noteText}
            error={cashError}
            pending={cashPending}
            result={cashResult}
            generating={generating}
            history={qr.transferHistory}
            onBankChange={(v) => { setBankBin(v); setCashError(null); }}
            onStkChange={(v) => { setAccountNumber(sanitizeAccountNumber(v)); setCashError(null); }}
            onAmountChange={(v) => { setAmountText(v.replace(/[^0-9]/g, '').slice(0, 12)); setCashError(null); }}
            onNoteChange={(v) => setNoteText(v)}
            onGenerate={handleGenerateQR}
            onConfirmGenerate={handleConfirmGenerate}
            onPickHistory={handlePickHistory}
            onRemoveHistory={qr.removeTransferHistory}
            onBackToForm={() => { setCashScreen('form'); setCashPending(null); setCashResult(null); setCashError(null); }}
            maskedStk={maskedStk}
            bankLabel={bankLabel}
          />
        )}

      {showAddPopup && (
        <AddQRPopup
          existingNames={picsList.map((q) => q.name)}
          onClose={() => setShowAddPopup(false)}
          onSave={(qrItem) => {
            qr.addCustomQR(qrItem);
            setShowAddPopup(false);
          }}
          fileInputRef={fileInputRef}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          message={`Xóa "${pendingDelete.name}"?${pendingDelete.isCustom ? '' : ' (Có thể khôi phục lại sau)'}`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
};

// ─── Tab Pics ────────────────────────────────────────────────────────────────

interface PicsTabProps {
  list: QRAccount[];
  hasHidden: boolean;
  selectedQR: QRAccount | null;
  onSelect: (qr: QRAccount) => void;
  onBack: () => void;
  onAdd: () => void;
  onDelete: (qr: QRAccount) => void;
  onRestore: () => void;
  onUseForCash: (qr: QRAccount) => void;
}

const picsRowStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-surface)',
  borderRadius: '16px',
  padding: '16px 20px',
  textAlign: 'left',
  border: '1px solid var(--border)',
  color: 'var(--text-main)',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  transition: 'all 0.2s ease',
  width: '100%',
};

const PicsTab: React.FC<PicsTabProps> = ({
  list,
  hasHidden,
  selectedQR,
  onSelect,
  onBack,
  onAdd,
  onDelete,
  onRestore,
  onUseForCash,
}) => {
  if (selectedQR) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '20px',
            aspectRatio: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          <img
            src={selectedQR.path}
            alt={selectedQR.name}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        <p style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
          {selectedQR.name}
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onBack}
            style={{
              flex: 1, padding: '12px', borderRadius: '12px',
              border: '1px solid var(--border)', backgroundColor: 'transparent',
              color: 'var(--text-main)', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            ← Danh sách
          </button>
          {selectedQR.bankBin && selectedQR.accountNumber && (
            <button
              onClick={() => onUseForCash(selectedQR)}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                backgroundColor: '#10b981', color: 'white',
                fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              }}
            >
              Tạo QR tiền
            </button>
          )}
          <button
            onClick={() => onDelete(selectedQR)}
            style={{
              flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
              backgroundColor: '#e74c3c', color: 'white',
              fontSize: '15px', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Xóa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <button
        onClick={onAdd}
        style={{
          ...picsRowStyle,
          borderStyle: 'dashed',
          justifyContent: 'center',
          fontWeight: 700,
        }}
      >
        <span>+ Thêm ảnh QR</span>
      </button>
      {list.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', margin: '8px 0' }}>
          Chưa có mã QR nào — bấm + để thêm hoặc khôi phục mặc định bên dưới.
        </p>
      )}
      {list.map((qrItem) => (
        <div key={qrItem.id} style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onSelect(qrItem)}
            style={{ ...picsRowStyle, flex: 1 }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--border)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
            }}
          >
            <span>{qrItem.name}</span>
            <span style={{ opacity: 0.5 }}>→</span>
          </button>
          <button
            onClick={() => onDelete(qrItem)}
            title="Xóa"
            style={{
              borderRadius: '16px',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '0 14px',
            }}
          >
            Xóa
          </button>
        </div>
      ))}
      {hasHidden && (
        <button
          onClick={onRestore}
          style={{
            padding: '10px', borderRadius: '12px',
            border: '1px solid var(--border)', backgroundColor: 'transparent',
            color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Khôi phục QR mặc định
        </button>
      )}
    </div>
  );
};

// ─── Popup thêm QR ───────────────────────────────────────────────────────────

interface AddQRPopupProps {
  existingNames: string[];
  onClose: () => void;
  onSave: (qr: QRAccount) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const addInputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid var(--border)',
  backgroundColor: 'var(--bg-surface)',
  color: 'var(--text-main)',
  fontSize: '15px',
};

const AddQRPopup: React.FC<AddQRPopupProps> = ({ existingNames, onClose, onSave, fileInputRef }) => {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [preview, setPreview] = useState('');
  const [detected, setDetected] = useState<DecodedQRAccount | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Tự decode QR → điền tên + giữ BIN/STK. Thất bại thì nhập tay như cũ.
  const autoDetect = async (dataUrl: string) => {
    setDetected(null);
    setDetecting(true);
    try {
      const found = await detectAccountFromDataUrl(dataUrl);
      setDetected(found);
      if (found) {
        setName((prev) => (prev.trim() ? prev : buildAutoQRName(found.bankBin)));
      }
    } finally {
      setDetecting(false);
    }
  };

  const handlePickFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    const dataUrl = await compressImageFile(file);
    if (!dataUrl) {
      setError('Không đọc được file ảnh.');
      return;
    }
    setPreview(dataUrl);
    setLink('');
    void autoDetect(dataUrl);
  };

  const handleUseLink = async () => {
    setError(null);
    if (!isValidImageUrl(link)) {
      setError('Link chưa đúng (phải bắt đầu http...).');
      return;
    }
    const cleanLink = link.trim();
    setPreview(cleanLink);
    const dataUrl = await fetchImageAsDataUrl(cleanLink);
    if (dataUrl) {
      void autoDetect(dataUrl);
    }
  };

  const handleSave = () => {
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Nhập tên cho ảnh QR.');
      return;
    }
    if (existingNames.some((n) => n.toLowerCase() === cleanName.toLowerCase())) {
      setError('Tên này đã có rồi.');
      return;
    }
    if (!preview) {
      setError('Chọn ảnh từ máy hoặc dán link rồi bấm Dùng link.');
      return;
    }
    setSaving(true);
    onSave({
      id: `custom-${Date.now()}`,
      name: cleanName,
      path: preview,
      isCustom: true,
      bankBin: detected?.bankBin,
      accountNumber: detected?.accountNumber,
    });
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2000, padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)', borderRadius: '20px',
          padding: '24px', width: '100%', maxWidth: '420px',
          maxHeight: '85vh', overflowY: 'auto',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 16px', color: 'var(--text-main)', fontSize: '17px', fontWeight: 700 }}>
          + Thêm ảnh QR
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên chủ TK + bank (vd: QR HUNG MB)"
            maxLength={60}
            style={addInputStyle}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => { void handlePickFile(e.target.files?.[0]); e.target.value = ''; }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '12px', borderRadius: '12px', border: '1px dashed var(--border)',
              backgroundColor: 'transparent', color: 'var(--text-main)',
              fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Chọn ảnh từ máy
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="...hoặc dán link ảnh"
              inputMode="url"
              style={{ ...addInputStyle, flex: 1 }}
            />
            <button
              onClick={handleUseLink}
              style={{
                padding: '0 16px', borderRadius: '12px', border: 'none',
                backgroundColor: '#3b82f6', color: 'white',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              Dùng link
            </button>
          </div>
          {preview && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <img
                src={preview}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain' }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          {preview && detecting && (
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
              Đang nhận diện QR...
            </p>
          )}
          {preview && !detecting && detected && (
            <p style={{ margin: 0, fontSize: '13px', color: '#10b981', textAlign: 'center', fontWeight: 600 }}>
              Đã nhận diện: {getBankShortName(detected.bankBin) ?? detected.bankBin} • {detected.accountNumber} — gõ thêm tên chủ TK rồi Lưu
            </p>
          )}
          {preview && !detecting && !detected && (
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
              Không đọc được mã QR — nhập tên tay, ảnh chỉ để xem
            </p>
          )}
          {error && (
            <p style={{ margin: 0, fontSize: '13px', color: '#e74c3c', textAlign: 'center' }}>{error}</p>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px',
                border: '1px solid var(--border)', backgroundColor: 'transparent',
                color: 'var(--text-muted)', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                backgroundColor: '#10b981', color: 'white',
                fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Tab Cash ────────────────────────────────────────────────────────────────

interface CashTabProps {
  screen: CashScreen;
  bankBin: string;
  accountNumber: string;
  amountText: string;
  noteText: string;
  error: string | null;
  pending: CashPending | null;
  result: CashResult | null;
  generating: boolean;
  history: TransferHistoryItem[];
  onBankChange: (v: string) => void;
  onStkChange: (v: string) => void;
  onAmountChange: (v: string) => void;
  onNoteChange: (v: string) => void;
  onGenerate: () => void;
  onConfirmGenerate: () => void;
  onPickHistory: (h: TransferHistoryItem) => void;
  onRemoveHistory: (bankBin: string, accountNumber: string) => void;
  onBackToForm: () => void;
  maskedStk: (stk: string) => string;
  bankLabel: (bin: string) => string;
}

const cashInputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid var(--border)',
  backgroundColor: 'var(--bg-surface)',
  color: 'var(--text-main)',
  fontSize: '16px',
};

const cashLabelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  margin: '0 0 6px',
};

/**
 * Ô chọn ngân hàng có smart search: gõ tên (có/không dấu), tên viết tắt
 * hoặc mã BIN đều lọc được. Chữ trong danh sách 17px cho dễ bấm.
 */
const BankSearch: React.FC<{ bankBin: string; onPick: (bin: string) => void }> = ({
  bankBin,
  onPick,
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selected = VIETQR_BANKS.find((b) => b.bin === bankBin) ?? null;

  const results = query.trim()
    ? VIETQR_BANKS.filter((b) =>
        includesNormalized(`${b.shortName} ${b.fullName} ${b.bin}`, query.trim())
      )
    : VIETQR_BANKS;

  const handleFocus = () => {
    setQuery('');
    setOpen(true);
  };

  const handlePick = (bin: string) => {
    onPick(bin);
    setQuery('');
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          value={query || (selected ? selected.fullName : '')}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={handleFocus}
          placeholder="Tìm: MB, Vietcombank, 970422..."
          style={{ ...cashInputStyle, flex: 1 }}
        />
        {selected && (
          <button
            onClick={() => onPick('')}
            title="Bỏ chọn"
            style={{
              borderRadius: '12px',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              fontSize: '15px',
              cursor: 'pointer',
              padding: '0 14px',
            }}
          >
            ✕
          </button>
        )}
      </div>
      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 50 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '6px',
              maxHeight: '260px',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
              zIndex: 51,
            }}
          >
            {results.length === 0 && (
              <p style={{ margin: 0, padding: '14px', fontSize: '16px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Không tìm thấy ngân hàng
              </p>
            )}
            {results.map((b) => (
              <button
                key={b.bin}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handlePick(b.bin)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '13px 14px',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: b.bin === bankBin ? 'var(--border)' : 'transparent',
                  color: 'var(--text-main)',
                  fontSize: '17px',
                  fontWeight: b.bin === bankBin ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>{b.fullName}</span>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', flexShrink: 0 }}>
                  {b.bin}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const CashTab: React.FC<CashTabProps> = (props) => {
  const {
    screen, bankBin, accountNumber, amountText, noteText, error,
    pending, result, generating, history,
  } = props;

  if (screen === 'confirm' && pending) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', textAlign: 'center' }}>
          Xác nhận trước khi tạo QR
        </p>
        <div
          style={{
            border: '1px solid var(--border)', borderRadius: '14px',
            padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px',
          }}
        >
          <ConfirmRow label="Ngân hàng" value={props.bankLabel(pending.bankBin)} />
          <ConfirmRow label="Số tài khoản" value={pending.accountNumber} mono />
          {pending.amount !== undefined && (
            <ConfirmRow
              label="Số tiền"
              value={`${pending.amount.toLocaleString('vi-VN')}đ`}
              highlight
            />
          )}
          {pending.note !== '' && <ConfirmRow label="Nội dung" value={pending.note} />}
        </div>
        {error && (
          <p style={{ margin: 0, fontSize: '14px', color: '#e74c3c', textAlign: 'center' }}>{error}</p>
        )}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={props.onBackToForm}
            style={{
              flex: 1, padding: '13px', borderRadius: '12px',
              border: '1px solid var(--border)', backgroundColor: 'transparent',
              color: 'var(--text-main)', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            ← Sửa lại
          </button>
          <button
            onClick={props.onConfirmGenerate}
            disabled={generating}
            style={{
              flex: 1, padding: '13px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white', fontSize: '15px', fontWeight: 800, cursor: 'pointer',
              opacity: generating ? 0.6 : 1,
            }}
          >
            {generating ? 'Đang tạo...' : 'Đúng rồi, tạo QR'}
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'result' && result) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            backgroundColor: 'white', borderRadius: '20px', padding: '20px',
            marginBottom: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          <img
            src={result.dataUrl}
            alt="QR chuyển khoản"
            style={{ width: '100%', maxWidth: '300px', borderRadius: '8px' }}
          />
        </div>
        {result.amount !== undefined && (
          <p style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 800, color: 'var(--text-main)' }}>
            {result.amount.toLocaleString('vi-VN')}đ
          </p>
        )}
        <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--text-muted)' }}>
          {props.bankLabel(result.bankBin)} • {result.accountNumber}
          {result.note ? ` • ${result.note}` : ''}
        </p>
        <button
          onClick={props.onBackToForm}
          style={{
            width: '100%', padding: '12px', borderRadius: '12px',
            border: '1px solid var(--border)', backgroundColor: 'transparent',
            color: 'var(--text-main)', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          ← Tạo QR khác
        </button>
      </div>
    );
  }

  const amountNum = amountText ? parseInt(amountText, 10) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ position: 'relative' }}>
        <p style={cashLabelStyle}>Ngân hàng</p>
        <BankSearch
          bankBin={bankBin}
          onPick={(bin) => props.onBankChange(bin)}
        />
      </div>
      <div>
        <p style={cashLabelStyle}>Số tài khoản</p>
        <input
          value={accountNumber}
          onChange={(e) => props.onStkChange(e.target.value)}
          placeholder="Nhập hoặc dán STK"
          inputMode="text"
          maxLength={25}
          style={cashInputStyle}
        />
      </div>
      <div>
        <p style={cashLabelStyle}>Số tiền (đ)</p>
        <input
          value={amountText}
          onChange={(e) => props.onAmountChange(e.target.value)}
          placeholder="Để trống = QR không kèm tiền"
          inputMode="numeric"
          style={cashInputStyle}
        />
        {amountNum > 0 && (
          <p style={{ margin: '6px 0 0', fontSize: '15px', fontWeight: 700, color: '#10b981' }}>
            = {amountNum.toLocaleString('vi-VN')}đ
          </p>
        )}
      </div>
      <div>
        <p style={cashLabelStyle}>Nội dung (không dấu)</p>
        <input
          value={noteText}
          onChange={(e) => props.onNoteChange(e.target.value)}
          placeholder="vd: BONG CA PHE T3"
          maxLength={50}
          style={cashInputStyle}
        />
      </div>
      {error && (
        <p style={{ margin: 0, fontSize: '14px', color: '#e74c3c', textAlign: 'center' }}>{error}</p>
      )}
      <button
        onClick={props.onGenerate}
        disabled={generating}
        style={{
          padding: '14px', borderRadius: '14px', border: 'none',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white', fontSize: '16px', fontWeight: 800, cursor: 'pointer',
          opacity: generating ? 0.6 : 1,
        }}
      >
        {generating ? 'Đang tạo...' : 'Tạo QR chuyển khoản'}
      </button>

      {history.length > 0 && (
        <div>
          <p style={cashLabelStyle}>Đã dùng gần đây</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.map((h) => (
              <div key={`${h.bankBin}-${h.accountNumber}`} style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => props.onPickHistory(h)}
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: '12px',
                    border: '1px solid var(--border)', backgroundColor: 'transparent',
                    color: 'var(--text-main)', fontSize: '14px', fontWeight: 600,
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  {props.bankLabel(h.bankBin)} • {props.maskedStk(h.accountNumber)}
                </button>
                <button
                  onClick={() => props.onRemoveHistory(h.bankBin, h.accountNumber)}
                  title="Xóa khỏi lịch sử"
                  style={{
                    borderRadius: '12px', border: '1px solid var(--border)',
                    backgroundColor: 'transparent', color: 'var(--text-muted)',
                    fontSize: '14px', cursor: 'pointer', padding: '0 12px',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ConfirmRow: React.FC<{ label: string; value: string; mono?: boolean; highlight?: boolean }> = ({
  label,
  value,
  mono,
  highlight,
}) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline' }}>
    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
    <span
      style={{
        fontSize: highlight ? '20px' : '15px',
        fontWeight: 800,
        color: highlight ? '#10b981' : 'var(--text-main)',
        fontFamily: mono ? 'monospace' : undefined,
        textAlign: 'right',
        wordBreak: 'break-all',
      }}
    >
      {value}
    </span>
  </div>
);

export default QRPanel;
