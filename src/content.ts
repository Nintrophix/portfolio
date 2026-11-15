// Every fact on the page comes from Krithiv_Shankar_Resume.pdf (November 2026).
// The phone number is deliberately left out of the page.

export const CONTACT = {
  email: "krithiv.shankar@gmail.com",
  github: { label: "Nintrophix", href: "https://github.com/Nintrophix" },
  linkedin: { label: "krithiv-shankar", href: "https://www.linkedin.com/in/krithiv-shankar" },
  resume: "/Krithiv_Shankar_Resume.pdf",
};

export const NAV = [
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "record", label: "Record" },
  { id: "contact", label: "Contact" },
] as const;

export const FACTS = [
  { k: "Now", v: "Summer Intern, Irontronics", s: "May 2026 to present" },
  { k: "Also", v: "Core Member, Logic Play", s: "November 2026 to present" },
  { k: "Studying", v: "B.Tech CSE, SRM IST", s: "CGPA 8.88 / 10" },
];

// The three transformations, told once, in the statement section.
export const TURNS = [
  { from: "camera frames", to: "millimetre measurements", where: "Irontronics" },
  { from: "voice", to: "desktop actions", where: "Friday" },
  { from: "compiler errors", to: "lessons", where: "Debug Odyssey" },
];

export const IRONTRONICS = {
  org: "Irontronics",
  role: "Summer Intern",
  when: "May 2026 to present",
  title: "Measuring metal parts from a camera frame",
  body: "I worked on a project that scans metal part outlines and bolt-hole positions from camera frames using contour tracing and binary segmentation, achieving millimetre-level dimensional accuracy through manual pixel-to-mm calibration.",
  stack: ["HTML", "CSS3", "Canvas API", "WebRTC", "Blob API", "Python", "JavaScript", "React", "TypeScript"],
};

export const LOGIC_PLAY = {
  org: "Logic Play",
  role: "Core Member",
  when: "November 2026 to present",
  title: "Building for club projects and events",
  points: [
    "Built and optimised interactive features, algorithms, and logic systems for club projects and event platforms.",
    "Collaborated with cross-functional teams to debug, test, and deploy software solutions for club initiatives.",
  ],
};

export type Link = { label: string; href: string; kind: "github" | "live" };

export const PROJECTS = [
  {
    id: "friday",
    name: "Friday",
    kind: "Voice-controlled desktop assistant",
    when: "August 2026",
    body: "A voice-controlled desktop assistant, inspired by the assistant in Iron Man, that automates everyday computer tasks. It simplifies computer interaction through hands-free commands and provides a foundation for future automation features.",
    pipe: { label: "Friday's pipeline", steps: [["Hear", "VOSK, faster-whisper"], ["Think", "LLM API"], ["Speak", "pyttsx3"], ["Show", "PySide6, PyQt"]] },
    stack: ["Python", "LLM API", "VOSK", "faster-whisper", "PySide6", "PyQt", "pyttsx3"],
    links: [{ label: "GitHub", href: "https://github.com/Nintrophix/Friday", kind: "github" }] as Link[],
  },
  {
    id: "odyssey",
    name: "Debug Odyssey",
    kind: "Story-driven full-stack EdTech platform",
    when: "September 2026",
    note: "Finalist, Celestia 2.0",
    body: "A story-driven, full-stack EdTech platform that teaches beginner programmers how to systematically read, decode, and fix compiler errors across five major programming languages.",
    stack: ["HTML5", "CSS3", "Monaco Editor", "FastAPI", "Uvicorn / Gunicorn", "Python", "JavaScript", "Java", "C++", "Docker", "GitHub", "Vercel", "Google Cloud Run"],
    links: [{ label: "Live site", href: "https://bug-labs-beta-pink.vercel.app/", kind: "live" }] as Link[],
  },
  {
    id: "lost-found",
    name: "Lost and Found Hub",
    kind: "Full-stack campus portal",
    when: "November 2026",
    body: "A full-stack campus Lost and Found portal built with Node.js, Express, PostgreSQL on Supabase and Socket.io. Students can report, search, claim and recover items, with real-time private chat.",
    pipe: { label: "What students can do", steps: [["Report", "Post a lost or found item"], ["Search", "Find matching items"], ["Claim", "Request an item"], ["Recover", "Get it back"], ["Chat", "Real-time, private"]] },
    stack: ["Node.js", "Express 4", "Socket.io", "Multer", "EJS", "Tailwind CSS", "vanilla JS", "PostgreSQL on Supabase", "bcrypt", "Helmet", "custom CSRF middleware", "Sharp", "nodemon", "Render", "GitHub"],
    links: [
      { label: "Live site", href: "https://lost-found-hub-4grb.onrender.com/", kind: "live" },
      { label: "GitHub", href: "https://github.com/Nintrophix/Lost-Found-Hub", kind: "github" },
    ] as Link[],
  },
];

// [tool, where it appears in the work above]
export const SKILLS: { group: string; tools: [string, string?][] }[] = [
  { group: "Languages", tools: [["Python", "Friday, Debug Odyssey, Irontronics"], ["C"], ["HTML", "Debug Odyssey, Irontronics"], ["CSS", "Debug Odyssey, Irontronics"], ["Rust"], ["JavaScript", "Debug Odyssey, Irontronics, Lost and Found Hub"], ["SQL", "Lost and Found Hub"]] },
  { group: "Frameworks", tools: [["Django"], ["Flask"], ["FastAPI", "Debug Odyssey"], ["Streamlit"], ["Tailwind CSS", "Lost and Found Hub"], ["Node.js", "Lost and Found Hub"], ["Express.js", "Lost and Found Hub"]] },
  { group: "Libraries", tools: [["React", "Irontronics"], ["NumPy"], ["Pandas"], ["Scikit-learn"], ["XGBoost"], ["CatBoost"], ["OpenCV"], ["Socket.io", "Lost and Found Hub"]] },
  { group: "Technologies", tools: [["REST APIs"], ["Machine Learning"], ["Agentic AI"], ["Version Control"], ["Microsoft SQL Server"], ["WebSockets", "Lost and Found Hub"], ["Full Text Search"], ["Authentication", "Lost and Found Hub"], ["Web Security", "Lost and Found Hub"], ["ntfy"]] },
  { group: "Tools", tools: [["Vite"], ["Jupyter Notebook"], ["Figma"], ["SQLite"], ["Supabase", "Lost and Found Hub"], ["PostgreSQL", "Lost and Found Hub"], ["Google Colab"]] },
  { group: "Cloud and dev", tools: [["Docker", "Debug Odyssey"], ["Git", "Debug Odyssey, Lost and Found Hub"], ["GitHub", "Debug Odyssey, Lost and Found Hub"], ["VS Code"], ["Antigravity"], ["Render", "Lost and Found Hub"], ["Vercel", "Debug Odyssey"], ["Netlify"]] },
];

export const EDUCATION = {
  school: "SRM Institute of Science and Technology, Ramapuram",
  degree: "B.Tech in Computer Science and Engineering",
  when: "August 2024 to present",
  cgpa: "8.88",
  earlier: [
    { school: "Chinmaya Vidyalaya", what: "12th Boards", when: "2022 to 2024", score: "82.8%" },
    { school: "PCFL-KFI Pathashaala", what: "10th Boards", when: "2020 to 2022", score: "88.8%" },
  ],
};

export const HACKATHONS = [
  { name: "Celestia 2.0", tag: "Finalist", text: "Debug Odyssey, teaching debugging to beginners (EdTech)" },
  { name: "Sensora 2.0", text: "Worked on AuthenSight for intelligent document verification and fraud detection" },
  { name: "Adobe University Hackathon 2026", text: "Participated in the Brand Visibility case-study round" },
];

export const CERTS = [
  { name: "Computer Networks", text: "Computer Communications and Networks, Saylor" },
  { name: "Machine Learning A-Z [2026]", tag: "In progress", text: "ML, DL, AI with AWS, Python and R, by Kirill Eremenko" },
];

export const BEYOND = [
  { name: "Freelance web developer", text: "Customised websites built to request for multiple clients" },
  { name: "Poster designer", text: "Posters and promotional creatives for official events across organisations" },
  { name: "NGO volunteer, Green Global", text: "Community-focused activities and outreach" },
];
