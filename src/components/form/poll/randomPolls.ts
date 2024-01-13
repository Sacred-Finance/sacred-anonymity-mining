export const getRandomPoll = () => {
  const randomIndex = Math.floor(Math.random() * randomPolls.length)
  return randomPolls[randomIndex]
}

export const randomPolls = [
  {
    title: 'Favorite Programming Language',
    content:
      'Vote for your preferred programming language. This helps us understand the most popular languages among our community.',
    options: ['JavaScript', 'Python', 'Java', 'C#', 'Go', 'Other'],
  },
  {
    title: 'Best Web Development Frameworks',
    content:
      'Which web development frameworks do you find most efficient and user-friendly? Your input will guide our future workshops.',
    options: ['React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js'],
  },
  {
    title: 'Preferred Database Technology',
    content:
      'Help us know your favorite database technology. This will assist us in creating targeted content and tutorials.',
    options: ['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Oracle', 'Other'],
  },
  {
    title: 'Mobile Development Preferences',
    content:
      'Do you prefer native or cross-platform mobile development? Your preferences are crucial for our upcoming courses.',
    options: ['Native', 'Cross-Platform', 'Hybrid', 'Progressive Web Apps', 'Other'],
  },
  {
    title: 'Cloud Service Provider of Choice',
    content: "Which cloud service provider do you rely on the most? We're gathering data for a comparative study.",
    options: ['AWS', 'Azure', 'Google Cloud', 'IBM Cloud', 'Oracle Cloud', 'Other'],
  },
  {
    title: 'Front-end Development Tools',
    content:
      'What are your go-to tools for front-end development? Share your preferences to help us enhance our tooling recommendations.',
    options: ['Code Editors', 'Version Control', 'Browser DevTools', 'Build Tools', 'Testing Frameworks', 'Other'],
  },
  {
    title: 'Most Useful Programming Paradigms',
    content:
      'Which programming paradigms do you find most effective? Your insights will contribute to our educational material.',
    options: ['Object-Oriented', 'Functional', 'Procedural', 'Event-Driven', 'Logic', 'Other'],
  },
  {
    title: 'Version Control Systems',
    content:
      "What version control system do you prefer using in your projects? We're curious about current trends in the developer community.",
    options: ['Git', 'SVN', 'Mercurial', 'Bazaar', 'Perforce', 'Other'],
  },
  {
    title: 'Best Practices for Code Review',
    content: 'Share your thoughts on what constitutes the best practices for code review in software development.',
    options: ['Timely Reviews', 'Automated Testing', 'Clear Guidelines', 'Peer Review', 'Pair Programming', 'Other'],
  },
  {
    title: 'Favorite JavaScript Libraries',
    content:
      'Which JavaScript libraries can you not live without? Help us understand your needs to focus our training resources.',
    options: ['React', 'Lodash', 'D3.js', 'jQuery', 'Underscore.js', 'Other'],
  },
  {
    title: 'Most Efficient Debugging Tools',
    content:
      "What debugging tools do you find most efficient? We're compiling a list of the best tools for developers.",
    options: ['Chrome DevTools', 'Visual Studio Debugger', 'GDB', 'Fiddler', 'Wireshark', 'Other'],
  },
  {
    title: 'Web Design Trends',
    content:
      'What web design trends are you currently excited about? Share your opinion to influence our design direction.',
    options: ['Minimalism', 'Dark Mode', '3D Elements', 'Neumorphism', 'Glassmorphism', 'Other'],
  },
  {
    title: 'Effective Project Management Methodologies',
    content:
      'Which project management methodologies work best for you? Your experience will help others choose the right approach.',
    options: ['Agile', 'Scrum', 'Kanban', 'Waterfall', 'Lean', 'Six Sigma', 'Other'],
  },
  {
    title: 'Challenges in Remote Work',
    content:
      'What are the biggest challenges you face in remote work? Your input will help us develop solutions for remote teams.',
    options: [
      'Communication',
      'Collaboration',
      'Time Management',
      'Distractions at Home',
      'Staying Motivated',
      'Other',
    ],
  },
  {
    title: 'Future of Artificial Intelligence in Development',
    content:
      'How do you see artificial intelligence impacting software development in the future? Share your predictions.',
    options: [
      'Automated Code Review',
      'AI-assisted Programming',
      'Predictive Development Tools',
      'AI in Testing',
      'Personalized User Experiences',
      'Other',
    ],
  },
  {
    title: 'Impact of 5G on Web Development',
    content:
      "What impact do you think 5G will have on web development? We're exploring the future of internet technologies.",
    options: [
      'Faster Load Times',
      'More Interactive Web Apps',
      'Enhanced Streaming Capabilities',
      'IoT Integration',
      'Real-time Data Processing',
      'Other',
    ],
  },
  {
    title: 'Cybersecurity Best Practices',
    content: 'What are your top cybersecurity best practices? Help us educate the community on staying safe online.',
    options: [
      'Regular Updates',
      'Strong Password Policies',
      'Multi-factor Authentication',
      'Employee Training',
      'Regular Security Audits',
      'Other',
    ],
  },
  {
    title: 'Sustainable Coding Practices',
    content:
      'How do you incorporate sustainability in your coding practices? Share your tips for eco-friendly development.',
    options: [
      'Energy-efficient Algorithms',
      'Reducing Code Redundancy',
      'Utilizing Green Servers',
      'Eco-friendly Hosting Providers',
      'Sustainable Data Storage Solutions',
      'Other',
    ],
  },
  {
    title: 'Importance of UI/UX in Software Projects',
    content: "How important is UI/UX design in your software projects? We're gathering insights for our design team.",
    options: ['Critical', 'Very Important', 'Moderately Important', 'Slightly Important', 'Not Important', 'Other'],
  },
  {
    title: 'Evolution of Web Technologies',
    content:
      'How do you think web technologies have evolved over the past decade? Share your observations and thoughts.',
    options: [
      'From Static to Dynamic',
      'Responsive Design',
      'API-First Development',
      'Progressive Web Apps',
      'Serverless Architectures',
      'Other',
    ],
  },
]
