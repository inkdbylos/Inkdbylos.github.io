*/
window.INKD_CONFIG = {
  // Guide step 2.8 — the Web App URL from Apps Script (ends in /exec)
  API_URL: 'https://script.google.com/macros/s/AKfycbwVM560oF-rQD1eLBoYnsQE7IFsTyeWArkIoF0eucfjoAqf-Wb04CZUbrcp-epKw8HF/exec',

  // Guide step 2.5 — your Tattoo Request form link (from the "Links" tab of your Google Sheet)
  INQUIRY_FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSc53OurN3050vla9Z_cscnfgwSDgxRNX9SVCh3S5F45wTaCdA/viewform',

  // Guide step 2.7 — optional photo upload form link. Leave '' to hide it.
  PHOTO_UPLOAD_URL: 'https://forms.gle/u5Rc6TcfPz3bErhn6',

  PHONE: '918-212-8144',
  HANDLE: '@inkd.bylos',
  INSTAGRAM_URL: 'https://instagram.com/inkd.bylos',
  TIKTOK_URL: 'https://www.tiktok.com/@inkdbylos',

  // Portfolio — ONLY your own real tattoo photos (files go in the "images" folder)
  GALLERY: [
    { src: 'images/Largeback-6.jpg', title: 'Snake & florals', detail: 'Black & grey · Spine', healed: false },
    { src: 'images/Largeforarm-5.jpg', title: 'San Judas', detail: 'Black & grey · Forearm', healed: true },
    { src: 'images/Forearm-1.jpg', title: 'Laugh now, cry later', detail: 'Black & grey · Forearm', healed: true },
    { src: 'images/Hand-2.jpg', title: 'Aztec glyph', detail: 'Black & grey · Hand', healed: false },
    { src: 'images/Forearmsmall-4.jpg', title: 'Creation & Calvary', detail: 'Black & grey · Wrist', healed: false },
    { src: 'Neck-3.jpg', title: 'Trust the process', detail: 'Black & grey · Back of neck', healed: false },
  ],
};
