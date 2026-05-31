// ============================================================
//  THE ONE FILE YOU EDIT TO ADD / REMOVE / REORDER A PROJECT.
//  Append an object below. Sort order, prev/next (looped), the
//  archive grid, and OG tags all derive from this automatically.
//
//  Per frame, store the PLAIN Cloudinary url (the one Cloudinary
//  hands you, with /upload/v.../). The `cld` filter builds srcset
//  widths at render time — never hand-write srcset again.
//
//  orientation: "portrait" | "landscape"  (drives sizing + is-* class + pairing)
//  Default ratios: portrait 1728x2304, landscape 2304x1728.
//  Override per frame with w / h if a crop is non-standard.
// ============================================================

const cld = (url, w) => url.replace("/upload/", `/upload/f_auto,q_auto,w_${w}/`);

const projects = [
  {
    slug: "tough-sweet",
    title: "Tough Sweet",
    shootType: "Creative",
    date: "2026-01-11",
    metaDescription:
      "Tough Sweet — a Creative session by Elena Blair. Dressed for a fight she hasn't been picking, and far too at ease to start one.",
    standfirst:
      "Dressed for a fight she hasn\u2019t been picking \u2014 and far too at ease to start one.",
    opening: {
      mode: "A",
      tone: "light",
      hero: {
        base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1780128066/Tough_Sweet_-_Hailey_Chang_11-01-26_21265_xnblrb.jpg",
        orientation: "landscape",
        alt: "A child in a thorned-heart graphic top and white trousers reclining on the floor, one booted leg raised, looking calmly back at the camera.",
      },
    },
    sequence: [
      {
        type: "full",
        frame: {
          base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1780128103/Tough_Sweet_-_Hailey_Chang_-_11-01-26_21312_qulj6f.jpg",
          orientation: "portrait",
          alt: "The child stands on a plinth pulling both long braids out taut, cheeks puffed, holding the camera's gaze.",
        },
      },
      {
        type: "pair",
        frames: [
          {
            base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1780128127/Tough_Sweet_-_Hailey_Chang_-_11-01-26_21179_bxbohj.jpg",
            orientation: "portrait",
            alt: "The child crouches on a white cube, chin resting on a hand, looking out with a level, unhurried expression.",
          },
          {
            base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1780128128/Tough_Sweet_-_Hailey_Chang_-_11-01-26_21248_g9jsre.jpg",
            orientation: "portrait",
            alt: "In profile, the child leans against a tall wooden post, braids falling forward, calm and composed.",
          },
        ],
      },
      {
        type: "full",
        frame: {
          base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1780128156/Tough_Sweet_-_Hailey_Chang_-_11-01-26_21283_x1vha6.jpg",
          orientation: "landscape",
          alt: "Lying down with braids fanned out across the floor, the child looks up past the camera.",
        },
      },
      {
        type: "full",
        frame: {
          base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1780128155/Tough_Sweet_-_Hailey_Chang_-_11-01-26_21295_qbkzrd.jpg",
          orientation: "portrait",
          alt: "A tight crop of the child's face, brow lightly furrowed, looking down into the lens.",
        },
      },
      {
        type: "full",
        frame: {
          base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1780128155/Tough_Sweet_-_Hailey_Chang_-_11-01-26_21230_k1kwfz.jpg",
          orientation: "portrait",
          alt: "On the floor with boots kicked overhead and tongue out, mid-mischief.",
        },
      },
    ],
    credits: [
      { role: "Photography", name: "<dd><a href="URL" class="link-hover" target="https://earlkiu.com" rel="noopener">Earl Kiu</a></dd>" },
      { role: "Subject", name: "Hailey Chang" },
      { role: "Styling & Hair", name: "Kiki Yyan" },
    ],
    ogImageBase:
      "https://res.cloudinary.com/dj0puxegp/image/upload/v1780128155/Tough_Sweet_-_Hailey_Chang_-_11-01-26_21295_qbkzrd.jpg",
  },

  {
    slug: "alt-coded",
    title: "Alt-Coded",
    shootType: "Creative",
    date: "2025-05-03",
    featured: true,
    metaDescription:
      "Monochrome streetwear as armor — a character legible only to those who already know the code.",
    standfirst:
      "Monochrome as armor \u2014 legible only to those who already know the code.",
    opening: {
      mode: "A",
      tone: "light",
      hero: {
        base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1780199258/Alt_Coded_-_Zyra_-_03-05-2025_10570-1_vcad33.jpg",
        orientation: "portrait",
        alt: "Seated on the floor in black hooded streetwear and chunky boots, hand to cheek, holding the camera with a level stare.",
      },
    },
    sequence: [
      {
        type: "full",
        frame: {
          base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1780199303/Alt_Coded_-_Zyra_-_03-05-2025_10505_sybxsh.jpg",
          orientation: "portrait",
          alt: "Close frame, both hands raised to frame dark rectangular sunglasses, mouth open, hood up.",
        },
      },
      {
        type: "full",
        frame: {
          base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1780199486/Alt_Coded_-_Zyra_-_03-05-2025_10437-1_rqomdm.jpg",
          orientation: "portrait",
          alt: "Full-length, standing wide in oversized black hoodie and distressed wide-leg denim, holding sunglasses to her mouth.",
        },
      },
      {
        type: "full",
        frame: {
          base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1780199414/Alt_Coded_-_Zyra_-_03-05-2025_10604-1_nidnpf.jpg",
          orientation: "landscape",
          alt: "On the floor mid-movement, one booted leg kicked high, mouth open in a shout.",
        },
      },
      {
        type: "full",
        frame: {
          base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1780199387/Alt_Coded_-_Zyra_-_03-05-2025_10392_uscy9t.jpg",
          orientation: "portrait",
          alt: "Quiet frame, one hand over an eye, single eye holding the camera, hoodie graphic legible across the chest.",
        },
      },
      {
        // CLOSER — 10528 (swapped in for the dropped 10499).
        type: "full",
        frame: {
          base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1780200024/Alt_Coded_-_Zyra_-_03-05-2025_10528-1_ijbygh.jpg",
          orientation: "landscape",
          alt: "Close crop, hood tugged with both hands, sunglasses low on the nose, eyes holding the camera over the frames.",
        },
      },
    ],
    credits: [
      { role: "Photography", name: "Earl Kiu" },
      { role: "Subject", name: "Zyra" },
      { role: "Styling & Production", name: "Erienn" },
    ],
    ogImageBase:
      "https://res.cloudinary.com/dj0puxegp/image/upload/v1780199258/Alt_Coded_-_Zyra_-_03-05-2025_10570-1_vcad33.jpg",
  },
];

// --- derived: newest-first, looped prev/next, precomputed ogImage. Do not edit. ---
const sorted = projects.slice().sort((a, b) => b.date.localeCompare(a.date));
const n = sorted.length;
sorted.forEach((p, i) => {
  const next = sorted[(i + 1) % n];
  const prev = sorted[(i - 1 + n) % n];
  p.next = { slug: next.slug, title: next.title };
  p.prev = { slug: prev.slug, title: prev.title };
  p.ogImage = cld(p.ogImageBase, 1200);
});

module.exports = sorted;
