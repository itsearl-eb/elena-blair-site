module.exports = {
  url: "https://elenablair.com",          // apex, no trailing slash, no www
  name: "Elena Blair",
  legalName: "Elite Corridor Sdn Bhd",
  // Corrected 24 September 2026 from the old-format `431111-V`, which the
  // footer carried hardcoded. Single-sourced here so the next place that
  // needs it reads this rather than adding a second copy to go stale — the
  // dashboard made the same correction in its own `company_settings`
  // (SETUP_BRIEF §13a / §123), and one number in two formats across two
  // properties is exactly what that section exists to prevent.
  registrationNumber: "199701015614",
  description: "Fashion editorial that gives garments something to say. We work at the intersection of styling and character — building images that hold their own beyond the brief.",
  email: "sayhello@elenablair.com",
  instagram: "https://www.instagram.com/elenablair.official/",
  // Default share image for pages without their own (home, archive). Alt-Coded hero.
  defaultOgImage: "https://res.cloudinary.com/dj0puxegp/image/upload/f_auto,q_auto,w_1200/v1780199258/Alt_Coded_-_Zyra_-_03-05-2025_10570-1_vcad33.jpg",
};
