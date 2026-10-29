/*
  INKD Studio — website settings
  Edit the values in quotes. Save, then upload this file to GitHub again.
*/
window.INKD_CONFIG = {
  // Guide step 2.8 — the Web App URL from Apps Script (ends in /exec)
  API_URL: 'https://script.google.com/macros/s/AKfycbwVM560oF-rQD1eLBoYnsQE7IFsTyeWArkIoF0eucfjoAqf-Wb04CZUbrcp-epKw8HF/exec'
  // Guide step 2.5 — your Tattoo Request form link (from the "Links" tab of your Google Sheet)
  INQUIRY_FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSc53OurN3050vla9Z_cscnfgwSDgxRNX9SVCh3S5F45wTaCdA/viewform',

  // Guide step 2.7 — optional photo upload form link. Leave '' to hide it.
  PHOTO_UPLOAD_URL: 'https://forms.gle/u5Rc6TcfPz3bErhn6',

  PHONE: '918-212-8144',
  HANDLE: '@INKD.byLos',
  INSTAGRAM_URL: 'https://instagram.com/inkd.bylos', // e.g. 'https://instagram.com/yourhandle'
  TIKTOK_URL: 'https://www.tiktok.com/@inkdbylos',    // e.g. 'https://tiktok.com/@yourhandle'

  /*
    Portfolio — ONLY your own real tattoo photos.
    1) Upload photos into the "images" folder on GitHub (JPG, under ~500 KB each).
    2) Add one line per photo below, inside the [ ].
    The "Work" section stays hidden until at least one photo is listed.

    Example:
    { src: 'images/back-piece-1.jpg', title: 'Back piece', detail: 'Black & grey · 3 sessions', healed: false },
  */
  GALLERY: [
  ],
};
