export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// Base64 plus the crop request must fit Vercel's 4.5 MB request limit.
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export function validateField(field, value) {
  if(field.type==='photo') return value===null || typeof value==='string' && (UUID.test(value)||value===field.default);
  if(field.type==='price') return typeof value==='number' && Number.isFinite(value) && value>=0 && value<=10000000 && Math.abs(value*100-Math.round(value*100))<0.000001;
  if(typeof value!=='string'||!value.trim()||[...value].length>(field.maxLength||2000)||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)||/<\s*\/?\s*(script|iframe|style|svg|img|a|div|span|p)\b/i.test(value)) return false;
  if(field.type==='email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  if(field.type==='phone') return /^\+?[0-9 ()-]{6,30}$/.test(value);
  return true;
}
export function safeKey(key) { return typeof key==='string'&&/^[a-zA-Z0-9_.-]{1,160}$/.test(key); }
export function validateCrop(crop) {
  if(!crop||['left','top','width','height'].some(k=>!Number.isFinite(crop[k]))) throw new Error('INVALID_CROP');
  if(crop.left<0||crop.top<0||crop.width<=0||crop.height<=0||crop.left+crop.width>1.001||crop.top+crop.height>1.001) throw new Error('INVALID_CROP');
  return crop;
}

