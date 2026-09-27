import { normalizeVietnamese } from './string-utils';

export interface VietQRInput {
  bankBin: string;
  accountNumber: string;
  amount?: number;
  note?: string;
}

export interface BankInfo {
  bin: string;
  shortName: string;
  fullName: string;
}

/**
 * Danh sách ngân hàng theo đúng api.vietqr.io/v2/banks (65 ngân hàng).
 * shortName + tên đầy đủ copy nguyên từ VietQR để đồng bộ với hệ sinh thái.
 * Dùng cho dropdown tab Cash — user chọn bank thay vì nhớ mã số.
 */
export const VIETQR_BANKS: BankInfo[] = [
  { bin: '970415', shortName: 'VietinBank', fullName: 'VietinBank' },
  { bin: '970436', shortName: 'Vietcombank', fullName: 'Vietcombank' },
  { bin: '970418', shortName: 'BIDV', fullName: 'BIDV' },
  { bin: '970405', shortName: 'Agribank', fullName: 'Agribank' },
  { bin: '970448', shortName: 'OCB', fullName: 'OCB' },
  { bin: '970422', shortName: 'MBBank', fullName: 'MBBank' },
  { bin: '970407', shortName: 'Techcombank', fullName: 'Techcombank' },
  { bin: '970416', shortName: 'ACB', fullName: 'ACB' },
  { bin: '970432', shortName: 'VPBank', fullName: 'VPBank' },
  { bin: '970423', shortName: 'TPBank', fullName: 'TPBank' },
  { bin: '970403', shortName: 'Sacombank', fullName: 'Sacombank' },
  { bin: '970437', shortName: 'HDBank', fullName: 'HDBank' },
  { bin: '970454', shortName: 'VietCapitalBank', fullName: 'VietCapitalBank' },
  { bin: '970429', shortName: 'SCB', fullName: 'SCB' },
  { bin: '970441', shortName: 'VIB', fullName: 'VIB' },
  { bin: '970443', shortName: 'SHB', fullName: 'SHB' },
  { bin: '970431', shortName: 'Eximbank', fullName: 'Eximbank' },
  { bin: '970426', shortName: 'MSB', fullName: 'MSB' },
  { bin: '546034', shortName: 'CAKE', fullName: 'CAKE by VPBank' },
  { bin: '546035', shortName: 'Ubank', fullName: 'Ubank by VPBank' },
  { bin: '971005', shortName: 'ViettelMoney', fullName: 'Viettel Money' },
  { bin: '963388', shortName: 'Timo', fullName: 'Timo' },
  { bin: '971011', shortName: 'VNPTMoney', fullName: 'VNPT Money' },
  { bin: '970400', shortName: 'SaigonBank', fullName: 'SaigonBank' },
  { bin: '970409', shortName: 'BacABank', fullName: 'BacABank' },
  { bin: '971025', shortName: 'MoMo', fullName: 'MoMo' },
  { bin: '971133', shortName: 'PVcomBank Pay', fullName: 'PVcomBank Pay' },
  { bin: '970412', shortName: 'PVcomBank', fullName: 'PVcomBank' },
  { bin: '970414', shortName: 'MBV', fullName: 'MBV' },
  { bin: '970419', shortName: 'NCB', fullName: 'NCB' },
  { bin: '970424', shortName: 'ShinhanBank', fullName: 'ShinhanBank' },
  { bin: '970425', shortName: 'ABBANK', fullName: 'ABBANK' },
  { bin: '970427', shortName: 'VietABank', fullName: 'VietABank' },
  { bin: '970428', shortName: 'NamABank', fullName: 'NamABank' },
  { bin: '970430', shortName: 'PGBank', fullName: 'PGBank' },
  { bin: '970433', shortName: 'VietBank', fullName: 'VietBank' },
  { bin: '970438', shortName: 'BaoVietBank', fullName: 'BaoVietBank' },
  { bin: '970440', shortName: 'SeABank', fullName: 'SeABank' },
  { bin: '970446', shortName: 'COOPBANK', fullName: 'COOPBANK' },
  { bin: '970449', shortName: 'LPBank', fullName: 'LPBank' },
  { bin: '970452', shortName: 'KienLongBank', fullName: 'KienLongBank' },
  { bin: '668888', shortName: 'KBank', fullName: 'KBank' },
  { bin: '977777', shortName: 'MAFC', fullName: 'MAFC' },
  { bin: '970442', shortName: 'HongLeong', fullName: 'Hong Leong' },
  { bin: '970467', shortName: 'KEBHANAHN', fullName: 'KEB Hana Hà Nội' },
  { bin: '970466', shortName: 'KEBHanaHCM', fullName: 'KEB Hana HCM' },
  { bin: '533948', shortName: 'Citibank', fullName: 'Citibank' },
  { bin: '970444', shortName: 'CBBank', fullName: 'CBBank' },
  { bin: '422589', shortName: 'CIMB', fullName: 'CIMB' },
  { bin: '796500', shortName: 'DBSBank', fullName: 'DBS Bank' },
  { bin: '970406', shortName: 'Vikki', fullName: 'Vikki' },
  { bin: '999888', shortName: 'VBSP', fullName: 'VBSP' },
  { bin: '970408', shortName: 'GPBank', fullName: 'GPBank' },
  { bin: '970463', shortName: 'KookminHCM', fullName: 'Kookmin HCM' },
  { bin: '970462', shortName: 'KookminHN', fullName: 'Kookmin Hà Nội' },
  { bin: '970457', shortName: 'Woori', fullName: 'Woori' },
  { bin: '970421', shortName: 'VRB', fullName: 'VRB' },
  { bin: '458761', shortName: 'HSBC', fullName: 'HSBC' },
  { bin: '970455', shortName: 'IBKHN', fullName: 'IBK Hà Nội' },
  { bin: '970456', shortName: 'IBKHCM', fullName: 'IBK HCM' },
  { bin: '970434', shortName: 'IndovinaBank', fullName: 'IndovinaBank' },
  { bin: '970458', shortName: 'UnitedOverseas', fullName: 'UOB' },
  { bin: '801011', shortName: 'Nonghyup', fullName: 'Nonghyup' },
  { bin: '970410', shortName: 'StandardChartered', fullName: 'Standard Chartered' },
  { bin: '970439', shortName: 'PublicBank', fullName: 'Public Bank' },
];

/**
 * Tra cứu tên ngân hàng từ BIN. Trả về shortName hoặc null nếu chưa biết.
 * @param bin - Mã BIN 6 số
 * @returns Tên viết tắt ngân hàng, hoặc null
 */
export function getBankShortName(bin: string): string | null {
  const found = VIETQR_BANKS.find((b) => b.bin === bin);
  return found ? found.shortName : null;
}

/**
 * Chuẩn hóa nội dung chuyển khoản về ASCII an toàn cho payload VietQR.
 * BẮT BUỘC chạy trước khi đưa vào tlv(): value.length đếm UTF-16,
 * ký tự có dấu sẽ làm sai độ dài byte khiến app ngân hàng không đọc được.
 * "Cà phê bàn 3 @#$" → "CA PHE BAN 3".
 * @param note - Nội dung gốc do user nhập
 * @returns Chuỗi ASCII uppercase, tối đa 50 ký tự
 */
export function sanitizeVietQRNote(note: string): string {
  return normalizeVietnamese(note)
    .toUpperCase()
    .replace(/[^A-Z0-9 ._-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 50);
}

/**
 * Chỉ giữ lại chữ + số (cho ô nhập STK — paste thoải mái, tự lọc).
 * Giữ chữ vì có mã merchant dạng alias (vd `V1THKD0109244`).
 * @param raw - Chuỗi user nhập/paste
 * @returns Chuỗi uppercase tối đa 25 ký tự
 */
export function sanitizeAccountNumber(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 25);
}

function tlv(id: string, value: string): string {
  return id + String(value.length).padStart(2, '0') + value;
}

/**
 * CRC16-CCITT (poly 0x1021, init 0xFFFF) — checksum field 63 chuẩn EMVCo.
 * @param str - Chuỗi ASCII cần tính checksum
 * @returns 4 ký tự hex uppercase, vd '29B1'
 */
export function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Kiểm tra input trước khi dựng payload. Ném Error message tiếng Việt
 * để UI hiện trực tiếp cho nhân viên.
 * STK cho phép chữ + số vì có mã merchant dạng alias
 * (vd BIDV `V1THKD0109244`) — VietQR chuẩn vẫn nhận.
 * @param input - Thông tin tài khoản + số tiền + nội dung
 */
export function validateVietQRInput(input: VietQRInput): void {
  if (!/^[0-9]{6}$/.test(input.bankBin)) {
    throw new Error('Chưa chọn ngân hàng.');
  }
  if (!/^[A-Z0-9]{6,25}$/i.test(input.accountNumber)) {
    throw new Error('Số tài khoản phải từ 6–25 ký tự (số hoặc mã merchant).');
  }
  if (input.amount !== undefined) {
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new Error('Số tiền phải lớn hơn 0.');
    }
    if (Math.round(input.amount) > 999999999999) {
      throw new Error('Số tiền quá lớn.');
    }
  }
}

/**
 * Dựng payload text VietQR theo chuẩn EMVCo/NAPAS.
 * Cấu trúc tag 38 copy đúng QR chuẩn do VietQR sinh ra (đã decode đối chiếu
 * từng byte với img.vietqr.io): subtag 01 PHẢI lồng 2 cấp
 * (`00`=BIN 6 số, `01`=STK), và KHÔNG có field 52 (MCC).
 * Để BIN+STK phẳng hoặc thêm MCC 0000 → app ngân hàng báo sai định dạng.
 * Có amount > 0 → QR động (point 12, app bank tự điền tiền);
 * không có amount → QR tĩnh (point 11).
 * Note được tự sanitize về ASCII bên trong nên luôn an toàn độ dài byte.
 * @param input - Bank BIN + STK + số tiền + nội dung
 * @returns Chuỗi payload sẵn sàng đưa vào lib qrcode để vẽ
 */
export function buildVietQRPayload(input: VietQRInput): string {
  validateVietQRInput(input);
  const beneficiary = tlv('00', input.bankBin) + tlv('01', input.accountNumber);
  const merchantInfo =
    tlv('00', 'A000000727') + tlv('01', beneficiary) + tlv('02', 'QRIBFTTA');
  const hasAmount = !!input.amount && input.amount > 0;
  let payload =
    tlv('00', '01') +
    tlv('01', hasAmount ? '12' : '11') +
    tlv('38', merchantInfo) +
    tlv('53', '704');
  if (hasAmount) {
    payload += tlv('54', String(Math.round(input.amount as number)));
  }
  payload += tlv('58', 'VN');
  const note = sanitizeVietQRNote(input.note ?? '');
  if (note) {
    payload += tlv('62', tlv('08', note));
  }
  payload += '6304';
  return payload + crc16(payload);
}
