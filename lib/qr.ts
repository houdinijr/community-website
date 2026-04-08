import QRCode from "qrcode";

export async function generateQrCodeDataUrl(value: string) {
  return QRCode.toDataURL(value, {
    margin: 1,
    width: 320,
    color: {
      dark: "#0F172A",
      light: "#FFFFFF",
    },
  });
}
