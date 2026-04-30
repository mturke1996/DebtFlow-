// @ts-nocheck
const FORMS: Record<string, (string | null)[]> = {
  '\u0621': ['\uFE80', null, null, null],
  '\u0622': ['\uFE81', '\uFE82', null, null],
  '\u0623': ['\uFE83', '\uFE84', null, null],
  '\u0624': ['\uFE85', '\uFE86', null, null],
  '\u0625': ['\uFE87', '\uFE88', null, null],
  '\u0626': ['\uFE89', '\uFE8A', '\uFE8B', '\uFE8C'],
  '\u0627': ['\uFE8D', '\uFE8E', null, null],
  '\u0628': ['\uFE8F', '\uFE90', '\uFE91', '\uFE92'],
  '\u0629': ['\uFE93', '\uFE94', null, null],
  '\u062A': ['\uFE95', '\uFE96', '\uFE97', '\uFE98'],
  '\u062B': ['\uFE99', '\uFE9A', '\uFE9B', '\uFE9C'],
  '\u062C': ['\uFE9D', '\uFE9E', '\uFE9F', '\uFEA0'],
  '\u062D': ['\uFEA1', '\uFEA2', '\uFEA3', '\uFEA4'],
  '\u062E': ['\uFEA5', '\uFEA6', '\uFEA7', '\uFEA8'],
  '\u062F': ['\uFEA9', '\uFEAA', null, null],
  '\u0630': ['\uFEAB', '\uFEAC', null, null],
  '\u0631': ['\uFEAD', '\uFEAE', null, null],
  '\u0632': ['\uFEAF', '\uFEB0', null, null],
  '\u0633': ['\uFEB1', '\uFEB2', '\uFEB3', '\uFEB4'],
  '\u0634': ['\uFEB5', '\uFEB6', '\uFEB7', '\uFEB8'],
  '\u0635': ['\uFEB9', '\uFEBA', '\uFEBB', '\uFEBC'],
  '\u0636': ['\uFEBD', '\uFEBE', '\uFEBF', '\uFEC0'],
  '\u0637': ['\uFEC1', '\uFEC2', '\uFEC3', '\uFEC4'],
  '\u0638': ['\uFEC5', '\uFEC6', '\uFEC7', '\uFEC8'],
  '\u0639': ['\uFEC9', '\uFECA', '\uFECB', '\uFECC'],
  '\u063A': ['\uFECD', '\uFECE', '\uFECF', '\uFED0'],
  '\u0640': ['\u0640', '\u0640', '\u0640', '\u0640'],
  '\u0641': ['\uFED1', '\uFED2', '\uFED3', '\uFED4'],
  '\u0642': ['\uFED5', '\uFED6', '\uFED7', '\uFED8'],
  '\u0643': ['\uFED9', '\uFEDA', '\uFEDB', '\uFEDC'],
  '\u0644': ['\uFEDD', '\uFEDE', '\uFEDF', '\uFEE0'],
  '\u0645': ['\uFEE1', '\uFEE2', '\uFEE3', '\uFEE4'],
  '\u0646': ['\uFEE5', '\uFEE6', '\uFEE7', '\uFEE8'],
  '\u0647': ['\uFEE9', '\uFEEA', '\uFEEB', '\uFEEC'],
  '\u0648': ['\uFEED', '\uFEEE', null, null],
  '\u0649': ['\uFEEF', '\uFEF0', null, null],
  '\u064A': ['\uFEF1', '\uFEF2', '\uFEF3', '\uFEF4'],
};

const LAM_ALEF: Record<string, [string, string]> = {
  '\u0622': ['\uFEF5', '\uFEF6'],
  '\u0623': ['\uFEF7', '\uFEF8'],
  '\u0625': ['\uFEF9', '\uFEFA'],
  '\u0627': ['\uFEFB', '\uFEFC'],
};

const DIACRITICS = new Set([
  '\u064B', '\u064C', '\u064D', '\u064E', '\u064F',
  '\u0650', '\u0651', '\u0652', '\u0670', '\u0610',
  '\u0611', '\u0612', '\u0613', '\u0614', '\u0615',
]);

function isArabicLetter(ch: string): boolean {
  return FORMS.hasOwnProperty(ch);
}
function isDiacritic(ch: string): boolean {
  return DIACRITICS.has(ch);
}
function isRightJoiningOnly(ch: string): boolean {
  const f = FORMS[ch];
  return f != null && f[2] === null;
}
function canJoinRight(ch: string): boolean {
  return isArabicLetter(ch);
}
function canJoinLeft(ch: string): boolean {
  return isArabicLetter(ch) && !isRightJoiningOnly(ch);
}

function reshapeArabic(text: string): string {
  const chars: string[] = [];
  for (const ch of text) {
    if (!isDiacritic(ch)) chars.push(ch);
  }

  const result: string[] = [];
  let i = 0;
  while (i < chars.length) {
    const ch = chars[i];
    if (!isArabicLetter(ch)) {
      result.push(ch);
      i++;
      continue;
    }
    if (ch === '\u0644' && i + 1 < chars.length && LAM_ALEF[chars[i + 1]]) {
      const alef = chars[i + 1];
      const prevChar = i > 0 ? chars[i - 1] : null;
      const prevCanJoinLeft = prevChar && canJoinLeft(prevChar);
      const lig = LAM_ALEF[alef];
      result.push(prevCanJoinLeft ? lig[1] : lig[0]);
      i += 2;
      continue;
    }
    const prevChar = i > 0 ? chars[i - 1] : null;
    const nextChar = i + 1 < chars.length ? chars[i + 1] : null;
    const prevJoinsLeft = prevChar != null && canJoinLeft(prevChar);
    const nextJoinsRight = nextChar != null && canJoinRight(nextChar);
    const currentCanJoinLeft = canJoinLeft(ch);
    const forms = FORMS[ch];
    let form: string;
    if (prevJoinsLeft && nextJoinsRight && currentCanJoinLeft) form = forms[3] || forms[0];
    else if (prevJoinsLeft) form = forms[1] || forms[0];
    else if (nextJoinsRight && currentCanJoinLeft) form = forms[2] || forms[0];
    else form = forms[0];
    result.push(form);
    i++;
  }
  return result.join('');
}

export function ar(text: string | number | null | undefined): string {
  if (text == null) return '';
  const str = String(text);
  if (!str) return '';
  const segments: { text: string; isArabic: boolean }[] = [];
  let current = '';
  let currentIsArabic = false;
  for (const ch of str) {
    const code = ch.charCodeAt(0);
    const isAr =
      (code >= 0x0600 && code <= 0x06ff) ||
      (code >= 0xfb50 && code <= 0xfdff) ||
      (code >= 0xfe70 && code <= 0xfeff);
    if (current === '') {
      currentIsArabic = isAr;
      current = ch;
    } else if (isAr === currentIsArabic || ch === ' ') {
      current += ch;
    } else {
      segments.push({ text: current, isArabic: currentIsArabic });
      current = ch;
      currentIsArabic = isAr;
    }
  }
  if (current) segments.push({ text: current, isArabic: currentIsArabic });
  const processed = segments.map((seg) => {
    if (!seg.isArabic) return seg.text;
    const reshaped = reshapeArabic(seg.text);
    return [...reshaped].reverse().join('');
  });
  return processed.reverse().join('');
}
