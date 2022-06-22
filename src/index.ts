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
  try {
    const dataUrl = base64ToDataUrl(base64, 'image/heic');
    const blob = await dataUrlToBlob(dataUrl);
    // conversionResult is a BLOB of the PNG formatted image
    const resultBlob = (await heic2any({ blob })) as Blob;
    const resultDataUrl = await blobToDataUrl(resultBlob as Blob);
    return dataUrlToBase64(resultDataUrl);
  } catch (error) {
    console.error(error);
  }
}

type ScriptOption = '0' | '1' | '2' | '3' | '4' | '5';
declare global {
  interface Window {
    convertHeicAndCallFM: (
      heicAsBase64: string,
      fmScript: string,
      scriptOption?: ScriptOption
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

// Here's the main function called from FM
window.convertHeicAndCallFM = async function (
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
