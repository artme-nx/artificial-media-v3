/* Forma za upit /start/ (brand/27 i brand/28). SAV TEKST FORME je ovdje; logika je u js/start.js, izgled u css/pages.css (blok "START").
   Tri puta prema odabiru u koraku 1: AI video (6 koraka), samo website (5), samo something else (4). */
window.AM_START = {
  intro: {
    eyebrow: "Work with us",
    title: "Let's make something",
    text: "A few quick questions. About 60 seconds. We reply within one business day.",
    start: "Start"
  },
  next: "Next",
  back: "Back",
  choose: "Choose at least one to continue",

  need: {
    title: "What do you need?",
    hint: "AI video and website can go together",
    video: { label: "AI video", summary: "AI video" },
    web: { label: "Website", summary: "Website", off: "+ Add", on: "Added" },
    other: { label: "Something else", summary: "Something else", off: "Or", on: "Selected" }
  },

  /* ikone su oznake formata (uspravni okvir, vodoravni okvir, ekran na stalku, upitnik); logotipi platformi se ne crtaju */
  run: {
    title: "Where will it run?",
    hint: "Choose one or more",
    options: [
      { id: "social", label: "Social", sub: "Instagram, TikTok", icon: "M25 6h14a5 5 0 0 1 5 5v42a5 5 0 0 1-5 5H25a5 5 0 0 1-5-5V11a5 5 0 0 1 5-5ZM28.5 25v14l10-7Z" },
      { id: "web", label: "YouTube and web", sub: "", icon: "M10 15h44a4 4 0 0 1 4 4v26a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V19a4 4 0 0 1 4-4ZM27 25v14l11-7Z" },
      { id: "tv", label: "TV and big screens", sub: "", icon: "M6 10h52a2 2 0 0 1 2 2v30a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2ZM32 44v9M19 54h26" },
      { id: "unsure", label: "Not sure yet", sub: "", icon: "M32 6a26 26 0 1 0 0 52a26 26 0 0 0 0-52ZM24.5 25a7.5 7.5 0 1 1 11 6.6c-2.3 1.4-3.5 2.8-3.5 5.4M32 44v1", alone: true }
    ]
  },

  /* krug: 15 položaja na 320°, vrh je Yesterday */
  time: {
    title: "When do you need it?",
    stops: ["Yesterday", "48 hours", "3 days", "4 days", "5 days", "6 days", "1 week", "2 weeks", "3 weeks", "1 month", "2 months", "3 months", "4 months", "5 months", "6 months"],
    marks: [[0, "Yesterday"], [1, "48h"], [6, "1 week"], [9, "1 month"], [14, "6 months"]],
    leadFirst: "I needed it",
    lead: "Within",
    drag: "Drag around the circle",
    skip: "Just exploring"
  },

  budget: {
    title: "What budget are you working with?",
    drag: "Drag to set your budget",
    skip: "Not sure yet",
    video: { helper: "So we can suggest the right scope. AI video projects start at $3K.", stops: ["1,000", "2,000", "3,000", "5,000", "7,500", "10,000", "15,000", "20,000", "25,000+"], lo: "$1K", hi: "$25K+", start: 3 },
    web: { helper: "So we can suggest the right scope.", stops: ["500", "1,000", "1,500", "2,000", "2,500", "3,000", "4,000", "5,000+"], lo: "$500", hi: "$5K+", start: 3 }
  },

  note: {
    title: "Tell us about it in one sentence.",
    label: "Your project (optional)",
    labelRequired: "Your project",
    max: 600,
    placeholder: {
      video: "e.g. A 30-second launch ad for our new product, mostly for Instagram.",
      web: "e.g. A new website for our studio, with our work, prices and a contact form.",
      other: "e.g. What you want to make and where it will be used."
    },
    link: "Website or Instagram (optional)"
  },

  contact: {
    title: "Where should we send the reply?",
    name: "Name",
    email: "Email",
    company: "Company (optional)",
    send: "Send brief",
    reply: "We reply within one business day. No newsletter, no spam.",
    privacy: "We use your details only to reply to your brief. See our <a href=\"../privacy/\">Privacy Policy</a>."
  },

  sent: {
    status: "Brief sent",
    title: "Got it, ",
    rows: { need: "You need", run: "It runs on", time: "Timing", budget: "Budget", note: "Your note" },
    nextTitle: "What happens next",
    next: [
      "We read your brief and reply within one business day.",
      "A call to agree on exactly what you need.",
      "A fixed price. 50% to start.",
      "A preview before we finalize, so you see where we are.",
      "Final delivery once the balance is paid."
    ],
    home: "Back to the homepage"
  },

  error: "Something went wrong. Please try again or email us at <a href=\"mailto:kristian@artificialmediastudio.com\">kristian@artificialmediastudio.com</a>",
  status: "Start a project"
};
