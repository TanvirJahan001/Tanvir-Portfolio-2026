export const profile = {
  name: 'Tanvir Jahan',
  role: 'Full-Stack Developer & Software Engineer',
  availability: 'Open to collaboration',
  portrait: '/site/portrait.svg',
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
    year: '2021',
    period: '2021 – 2022',
    title: 'Customer Support Manager',
    organization: 'PioneerIT',
  },
  {
    year: '2022',
    period: '2022 – Present',
    title: 'Front-End Developer',
    organization: 'Freelance',
  },
  {
    year: '2023',
    period: '2023 – Present',
    title: 'Teacher',
    organization: 'Godagari Shishu Niketon',
  },
  {
    year: 'Now',
    period: 'Current role',
    title: 'Software Developer',
    organization: 'AI Media',
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

export const siteSections = [
  {
    id: 'about',
    label: 'About',
    detail: 'Who I am',
    marker: 'About me',
    caption: 'Rajshahi, Bangladesh',
  },
  {
    id: 'services',
    label: 'Services',
    detail: 'What I do',
    marker: 'What I do',
    caption: 'From interface to infrastructure',
  },
  {
    id: 'work',
    label: 'Work',
    detail: 'Three case studies',
    marker: 'Selected work',
    caption: 'Applications and experiments',
  },
  {
    id: 'building',
    label: 'Projects',
    detail: 'Other things I build',
    marker: 'Now building',
    caption: 'Projects of my own',
  },
  {
    id: 'experience',
    label: 'Experience',
    detail: 'My working history',
    marker: 'Experience',
    caption: 'People, products and systems',
  },
  {
    id: 'principles',
    label: 'Principles',
    detail: 'How I work',
    marker: 'Engineering principles',
    caption: 'Notes from my projects',
  },
  {
    id: 'experiments',
    label: 'After hours',
    detail: 'Creative experiments',
    marker: 'Off the clock',
    caption: 'Camera, keyboard and canvas',
  },
  {
    id: 'contact',
    label: 'Contact',
    detail: 'Start a conversation',
    marker: 'Contact',
    caption: 'Rajshahi, BST (UTC+6)',
  },
] as const;

export const heroCopy = {
  lines: ['Web apps built', 'for the way you work.'],
  body: 'I build web applications and business systems, from the interfaces people use to the workflows behind them.',
};
export const facts = [
  { value: '2022', unit: '', label: 'Freelance frontend work began' },
  { value: '03', unit: ' studies', label: 'Selected projects to explore' },
  { value: 'UTC', unit: '+6', label: 'Based in Rajshahi, Bangladesh' },
  { value: 'Full', unit: ' stack', label: 'From interface to database' },
];
export const services = [
  [
    'Frontend',
    'Responsive React and Next.js interfaces, built with careful attention to layout, keyboard access and the small details.',
  ],
  [
    'Dashboards',
    'Role-based views for work that crosses teams, from employee time records to payroll and reporting.',
  ],
  [
    'Data workflows',
    'PostgreSQL and Firebase backends that connect records, inventory and the people using them.',
  ],
  [
    'Authentication',
    'Account flows and permission checks that give each person the right tools for their role.',
  ],
  [
    'Integrations',
    'API connections and automations that carry information from one part of an application to the next.',
  ],
  [
    'Testing',
    'Build checks, database tests and browser walkthroughs for the paths people actually take.',
  ],
];
export const processSteps = [
  ['Discover', 'Understand the task and who needs to do it.'],
  ['Map', 'Trace the screens, records and handoffs.'],
  ['Design', 'Make the interface and data model fit together.'],
  ['Build', 'Connect the working pieces in small increments.'],
  ['Verify', 'Follow the whole flow in a real browser.'],
  ['Refine', 'Use what the checks reveal to improve the result.'],
];
export const sideProjects = [
  {
    title: 'Time Conversion App',
    summary:
      'A small clock for comparing the current UTC time and day with a chosen time zone.',
    stack: ['React', 'Tailwind CSS', 'date-fns-tz'],
    kind: 'Utility',
    status: 'Public source',
    href: profile.github + '/Time-Conversion-App',
  },
  {
    title: 'Attendance & Payroll',
    summary:
      'A Vue workspace that takes a daily check-in all the way to a monthly payslip.',
    stack: ['Vue 3', 'Firebase', 'Pinia'],
    kind: 'Web app',
    status: 'Sample demo',
    href: 'https://employee-attendance-payroll-system.vercel.app/login',
  },
  {
    title: 'AI Tutor Bangla',
    summary:
      'A curriculum platform design for offline learning, secure records and consistent exam grading.',
    stack: ['TypeScript', 'Platform design'],
    kind: 'Learning platform',
    status: 'Architecture study',
  },
];
export const principles = [
  {
    tab: 'Fit',
    title: 'Make the decision clear.',
    body: 'In the accessories store, I put connector types and device compatibility beside the buying decision. The interface should answer the question someone came with.',
    project: 'Mobile Accessories Store',
    slug: 'mobile-accessories',
  },
  {
    tab: 'Data',
    title: 'Follow the whole record.',
    body: 'In AgencyDesk, a shift carries through to a timesheet and payroll summary. I follow that record across roles so the next person has what they need.',
    project: 'AgencyDesk',
    slug: 'agencydesk',
  },
  {
    tab: 'Play',
    title: 'Give motion a purpose.',
    body: 'In the 3D desk, the keyboard moves with the typing on the monitor. Connecting the two makes a small interaction easier to read.',
    project: '3D Developer Desk',
    slug: 'developer-desk',
  },
];
export const deskStudies = [
  ['Camera', 'Orbit the room or zoom in on the desk.'],
  ['Keyboard', 'Watch the keys move with the typing sequence.'],
  ['Monitor', 'A canvas texture brings the screen into the scene.'],
];
export const questions = [
  [
    'What kind of work do you do?',
    'I build full-stack web applications, role-based dashboards and workflow integrations. AgencyDesk is a public sample you can explore.',
  ],
  [
    'Which projects can I try?',
    'AgencyDesk has a read-only sample workspace. The 3D Developer Desk is an interactive scene. Their case studies link to both demos.',
  ],
  [
    'Where are you based?',
    'I work from Rajshahi, Bangladesh, in the Asia/Dhaka time zone (UTC+6).',
  ],
  [
    'How can I discuss a project?',
    'Email me with the problem you are trying to solve, who will use the application, and any timing or technical constraints.',
  ],
];
export const contactSteps = [
  ['Tell me about it', 'Email a short description of your project.'],
  ['Compare notes', 'Discuss the people, workflows and constraints.'],
  ['Choose a next step', 'Agree on what to explore or build first.'],
];
