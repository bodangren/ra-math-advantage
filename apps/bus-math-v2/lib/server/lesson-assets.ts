/// <reference types="vite/client" />
// These imports belong only to server routes. Private workbooks must be inlined
// in the server bundle, never emitted as public asset URLs.
const studentWorkbooks = import.meta.glob<string>('../../public/workbooks/*.xlsx', {
  eager: true, import: 'default', query: '?url&inline',
});
const teacherWorkbooks = import.meta.glob<string>('../../resources/workbooks/*_teacher.xlsx', {
  eager: true, import: 'default', query: '?url&inline',
});
const pdfs = import.meta.glob<string>('../../public/pdfs/*.pdf', {
  eager: true, import: 'default', query: '?url&inline',
});
const datasets = import.meta.glob<string>('../../resources/datasets/*.csv', {
  eager: true, import: 'default', query: '?raw',
});

export function getWorkbookAsset(name: string, type: 'student' | 'teacher'): Uint8Array<ArrayBuffer> | null {
  const source = type === 'teacher' ? teacherWorkbooks : studentWorkbooks;
  const directory = type === 'teacher' ? 'resources' : 'public';
  return decodeAsset(source[`../../${directory}/workbooks/${name}`]);
}

export function getPdfAsset(name: string): Uint8Array<ArrayBuffer> | null {
  return decodeAsset(pdfs[`../../public/pdfs/${name}`]);
}

export function getDatasetAsset(name: string): string | null {
  return datasets[`../../resources/datasets/${name}`] ?? null;
}

function decodeAsset(value: string | undefined): Uint8Array<ArrayBuffer> | null {
  if (!value) return null;
  const prefix = value.indexOf(';base64,');
  if (!value.startsWith('data:') || prefix < 0) throw new Error('Lesson asset was not inlined in the server bundle.');
  return Uint8Array.from(atob(value.slice(prefix + 8)), character => character.charCodeAt(0));
}
