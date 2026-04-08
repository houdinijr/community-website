export type NewsItem = {
  title: string;
  date: string;
  summary: string;
};

export type ActivityItem = {
  title: string;
  date: string;
  description: string;
  images: string[];
};

export type LeaderItem = {
  name: string;
  role: string;
  bio: string;
  photoUrl?: string;
};

export type CabinetMemberItem = {
  name: string;
  role: string;
  photoUrl?: string;
};

export type SiteContent = {
  heroTitle: string;
  heroSubtitle: string;
  welcomeText: string;
  missionStatement: string;
  currentMandate: string;
  goals: string[];
  accomplishments: string[];
  latestNews: NewsItem[];
  activities: ActivityItem[];
  leaders: LeaderItem[];
  teams: string[];
  cabinetMembers: CabinetMemberItem[];
};

export const defaultSiteContent: SiteContent = {
  heroTitle: "Congolese Community in Zimbabwe",
  heroSubtitle: "Building belonging, leadership, and shared progress in Christ.",
  welcomeText:
    "Welcome to the Congolese Community in Zimbabwe - Building unity, leadership, and shared progress in Christ, Empowering every member to grow, serve, and lead.",
  missionStatement:
    "As Congolese students at Africa University in Zimbabwe, our mission is to build a strong and united community rooted in faith in Christ, fostering leadership, mutual support, and collaboration. We strive to cultivate opportunities for personal growth, social impact, and shared progress, creating a network of leaders dedicated to shaping a better world for ourselves and others.",
  currentMandate: "Mandate 2025-2026",
  goals: [
    "Unite all Congolese students in Zimbabwe",
    "Promote leadership and solidarity",
    "Create an environment for academic, social, and spiritual growth",
  ],
  accomplishments: [
    "Organization of cultural and academic events",
    "Active participation in social projects",
    "Development of talents within the community",
  ],
  latestNews: [
    {
      title: "Leadership fellowship prepares the next generation",
      date: "April 8, 2026",
      summary:
        "Students and community leaders gathered for prayer, mentorship, and strategic conversations on service, excellence, and unity in Christ.",
    },
    {
      title: "Community service team expands support projects",
      date: "March 24, 2026",
      summary:
        "Volunteers strengthened outreach initiatives that support student wellbeing, practical care, and positive social impact.",
    },
    {
      title: "Certificate recognition ceremony celebrates commitment",
      date: "March 10, 2026",
      summary:
        "Honorees were recognised for faithful service, leadership, and meaningful contribution to the Congolese community in Zimbabwe.",
    },
  ],
  activities: [
    {
      title: "Certificate Ceremonies",
      date: "April 2026",
      description:
        "Formal recognition gatherings that honour devotion, service, and leadership within the community.",
      images: [
        "/images/youth-workshop.svg",
        "/images/cultural-heritage.svg",
        "/images/family-outreach.svg",
      ],
    },
    {
      title: "Cultural Events",
      date: "Throughout the year",
      description:
        "Celebrations of Congolese identity through music, testimonies, fellowship, and shared cultural expression.",
      images: [
        "/images/cultural-heritage.svg",
        "/images/family-outreach.svg",
        "/images/youth-workshop.svg",
      ],
    },
    {
      title: "Community Projects",
      date: "Ongoing outreach",
      description:
        "Projects that encourage service, compassion, collaboration, and visible impact for members and surrounding communities.",
      images: [
        "/images/family-outreach.svg",
        "/images/youth-workshop.svg",
        "/images/cultural-heritage.svg",
      ],
    },
  ],
  leaders: [
    {
      name: "KAZUNGA NZAU ARIS",
      role: "President",
      bio: "Serves as president for the 2025-2026 mandate, helping guide the vision, direction, and unity of CECAU.",
    },
    {
      name: "Michel KABEYA MUKOJI",
      role: "Vice President",
      bio: "Supports coordination, leadership continuity, and the day-to-day strengthening of community initiatives for the 2025-2026 mandate.",
    },
    {
      name: "Maman Sunday Dina",
      role: "Spiritual Leader",
      bio: "Provides spiritual guidance, encouragement, and prayer support for the community during the 2025-2026 mandate.",
    },
  ],
  teams: [
    "Leadership Council",
    "Youth Ministry",
    "Women and Family Support",
    "Media and Communication Team",
    "Events and Logistics Team",
    "Certificate and Records Office",
  ],
  cabinetMembers: [
    { name: "KAZAD TSHIYEN ELIE", role: "Minister of Finance" },
    { name: "YOHARI MUSINDE CHATY", role: "Vice Minister of Finance" },
    { name: "KAMUANGA OKUDI GLOIRE", role: "Minister of Information Media and Press" },
    { name: "MUSUL NTAMBWE JORDY", role: "Vice Minister of Information Media and Press" },
    { name: "LOMBE KELEMA DAVID", role: "Minister of Education and Relationship" },
    { name: "CHABALA MWALE EMMANUEL", role: "Vice Minister of Education and Relationship" },
    { name: "KALUMBU HELENE VENICIA", role: "Minister of Social and Culture" },
    { name: "NJING MUSENG NEPHTALIE", role: "Vice Minister of Social and Culture" },
    { name: "MUGIZYA BALTHAZAR", role: "Minister of Sport and Entertainment" },
    { name: "MWEPU KABANGE ALICE", role: "Vice Minister of Sport and Entertainment" },
    { name: "NYUNDO KASONGO PRISCA", role: "Vice Spiritual Leader" },
  ],
};
