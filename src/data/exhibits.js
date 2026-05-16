// Edit this array to change hallway sections, labels, content, colors, or wall placement.
// side controls which hallway wall the frame appears on: "left" or "right".
export const exhibits = [
  {
    id: "who-am-i",
    title: "Who Am I",
    side: "left",
    position: [-5.85, 2.42, -3],
    color: "#d1a34f",
    variant: "about",
    italicTitle: true,
    body: "I'm a software engineer based in Bengaluru with 2+ years of experience building production-grade applications across fintech, fleet management, and ed-tech domains. I specialize in React, TypeScript, and Node.js, and care deeply about reducing latency, eliminating redundant work, and writing code that scales.\n\nI believe the best engineering is invisible — users shouldn't notice the work, they should just feel the speed, the smoothness, the reliability. That obsession with craft is what drives me to dig deeper than the ticket, question the architecture, and never ship something I wouldn't be proud to maintain."
  },
  {
    id: "skills",
    title: "Skills",
    side: "right",
    position: [5.85, 2.42, -6],
    color: "#c8a96a",
    variant: "skills",
    italicTitle: true,
    groups: [
      {
        label: "Languages",
        items: ["javascript", "TypeScript", "Python"]
      },
      {
        label: "Frontend",
        items: ["React.js", "React Native", "Redux Toolkit", "Tailwind CSS", "Ant Design"]
      },
      {
        label: "Backend",
        items: ["Node.js", "Express.js", "Prisma"]
      },
      {
        label: "Database",
        items: ["PostgreSQL", "MongoDB"]
      },
      {
        label: "Cloud & Tools",
        items: ["AWS EC2", "S3", "Lambda", "CloudFront", "Docker", "Git", "Azure DevOps", "Jira"]
      }
    ]
  },
  {
    id: "reach-vantage",
    title: "Reach Vantage",
    role: "Software Engineer",
    period: "Nov 2024 — Present",
    side: "left",
    position: [-5.85, 2.42, -12],
    color: "#d1a34f",
    variant: "experience",
    bullets: [
      "Built FAMS (Fleet Asset Management System) features for 1000+ fleet assets",
      "Reduced NEP (New Event Creation Page) API calls from 7–8 to one controlled execution",
      "Improved event creation latency from ~8s to ~1s",
      "Built drag-and-drop technician scheduling flows",
      "Contributed to React Native FAMS implementation",
      "Migrated legacy HAML dashboards to React"
    ]
  },
  {
    id: "thoughtclan",
    title: "ThoughtClan",
    role: "Software Engineer",
    period: "Jul 2023 — Oct 2024",
    side: "right",
    position: [5.85, 2.42, -18],
    color: "#d1a34f",
    variant: "experience",
    bullets: [
      "Built ConnectsU multi-tenant microsite workflows",
      "Supported users, organizations, and partner roles",
      "Developed review and moderation features",
      "Delivered Timbukdo placement dashboard in 4 weeks",
      "Worked on data visualization for 1M+ records",
      "Built LFT modules with React, TypeScript, and GraphQL"
    ]
  },
  {
    id: "myfinfi",
    title: "Early Work",
    side: "left",
    position: [-5.85, 2.42, -24],
    color: "#d1a34f",
    variant: "compactExperience",
    sections: [
      {
        label: "ThoughtClan Internship",
        text: "Developed frontend components for a tool inventory system using React.js and Tailwind CSS, integrating APIs and managing application state."
      },
      {
        label: "MyFinfi Internship",
        text: "Built and optimized Node.js APIs for financial workflows such as \"Save Now Buy Later\", improving transaction processing and UI responsiveness."
      }
    ]
  }
];

export const contactLinks = ["Email", "LinkedIn", "GitHub"];
