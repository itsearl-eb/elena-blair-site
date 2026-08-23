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
    slug: "composure",
    title: "Composure",
    shootType: "Creative",
    date: "2026-06-25",
    featured: false,
    metaDescription: "Composure — a studio set with Zyra. Force that has decided not to move yet.",
    standfirst: "Not the absence of force, but force that has decided not to move yet.",

    opening: {
      mode: "A",
      tone: "dark",
      hero: {
        base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1787485587/EB_Creative_Still_Water_Zyra_25-06-26_22338_lnwdci.jpg",
        orientation: "portrait",
        alt: "Zyra seated, low angle, cloche hat and black tailoring against a dark ground"
      }
    },

    sequence: [
      { type: "full", frame: {
        base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1787485583/EB_Creative_Still_Water_Zyra_25-06-26_22192_heodia.jpg",
        orientation: "portrait",
        alt: "Zyra seated in a chrome-framed chair, beret and sleeveless vest"
      }},
      { type: "full", frame: {
        base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1787485623/EB_Creative_Still_Water_Zyra_25-06-26_22099_s9yzly.jpg",
        orientation: "portrait",
        alt: "Zyra standing full length, beret and vest, hands at hips"
      }},
      { type: "full", frame: {
        base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1787485582/EB_Creative_Still_Water_Zyra_25-06-26_22547_vt4bju.jpg",
        orientation: "portrait",
        alt: "Zyra in cloche hat and cape, hands drawn to the collar"
      }},
      { type: "full", frame: {
        base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1787485587/EB_Creative_Still_Water_Zyra_25-06-26_22480_ebth5u.jpg",
        orientation: "landscape",
        alt: "Close crop of Zyra, hands framing her face, warm lip against desaturated tone"
      }},
      { type: "full", frame: {
        base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1787485582/EB_Creative_Still_Water_Zyra_25-06-26_22453_bodyds.jpg",
        orientation: "portrait",
        alt: "Zyra full length in cloche and cape, gathering the cape closed"
      }},
      { type: "full", frame: {
        base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1787485576/EB_Creative_Still_Water_Zyra_25-06-26_22432_jbxzqh.jpg",
        orientation: "portrait",
        alt: "Zyra beside a mirror, cloche and cape, her reflection doubled"
      }},
      { type: "full", frame: {
        base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1787485587/EB_Creative_Still_Water_Zyra_25-06-26_22568_ozqhp4.jpg",
        orientation: "portrait",
        alt: "Zyra full length in cloche, cape and scarf, gaze off frame"
      }}
    ],

    credits: [
      { role: "Photography", name: "Earl Kiu" },
      { role: "Subject", name: "Zyra" },
      { role: "Make-up", name: "Katniss" }
    ],

    ogImageBase: "https://res.cloudinary.com/dj0puxegp/image/upload/v1787485587/EB_Creative_Still_Water_Zyra_25-06-26_22338_lnwdci.jpg"
  },
 
 {
  slug: "center-court",
  title: "Center Court",
  shootType: "Creative",
  date: "2026-06-13",
  featured: false, // flip to true only if you want it to replace/join Alt-Coded on home
  metaDescription:
    "Kidswear editorial in tennis whites — center-court poise worn like it was always hers.",
  standfirst: "She just walked on.",

  opening: {
    mode: "A",
    tone: "dark", // was "light" — flips type to parchment/bright-snow
    hero: {
      base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1781512194/EB_-Elsa-Tan-Creative-13-06-26-26006_jaurva.jpg",
      orientation: "portrait",
      alt: "Young tennis player in navy-and-white kit, arms crossed, leveling a cool stare at the camera on an aqua backdrop.",
    },
  },

  sequence: [
    { type: "full", frame: {
      base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1781513522/EB_-Elsa-Tan-Creative-13-06-26-26117_bpuugx.jpg",
      orientation: "portrait",
      alt: "Mid-serve, racket raised overhead, one foot up on a stool against aqua.",
    }},

    { type: "pair", frames: [
      { base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1781512219/EB_-Elsa-Tan-Creative-13-06-26-25989_selwzc.jpg",
        orientation: "portrait",
        alt: "Laughing with tennis balls tossed in the air around her head." },
      { base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1781512328/EB_-Elsa-Tan-Creative-13-06-26-26061_p74xqi.jpg",
        orientation: "portrait",
        alt: "Caught mid-throw, tennis balls suspended in the air." },
    ]},

    { type: "pair", frames: [
      { base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1781512409/EB_-Elsa-Tan-Creative-13-06-26-25680_j1mctv.jpg",
        orientation: "portrait",
        alt: "Face seen through the strings of a raised tennis racket." },
      { base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1781512489/EB_-Elsa-Tan-Creative-13-06-26-26129_xnagst.jpg",
        orientation: "portrait",
        alt: "Holding a racket across the face, eyes over the frame, two hands on the grip." },
    ]},

    { type: "full", frame: {
      base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1781513126/EB_-Elsa-Tan-Creative-13-06-26-25931_zgpc4l.jpg",
      orientation: "portrait",
      alt: "Two tennis balls held up over the eyes like goggles.",
    }},

    { type: "full", frame: {
      base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1781512511/EB_-Elsa-Tan-Creative-13-06-26-25594_wj9gld.jpg",
      orientation: "portrait",
      alt: "Seated on the floor, leaning back on one arm, full look in view.",
    }},

    // NOTE: 25856 is a slightly taller crop (~0.726 vs standard 0.75). It's in a
    // pair so height-matched flex hides it. If the frame model supports a per-frame
    // ratio override, 25856 ≈ 1672×2304; otherwise default portrait is fine.
    { type: "pair", frames: [
      { base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1781512541/EB_-Elsa-Tan-Creative-13-06-26-25856_qu9kog.jpg",
        orientation: "portrait",
        alt: "Hugging a full bag of tennis balls to the chest, chin resting on top." },
      { base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1781513266/EB_-Elsa-Tan-Creative-13-06-26-25869_wyyro1.jpg",
        orientation: "portrait",
        alt: "Turned away from camera, swinging an empty ball bag as tennis balls scatter across the floor." },
    ]},

    { type: "full", frame: {
      base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1781513284/EB_-Elsa-Tan-Creative-13-06-26-25609_w4bfzt.jpg",
      orientation: "landscape", // the one landscape in the set
      alt: "Lying back with hair fanned out, sneakers up, shot from above.",
    }},

    { type: "full", frame: {
      base: "https://res.cloudinary.com/dj0puxegp/image/upload/v1781512210/EB_-Elsa-Tan-Creative-13-06-26-26026_ctwmy8.jpg",
      orientation: "portrait",
      alt: "Lunging low across the frame, skirt and limbs thrown wide mid-motion.",
    }},
  ],

  credits: [
    { role: "Photography", name: "Earl Kiu" },
    { role: "Concept & Styling", name: "Earl Kiu" },
    { role: "Subject", name: "Elsa Tan" },
    { role: "Hair", name: "Anna Ng" },
  ],

  ogImageBase:
    "https://res.cloudinary.com/dj0puxegp/image/upload/v1781512409/EB_-Elsa-Tan-Creative-13-06-26-25680_j1mctv.jpg",
},
 
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
      { role: "Photography", name: "Earl Kiu", url: "https://earlkiu.com" },
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
      { role: "Photography", name: "Earl Kiu", url: "https://earlkiu.com" },
      { role: "Subject", name: "Zyra", url: "https://www.instagram.com/kaznoiryra/" },
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
