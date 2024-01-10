import heic2any from 'heic2any';

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
      const dataUrl = reader.result;
      if (typeof dataUrl === 'string') resolve(dataUrl);
      reject('expected reader to return a string');
    });
    reader.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return blob;
}

function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.substring(dataUrl.indexOf(',') + 1);
}

function base64ToDataUrl(base64: string, mimetype: string): string {
  return `data:${mimetype};base64,${base64}`;
}

async function heicToPng(base64: string): Promise<string | undefined> {
  return heicToSomething(base64, { toType: 'image/png' });
}

async function heicToJpg(
  base64: string,
  quality?: number
): Promise<string | undefined> {
  return heicToSomething(base64, { toType: 'image/jpeg', quality });
}

interface ToJpgOptions {
  toType?: 'image/jpeg';
  quality?: number;
}
interface ToPngOptions {
  toType?: 'image/png';
}

async function heicToSomething(
  base64: string,
  options: ToJpgOptions | ToPngOptions
): Promise<string | undefined> {
  try {
    const dataUrl = base64ToDataUrl(base64, 'image/heic');
    const blob = await dataUrlToBlob(dataUrl);
    // conversionResult is a BLOB of the PNG formatted image
    const resultBlob = (await heic2any({ ...options, blob })) as Blob;
    const resultDataUrl = await blobToDataUrl(resultBlob as Blob);
    return dataUrlToBase64(resultDataUrl);
  } catch (error) {
    console.error(error);
  }
}

type ScriptOption = '0' | '1' | '2' | '3' | '4' | '5';
declare global {
  interface Window {
    convertHeicToPng: (
      heicAsBase64: string,
      fmScript: string,
      scriptOption?: ScriptOption
    ) => Promise<void>;

    convertHeicToJpg: (
      heicAsBase64: string,
      fmScript: string,
      scriptOption?: ScriptOption,
      jpgQuality?: number
    ) => Promise<void>;

    FileMaker: {
      PerformScriptWithOption: (
        script: string,
        param?: string,
        option?: ScriptOption
      ) => void;
    };
  }
}

// Here are the main functions called from FM
window.convertHeicToPng = async function (
  heicAsBase64: string,
  fmScript: string,
  scriptOption?: ScriptOption
): Promise<void> {
  try {
    const res = (await heicToPng(heicAsBase64)) as string;
    window.FileMaker.PerformScriptWithOption(fmScript, res, scriptOption);
  } catch (error) {
    console.error(error);
  }
};

window.convertHeicToJpg = async function (
  heicAsBase64: string,
  fmScript: string,
  scriptOption?: ScriptOption,
  jpgQuality?: number
): Promise<void> {
  try {
    const res = (await heicToJpg(heicAsBase64, jpgQuality)) as string;
    window.FileMaker.PerformScriptWithOption(fmScript, res, scriptOption);
  } catch (error) {
    console.error(error);
  }
};
