export const profile = {
  name: 'Tanvir Jahan',
  role: 'Full-Stack Developer & Software Engineer',
  location: 'Rajshahi, Bangladesh',
  email: 'tanvirjahan98@gmail.com',
  github: 'https://github.com/TanvirJahan001',
  linkedin: 'https://www.linkedin.com/in/ash-sams-md-tanvir-jahan/',
};

export interface Project {
  slug: string;
  title: string;
  category: string;
  status: string;
  summary: string;
  stack: string[];
  image: string;
  alt: string;
  repository: string;
  demo?: string;
  overview: string;
  decisions: { title: string; body: string }[];
}
export const projects: Project[] = [
  {
    slug: 'agencydesk',
    title: 'AgencyDesk',
    category: 'Business application',
    status: 'Public sample demo',
    summary:
      'A shared workspace for attendance, timesheets and payroll, with a different view for each role.',
    stack: ['Next.js', 'TypeScript', 'Firebase'],
    image: 'agencydesk',
    alt: 'Read-only AgencyDesk dashboard showing sample attendance and workforce totals',
    repository: profile.github + '/AgencyDesk',
    demo: 'https://agency-desk-six.vercel.app/demo',
    overview:
      'A workday starts with a clock-in, but its record has to serve several people. AgencyDesk follows that record from an employee’s shift to the timesheet an administrator reviews and the payroll summary leadership needs.',
    decisions: [
      {
        title: 'One record, several perspectives',
        body: 'Employees record their time and breaks. Administrators work with attendance and payroll records, while the leadership dashboard brings workforce reporting together.',
      },
      {
        title: 'A demo with a clear boundary',
        body: 'The public read-only workspace presents sample records so visitors can explore a populated dashboard without access to an organization’s employee data.',
      },
    ],
  },
  {
    slug: 'mobile-accessories',
    title: 'Mobile Accessories Store',
    category: 'E-commerce platform',
    status: 'Local development',
    summary:
      'A compatibility-first storefront with product specifications, inventory and persistent orders.',
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Better Auth', 'Docker'],
    image: 'store',
    alt: 'USB-C charger product page with device fit, price and specifications',
    repository: profile.github + '/AI-Ecommerce',
    overview:
      'Buying a charger or cable starts with a practical question. Will it work with my device? This development storefront puts compatibility and technical specifications beside the buying decision, then connects the catalog to an order workflow.',
    decisions: [
      {
        title: 'Make fit visible',
        body: 'Product detail pages bring device fit, connector information and specifications into the shopping flow so buyers can evaluate an accessory before adding it to their cart.',
      },
      {
        title: 'Carry the order through',
        body: 'PostgreSQL stores products, inventory and orders. Better Auth handles accounts, and Docker supports local database setup. Payments are simulated in this development project.',
      },
    ],
  },
  {
    slug: 'developer-desk',
    title: '3D Developer Desk',
    category: 'Creative development',
    status: 'Interactive experiment',
    summary:
      'An interactive room in miniature, complete with a typing monitor and an animated keyboard.',
    stack: ['Three.js', 'Vue.js'],
    image: 'desk',
    alt: 'Pastel 3D workspace viewed from above the monitor and keyboard',
    repository: profile.github + '/threejs-room-animation',
    demo: 'https://threejs-room-animation.vercel.app/',
    overview:
      'A desk is a small space with a lot of recognizable detail. This browser experiment turns that familiar scene into a room you can explore, using camera movement and small timed gestures to give it life.',
    decisions: [
      {
        title: 'Let the camera tell the story',
        body: 'Orbit and zoom controls let visitors choose a viewpoint, from the whole room down to the surface of the desk.',
      },
      {
        title: 'Connect movement to the screen',
        body: 'A canvas-driven monitor plays a typing and compiling sequence alongside the keyboard animation. The screen is part of the Three.js scene, so it moves with the room.',
      },
    ],
  },
];
export const experience = [
  {
    period: 'Current',
    title: 'Software Developer',
    organization: 'AI Media',
    contribution:
      'Develop role-based business dashboards with Next.js, Supabase and PostgreSQL.',
  },
  {
    period: '2022 — Present',
    title: 'Front-End Developer',
    organization: 'Freelance',
    contribution:
      'Translate client designs into responsive React interfaces, with accessibility and cross-browser checks.',
  },
];
export const skills = [
  [
    'Frontend',
    'Next.js, React, TypeScript, JavaScript, Tailwind CSS, responsive interfaces',
  ],
  [
    'Backend',
    'Node.js, PostgreSQL, Supabase, Firebase, REST APIs, authentication and authorization',
  ],
  [
    'Engineering',
    'Docker, Git, GitHub, Vercel, software architecture, automated testing, API integrations',
  ],
  [
    'Automation',
    'AI API integration, workflow automation, internal business systems, application integration',
  ],
];
export const chapters = [
  {
    name: 'Orbit',
    title: 'A practice in motion.',
    text: 'I’m Tanvir, a full-stack developer in Rajshahi. I move between interface design, application logic and the systems that connect them.',
    href: '/#about',
    link: 'About my practice',
  },
  {
    name: 'Systems',
    title: 'Work, connected.',
    text: 'AgencyDesk follows a working day from clock-in to payroll. Every point in the grid shares a record with the next.',
    href: '/projects/agencydesk',
    link: 'Explore AgencyDesk',
  },
  {
    name: 'Commerce',
    title: 'Finding the right fit.',
    text: 'The mobile accessories store connects product specifications, device compatibility and orders in a single shopping flow.',
    href: '/projects/mobile-accessories',
    link: 'Explore the storefront',
  },
  {
    name: 'Space',
    title: 'A room to explore.',
    text: 'A small developer desk became a study in spatial interfaces, timed animation and interactive cameras in Three.js.',
    href: '/projects/developer-desk',
    link: 'Explore the desk',
  },
];
