/**
 * OpenToNetwork - LinkedIn Clone Backend
 * Built from REA (Reverse Engineer Anything) captured evidence:
 *   Evidence ID: ev_0befe5b572cd75c45f024763f2f85ea0d413beca04f47333719fb6c86091e769
 *   Captured: LinkedIn.com guest homepage (Chromium 156.0.8078.47)
 *   Real API contracts: /litms/api/metadata/user, /homepage-guest/manifest.json,
 *                       /homepage-guest/api/ingraphs/gauge, /homepage-guest/api/ingraphs/counter,
 *                       /li/track, /litms/api/events/tms-load
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4000;
const JWT_SECRET = 'opentonetwork-rea-rebuilt-' + crypto.randomBytes(16).toString('hex');

// ============================================================
// IN-MEMORY DATABASE (JSON file-backed, no native modules)
// ============================================================
const DB_FILE = path.join(__dirname, 'db.json');

function loadDB() {
  if (!fs.existsSync(DB_FILE)) return { users: [], posts: [], jobs: [], connections: [], messages: [], notifications: [] };
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch { return { users: [], posts: [], jobs: [], connections: [], messages: [], notifications: [] }; }
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Seed initial data from REA capture insights
function seedDB(db) {
  if (db.users.length > 0) return db;

  // Pre-seed 5 realistic users
  const users = [
    { id: 'u1', name: 'Gowtham Sanjay', email: 'gowtham@example.com', password: bcrypt.hashSync('pass123', 10), headline: 'Software Engineer & Agent Systems Specialist', location: 'Bengaluru, India', connections: 487, countryCode: 'in', joinedAt: '2024-01-15', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', verified: true, premium: true, openToWork: true },
    { id: 'u2', name: 'Priya Sharma', email: 'priya@example.com', password: bcrypt.hashSync('pass123', 10), headline: 'Senior Product Manager @ Infosys', location: 'Mumbai, India', connections: 1243, countryCode: 'in', joinedAt: '2023-06-20', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', verified: true, premium: false, openToWork: false },
    { id: 'u3', name: 'Alex Chen', email: 'alex@example.com', password: bcrypt.hashSync('pass123', 10), headline: 'Staff AI Engineer @ Google', location: 'San Francisco, CA', connections: 892, countryCode: 'us', joinedAt: '2022-09-10', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', verified: true, premium: true, openToWork: false },
    { id: 'u4', name: 'Elena Rostova', email: 'elena@example.com', password: bcrypt.hashSync('pass123', 10), headline: 'VP of Product Innovation', location: 'Berlin, Germany', connections: 2341, countryCode: 'de', joinedAt: '2021-03-05', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', verified: false, premium: true, openToWork: false },
    { id: 'u5', name: 'Rahul Verma', email: 'rahul@example.com', password: bcrypt.hashSync('pass123', 10), headline: 'Full Stack Developer | React | Node.js', location: 'Hyderabad, India', connections: 329, countryCode: 'in', joinedAt: '2024-08-01', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', verified: false, premium: false, openToWork: true }
  ];

  const posts = [
    { id: 'p1', authorId: 'u2', content: '🚀 Excited to share that our team just shipped a major feature using AI-assisted code reviews! The productivity gains are real — 40% fewer bugs in QA. What tools is your team using for AI-assisted development?', likes: 142, comments: 23, shares: 8, createdAt: new Date(Date.now() - 2*3600000).toISOString(), reactions: { like: ['u1', 'u5'], celebrate: ['u3', 'u4'], support: [], love: ['u2'], insightful: ['u3'], funny: [] } },
    { id: 'p2', authorId: 'u3', content: 'Hot take: The best engineers I\'ve hired in 2026 are those who know *when NOT to use AI*. Knowing the boundaries of these tools is the real skill.\n\nWhat do you think? 👇', likes: 891, comments: 167, shares: 44, createdAt: new Date(Date.now() - 5*3600000).toISOString(), reactions: { like: ['u1', 'u2'], celebrate: [], support: ['u4'], love: [], insightful: ['u1', 'u2', 'u5'], funny: [] } },
    { id: 'p3', authorId: 'u4', content: 'Just wrapped up our Q3 planning. Key insight: teams that do weekly async updates are 2x more aligned than those doing daily syncs. Less noise, more signal. 📊', likes: 334, comments: 58, shares: 19, createdAt: new Date(Date.now() - 1*86400000).toISOString(), reactions: { like: ['u2', 'u3'], celebrate: ['u1'], support: [], love: ['u3'], insightful: ['u5'], funny: [] } },
    { id: 'p4', authorId: 'u5', content: 'Open to work! Looking for Full Stack roles (React + Node.js). 3 years experience, open to remote. If you\'re hiring or know someone who is, please tag them below. Thanks 🙏 #OpenToWork #hiring', likes: 78, comments: 41, shares: 12, createdAt: new Date(Date.now() - 2*86400000).toISOString(), reactions: { like: ['u1'], celebrate: [], support: ['u1', 'u2', 'u3', 'u4'], love: [], insightful: [], funny: [] } },
    { id: 'p5', authorId: 'u1', content: 'Just spent the weekend analyzing distributed frontend architecture and performance metrics. The way modern platforms handle client-side telemetry and distributed CDN routing is fascinating. Will write a full breakdown soon. #systemdesign #webdev', likes: 203, comments: 37, shares: 15, createdAt: new Date(Date.now() - 3*86400000).toISOString(), reactions: { like: ['u2', 'u3', 'u4', 'u5'], celebrate: ['u2'], support: [], love: [], insightful: ['u3', 'u4'], funny: [] } }
  ];

  // Real jobs based on LinkedIn job board structure
  const jobs = [
    { id: 'j1', title: 'Senior Software Engineer', company: 'Google', location: 'Bengaluru, India', type: 'Full-time', level: 'Senior', remote: 'Hybrid', postedAt: new Date(Date.now() - 1*86400000).toISOString(), applicants: 284, description: 'Join Google\'s Core Engineering team. Work on large-scale distributed systems.', skills: ['Go', 'Python', 'Kubernetes', 'GCP'] },
    { id: 'j2', title: 'Product Manager - AI', company: 'Microsoft', location: 'Hyderabad, India', type: 'Full-time', level: 'Mid', remote: 'Hybrid', postedAt: new Date(Date.now() - 2*86400000).toISOString(), applicants: 142, description: 'Drive product strategy for AI-powered features across Microsoft 365.', skills: ['Product Strategy', 'AI/ML', 'Data Analysis', 'Agile'] },
    { id: 'j3', title: 'Full Stack Developer', company: 'Razorpay', location: 'Remote', type: 'Full-time', level: 'Mid', remote: 'Remote', postedAt: new Date(Date.now() - 3*86400000).toISOString(), applicants: 98, description: 'Build the next generation of payment infrastructure. React, Node, PostgreSQL.', skills: ['React', 'Node.js', 'PostgreSQL', 'Redis'] },
    { id: 'j4', title: 'DevOps Engineer', company: 'Infosys', location: 'Pune, India', type: 'Full-time', level: 'Junior', remote: 'On-site', postedAt: new Date(Date.now() - 4*86400000).toISOString(), applicants: 67, description: 'Manage CI/CD pipelines, Kubernetes clusters, and cloud infrastructure.', skills: ['Kubernetes', 'Jenkins', 'AWS', 'Terraform'] },
    { id: 'j5', title: 'Data Scientist', company: 'Flipkart', location: 'Bengaluru, India', type: 'Full-time', level: 'Senior', remote: 'Hybrid', postedAt: new Date(Date.now() - 5*86400000).toISOString(), applicants: 213, description: 'Build ML models for product recommendations and search ranking.', skills: ['Python', 'PyTorch', 'Spark', 'SQL'] },
    { id: 'j6', title: 'UX Designer', company: 'Swiggy', location: 'Bengaluru, India', type: 'Full-time', level: 'Mid', remote: 'Hybrid', postedAt: new Date(Date.now() - 6*86400000).toISOString(), applicants: 55, description: 'Design intuitive food delivery experiences for 50M+ users.', skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'] }
  ];

  db.users = users;
  db.posts = posts;
  db.jobs = jobs;
  db.connections = [
    { from: 'u1', to: 'u2', status: 'connected', at: '2024-02-01' },
    { from: 'u1', to: 'u3', status: 'pending', at: '2026-10-20' }
  ];
  db.messages = [
    { id: 'm1', from: 'u2', to: 'u1', content: 'Hi Gowtham! I saw your post about distributed architectures. Really impressive work! Would love to chat about it.', read: false, createdAt: new Date(Date.now() - 2*3600000).toISOString() },
    { id: 'm2', from: 'u1', to: 'u2', content: 'Thanks Priya! Yes, analyzing performance bottlenecks across client-side pipelines is a passion of mine. Happy to walk you through it.', read: true, createdAt: new Date(Date.now() - 1.5*3600000).toISOString() },
    { id: 'm3', from: 'u2', to: 'u1', content: 'That would be amazing! Are you free for a quick call this week?', read: false, createdAt: new Date(Date.now() - 1*3600000).toISOString() },
    { id: 'm4', from: 'u3', to: 'u1', content: 'Hey Gowtham, we have an opening on the AI team at Google. Your agent systems work looks like a great fit. Interested?', read: false, createdAt: new Date(Date.now() - 5*3600000).toISOString() },
    { id: 'm5', from: 'u4', to: 'u1', content: 'Your latest architecture write-up is fascinating. We are exploring similar approaches for enterprise scale. Let\'s connect!', read: false, createdAt: new Date(Date.now() - 8*3600000).toISOString() }
  ];
  db.comments = [
    { id: 'cm1', postId: 'p1', authorId: 'u1', content: 'This is great! What AI tools are you using for code reviews?', likes: 5, likedBy: ['u2','u3'], createdAt: new Date(Date.now() - 1.5*3600000).toISOString() },
    { id: 'cm2', postId: 'p1', authorId: 'u3', content: 'We\'ve been using similar tools at Google. The key is combining AI review with human judgment.', likes: 12, likedBy: ['u1','u2','u4'], createdAt: new Date(Date.now() - 1*3600000).toISOString() },
    { id: 'cm3', postId: 'p2', authorId: 'u4', content: 'Totally agree Alex. Knowing when NOT to use a tool is an underrated skill in 2026.', likes: 45, likedBy: ['u1','u2','u5'], createdAt: new Date(Date.now() - 4*3600000).toISOString() },
    { id: 'cm4', postId: 'p2', authorId: 'u1', content: 'Strong agree. Blindly applying AI to everything creates more problems than it solves.', likes: 22, likedBy: ['u3','u4'], createdAt: new Date(Date.now() - 3*3600000).toISOString() },
    { id: 'cm5', postId: 'p5', authorId: 'u2', content: 'Can\'t wait to read the full breakdown! Looking forward to your article.', likes: 8, likedBy: ['u1'], createdAt: new Date(Date.now() - 2.5*86400000).toISOString() },
    { id: 'cm6', postId: 'p5', authorId: 'u5', content: 'This is the kind of deep-dive content LinkedIn needs more of. Following for updates!', likes: 3, likedBy: [], createdAt: new Date(Date.now() - 2*86400000).toISOString() }
  ];
  db.experience = [
    { id: 'exp1', userId: 'u1', title: 'Software Engineer & Agent Systems Specialist', company: 'Freelance', location: 'Bengaluru, India', startDate: '2024-01', endDate: '', current: true, description: 'Building AI-powered agent systems, distributed cloud platforms, and developing high-performance full-stack applications.', employmentType: 'Self-employed' },
    { id: 'exp2', userId: 'u1', title: 'Full Stack Developer Intern', company: 'TechCorp India', location: 'Bengaluru, India', startDate: '2023-06', endDate: '2023-12', current: false, description: 'Built React + Node.js applications. Worked on microservices architecture and CI/CD pipelines.', employmentType: 'Internship' },
    { id: 'exp3', userId: 'u3', title: 'Staff AI Engineer', company: 'Google', location: 'San Francisco, CA', startDate: '2022-09', endDate: '', current: true, description: 'Leading AI infrastructure initiatives. Building large-scale ML systems for Google Cloud AI products.', employmentType: 'Full-time' },
    { id: 'exp4', userId: 'u2', title: 'Senior Product Manager', company: 'Infosys', location: 'Mumbai, India', startDate: '2023-06', endDate: '', current: true, description: 'Driving product strategy for enterprise AI solutions. Managing a team of 12 engineers.', employmentType: 'Full-time' }
  ];
  db.education = [
    { id: 'edu1', userId: 'u1', school: 'Bengaluru University of Technology', degree: 'Bachelor of Technology', fieldOfStudy: 'Computer Science & Engineering', startYear: '2020', endYear: '2024', grade: '8.7 CGPA', activities: 'Coding Club President, Hackathon Winner 2023' },
    { id: 'edu2', userId: 'u3', school: 'Stanford University', degree: 'Master of Science', fieldOfStudy: 'Artificial Intelligence', startYear: '2020', endYear: '2022', grade: '3.95 GPA', activities: 'AI Lab Research Assistant' },
    { id: 'edu3', userId: 'u2', school: 'Indian Institute of Management, Ahmedabad', degree: 'MBA', fieldOfStudy: 'Product Management & Strategy', startYear: '2021', endYear: '2023', grade: '', activities: 'Case Competition Winner' }
  ];
  db.skills = [
    { id: 'sk1', userId: 'u1', name: 'JavaScript', endorsements: 12, endorsedBy: ['u2','u3','u5'] },
    { id: 'sk2', userId: 'u1', name: 'React.js', endorsements: 8, endorsedBy: ['u2','u5'] },
    { id: 'sk3', userId: 'u1', name: 'Node.js', endorsements: 10, endorsedBy: ['u3','u5'] },
    { id: 'sk4', userId: 'u1', name: 'Python', endorsements: 6, endorsedBy: ['u3'] },
    { id: 'sk5', userId: 'u1', name: 'Reverse Engineering', endorsements: 3, endorsedBy: [] },
    { id: 'sk6', userId: 'u1', name: 'AI/ML', endorsements: 4, endorsedBy: ['u3'] },
    { id: 'sk7', userId: 'u1', name: 'TypeScript', endorsements: 7, endorsedBy: ['u2','u5'] },
    { id: 'sk8', userId: 'u3', name: 'Machine Learning', endorsements: 45, endorsedBy: ['u1','u2','u4'] },
    { id: 'sk9', userId: 'u3', name: 'Python', endorsements: 38, endorsedBy: ['u1','u2'] },
    { id: 'sk10', userId: 'u3', name: 'TensorFlow', endorsements: 30, endorsedBy: ['u1'] }
  ];
  db.certifications = [
    { id: 'cert1', userId: 'u1', name: 'Google Cloud Professional Cloud Architect', organization: 'Google Cloud', issueDate: '2024-06', expirationDate: '2026-06', credentialId: 'GCP-PCA-2024-0847', credentialUrl: '' },
    { id: 'cert2', userId: 'u1', name: 'AWS Solutions Architect Associate', organization: 'Amazon Web Services', issueDate: '2024-03', expirationDate: '2027-03', credentialId: 'AWS-SAA-2024-1234', credentialUrl: '' }
  ];
  db.languages = [
    { id: 'lang1', userId: 'u1', name: 'English', proficiency: 'Professional working' },
    { id: 'lang2', userId: 'u1', name: 'Tamil', proficiency: 'Native' },
    { id: 'lang3', userId: 'u1', name: 'Hindi', proficiency: 'Professional working' }
  ];
  db.notifications = [
    { id: 'n1', userId: 'u1', type: 'connection_request', from: 'u4', message: 'Elena Rostova wants to connect', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'n2', userId: 'u1', type: 'post_like', from: 'u3', message: 'Alex Chen liked your post', read: false, createdAt: new Date(Date.now() - 7200000).toISOString() }
  ];
  saveDB(db);
  return db;
}

let db = seedDB(loadDB());

// ============================================================
// HELPERS
// ============================================================
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };

function json(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
  });
}

function authMiddleware(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

function publicUser(u) {
  const { password, ...pub } = u;
  return pub;
}

function getUser(id) { return db.users.find(u => u.id === id); }
function getPost(id) { return db.posts.find(p => p.id === id); }

function enrichPost(post) {
  if (!post) return null;
  const author = getUser(post.authorId);
  const reactions = post.reactions || { like: post.likedBy || [], celebrate: [], support: [], love: [], insightful: [], funny: [] };
  const totalReactions = Object.values(reactions).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0) || post.likes || 0;
  
  let repostOf = null;
  if (post.repostId) {
    const orig = getPost(post.repostId);
    if (orig) repostOf = enrichPost(orig);
  }

  return {
    ...post,
    author: author ? publicUser(author) : null,
    reactions,
    totalReactions,
    repostOf
  };
}

// ============================================================
// ROUTER
// ============================================================
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = url.pathname;
  const method = req.method;

  // ── REA-CAPTURED REAL API CONTRACTS ─────────────────────────────────────
  // These endpoints mirror the EXACT URLs and response shapes captured by REA
  // from the live LinkedIn site.

  // 1. Manifest (captured: GET /homepage-guest/manifest.json → data_1.json)
  if (p === '/homepage-guest/manifest.json' && method === 'GET') {
    return json(res, {
      name: 'OpenToNetwork',
      short_name: 'OTN',
      description: 'Professional networking platform - rebuilt from LinkedIn via REA',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#0a66c2',
      icons: [{ src: '/images/asset_6.svg', type: 'image/svg+xml' }],
      related_applications: [
        { platform: 'web', url: 'http://localhost:4000/' }
      ]
    });
  }

  // 2. User Metadata (captured: GET /litms/api/metadata/user → data_2.json)
  // Real LinkedIn response shape: { client: {...}, compliance: {...} }
  if (p === '/litms/api/metadata/user' && method === 'GET') {
    const user = authMiddleware(req);
    const loggedInUser = user ? getUser(user.id) : null;
    return json(res, {
      client: {
        deviceType: 'Personal computer',
        browserLanguage: 'en-US',
        assignedControlGroup: 'baseline',
        assignedLtsNgwTreatment: 'control',
        isUserLoggedIn: !!loggedInUser,
        countryCode: loggedInUser?.countryCode || 'in',
        isInternalRequest: false,
        language: 'en-US',
        memberId: loggedInUser?.id || null,
        memberName: loggedInUser?.name || null
      },
      compliance: {
        isCCPAOptIn: true,
        isLinkedInEmployee: false,
        isResearchInvitationsOptIn: false,
        isGDPRCountryResident: false,
        isFunctionalOptIn: true,
        isGeoOptIn: true,
        isGDPROptIn: true,
        isAdvertisingOptIn: true,
        isAnalyticsAndResearchOptIn: true
      }
    });
  }

  // 3. Ingraphs gauge (captured: POST /homepage-guest/api/ingraphs/gauge → data_3.json)
  if (p === '/homepage-guest/api/ingraphs/gauge' && method === 'POST') {
    return json(res, { pageKey: 'd_homepage-guest-home_jsbeacon', metricsType: 'pageLoadTime', metricsValue: Math.floor(800 + Math.random() * 1000) });
  }

  // 4. Ingraphs counter (captured: POST /homepage-guest/api/ingraphs/counter → real shape)
  if (p === '/homepage-guest/api/ingraphs/counter' && method === 'POST') {
    return json(res, { status: 200, received: true });
  }

  // 5. Telemetry track (captured: POST /li/track)
  if (p === '/li/track' && method === 'POST') {
    return json(res, { status: 200, received: true });
  }

  // 6. TMS load events (captured: POST /litms/api/events/tms-load)
  if (p === '/litms/api/events/tms-load' && method === 'POST') {
    return json(res, { profileName: 'homepage-guest-frontend', status: 'ok' });
  }

  // ── AUTHENTICATION ────────────────────────────────────────────────────────

  if (p === '/api/auth/register' && method === 'POST') {
    const body = await readBody(req);
    const { name, email, password, headline = '', location = '' } = body;
    if (!name || !email || !password) return json(res, { error: 'Name, email and password required' }, 400);
    if (db.users.find(u => u.email === email)) return json(res, { error: 'Email already registered' }, 409);
    const id = 'u' + Date.now();
    const hashed = bcrypt.hashSync(password, 10);
    const newUser = { id, name, email, password: hashed, headline, location, connections: 0, countryCode: 'in', joinedAt: new Date().toISOString().split('T')[0] };
    db.users.push(newUser);
    saveDB(db);
    const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });
    return json(res, { token, user: publicUser(newUser) }, 201);
  }

  if (p === '/api/auth/login' && method === 'POST') {
    const body = await readBody(req);
    const { email, password } = body;
    const user = db.users.find(u => u.email === email);
    if (!user || !bcrypt.compareSync(password, user.password)) return json(res, { error: 'Invalid credentials' }, 401);
    const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: '7d' });
    return json(res, { token, user: publicUser(user) });
  }

  if (p === '/api/auth/me' && method === 'GET') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    const user = getUser(claims.id);
    if (!user) return json(res, { error: 'User not found' }, 404);
    return json(res, publicUser(user));
  }

  // ── FEED / POSTS ──────────────────────────────────────────────────────────

  if (p === '/api/feed' && method === 'GET') {
    const sort = url.searchParams.get('sort') || 'recent';
    let posts = [...db.posts];
    if (sort === 'top') {
      posts.sort((a, b) => ((b.likes || 0) + (b.comments || 0) * 2) - ((a.likes || 0) + (a.comments || 0) * 2));
    } else {
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return json(res, posts.map(enrichPost));
  }

  if (p === '/api/posts' && method === 'POST') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    const body = await readBody(req);
    const { content, imageUrl, poll, postType, hashtags } = body;
    if (!content?.trim() && !poll) return json(res, { error: 'Content required' }, 400);
    const post = {
      id: 'p' + Date.now(), authorId: claims.id, content: content || '',
      imageUrl: imageUrl || null, postType: postType || 'post',
      hashtags: hashtags || [],
      poll: poll ? { question: poll.question, options: poll.options.map(o => ({ text: o, votes: 0 })), totalVotes: 0, voters: {}, duration: poll.duration || '1 week' } : null,
      likes: 0, comments: 0, shares: 0, createdAt: new Date().toISOString(), likedBy: [],
      reactions: { like: [], celebrate: [], support: [], love: [], insightful: [], funny: [] }
    };
    db.posts.unshift(post);
    saveDB(db);
    return json(res, enrichPost(post), 201);
  }

  const postLikeMatch = p.match(/^\/api\/posts\/(.+)\/like$/);
  if (postLikeMatch && method === 'POST') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    const post = getPost(postLikeMatch[1]);
    if (!post) return json(res, { error: 'Post not found' }, 404);
    if (!post.reactions) post.reactions = { like: post.likedBy || [], celebrate: [], support: [], love: [], insightful: [], funny: [] };
    
    // Toggle 'like' reaction
    const idx = post.reactions.like.indexOf(claims.id);
    if (idx === -1) {
      post.reactions.like.push(claims.id);
    } else {
      post.reactions.like.splice(idx, 1);
    }
    const total = Object.values(post.reactions).reduce((acc, arr) => acc + arr.length, 0);
    post.likes = total;
    post.likedBy = post.reactions.like;
    saveDB(db);
    return json(res, { likes: post.likes, liked: idx === -1, reactions: post.reactions });
  }

  
  const postReactorsMatch = p.match(/^\/api\/posts\/(.+)\/reactors$/);
  if (postReactorsMatch && method === 'GET') {
    const post = getPost(postReactorsMatch[1]);
    if (!post) return json(res, { error: 'Post not found' }, 404);
    const r = post.reactions || {};
    const reactors = [];
    for (const [type, userIds] of Object.entries(r)) {
      if (Array.isArray(userIds)) {
        for (const uid of userIds) {
          const u = getUser(uid);
          if (u) {
            reactors.push({
              id: u.id,
              name: u.name,
              headline: u.headline || '',
              avatarUrl: u.avatarUrl || null,
              verified: !!u.verified,
              premium: !!u.premium,
              openToWork: !!u.openToWork,
              reaction: type
            });
          }
        }
      }
    }
    return json(res, { reactors, total: reactors.length });
  }

  const postReactMatch = p.match(/^\/api\/posts\/(.+)\/react$/);
  if (postReactMatch && method === 'POST') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    const post = getPost(postReactMatch[1]);
    if (!post) return json(res, { error: 'Post not found' }, 404);
    const body = await readBody(req);
    const rType = body.reaction || 'like';
    if (!post.reactions) post.reactions = { like: post.likedBy || [], celebrate: [], support: [], love: [], insightful: [], funny: [] };

    // Remove from previous reaction if any
    let prev = null;
    for (const [r, list] of Object.entries(post.reactions)) {
      const idx = list.indexOf(claims.id);
      if (idx !== -1) {
        prev = r;
        list.splice(idx, 1);
      }
    }

    let activeReaction = null;
    if (prev !== rType) {
      if (!post.reactions[rType]) post.reactions[rType] = [];
      post.reactions[rType].push(claims.id);
      activeReaction = rType;
      if (post.authorId !== claims.id) {
        const reactor = getUser(claims.id);
        db.notifications.push({
          id: 'n' + Date.now(),
          userId: post.authorId,
          type: 'reaction',
          from: claims.id,
          message: `${reactor?.name || 'Someone'} reacted to your post`,
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    const total = Object.values(post.reactions).reduce((acc, arr) => acc + arr.length, 0);
    post.likes = total;
    post.likedBy = post.reactions.like || [];
    saveDB(db);
    return json(res, { reactions: post.reactions, totalReactions: total, userReaction: activeReaction });
  }

  const postRepostMatch = p.match(/^\/api\/posts\/(.+)\/repost$/);
  if (postRepostMatch && method === 'POST') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    const orig = getPost(postRepostMatch[1]);
    if (!orig) return json(res, { error: 'Post not found' }, 404);
    const body = await readBody(req);
    const repost = {
      id: 'p' + Date.now(),
      authorId: claims.id,
      content: body.content || '',
      repostId: orig.id,
      postType: 'repost',
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: new Date().toISOString(),
      likedBy: [],
      reactions: { like: [], celebrate: [], support: [], love: [], insightful: [], funny: [] }
    };
    orig.shares = (orig.shares || 0) + 1;
    db.posts.unshift(repost);
    saveDB(db);
    return json(res, enrichPost(repost), 201);
  }

  // ── JOBS ──────────────────────────────────────────────────────────────────

  if (p === '/api/jobs' && method === 'GET') {
    const q = url.searchParams.get('q') || '';
    const loc = url.searchParams.get('location') || '';
    const filtered = db.jobs.filter(j => {
      const matchQ = !q || j.title.toLowerCase().includes(q.toLowerCase()) || j.company.toLowerCase().includes(q.toLowerCase()) || j.skills.some(s => s.toLowerCase().includes(q.toLowerCase()));
      const matchL = !loc || j.location.toLowerCase().includes(loc.toLowerCase());
      return matchQ && matchL;
    });
    return json(res, filtered);
  }

  if (p === '/api/jobs' && method === 'POST') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    const body = await readBody(req);
    const job = { id: 'j' + Date.now(), ...body, postedBy: claims.id, applicants: 0, postedAt: new Date().toISOString() };
    db.jobs.unshift(job);
    saveDB(db);
    return json(res, job, 201);
  }

  // ── PEOPLE / NETWORK ──────────────────────────────────────────────────────

  if (p === '/api/people' && method === 'GET') {
    const claims = authMiddleware(req);
    const meId = claims?.id;
    const people = db.users.filter(u => u.id !== meId).map(publicUser);
    return json(res, people);
  }

  if (p === '/api/connections' && method === 'POST') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    const body = await readBody(req);
    const existing = db.connections.find(c => c.from === claims.id && c.to === body.toId);
    if (existing) return json(res, { error: 'Already connected or pending' }, 409);
    const conn = { from: claims.id, to: body.toId, status: 'pending', at: new Date().toISOString() };
    db.connections.push(conn);
    db.notifications.push({ id: 'n' + Date.now(), userId: body.toId, type: 'connection_request', from: claims.id, message: `${getUser(claims.id)?.name} wants to connect`, read: false, createdAt: new Date().toISOString() });
    saveDB(db);
    return json(res, conn, 201);
  }

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────

  if (p === '/api/notifications' && method === 'GET') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, []);
    const notifs = db.notifications.filter(n => n.userId === claims.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const enriched = notifs.map(n => ({ ...n, fromUser: n.from ? publicUser(getUser(n.from)) : null }));
    return json(res, enriched);
  }

  if (p === '/api/notifications/read-all' && method === 'POST') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    db.notifications.forEach(n => { if (n.userId === claims.id) n.read = true; });
    saveDB(db);
    return json(res, { ok: true });
  }

  // ── PROFILE ───────────────────────────────────────────────────────────────

  if (p === '/api/profile' && method === 'PUT') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    const body = await readBody(req);
    const user = db.users.find(u => u.id === claims.id);
    if (!user) return json(res, { error: 'Not found' }, 404);
    const allowed = ['name', 'headline', 'location', 'about', 'avatarUrl', 'industry', 'website', 'openToWork', 'pronouns'];
    allowed.forEach(k => { if (body[k] !== undefined) user[k] = body[k]; });
    saveDB(db);
    return json(res, publicUser(user));
  }

  // ── COMMENTS ────────────────────────────────────────────────────────────

  const postCommentsMatch = p.match(/^\/api\/posts\/(.+)\/comments$/);
  if (postCommentsMatch && method === 'GET') {
    const postId = postCommentsMatch[1];
    const comments = (db.comments || [])
      .filter(c => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(c => ({ ...c, author: c.authorId ? publicUser(getUser(c.authorId)) : null }));
    return json(res, comments);
  }

  if (postCommentsMatch && method === 'POST') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    const postId = postCommentsMatch[1];
    const post = getPost(postId);
    if (!post) return json(res, { error: 'Post not found' }, 404);
    const body = await readBody(req);
    if (!body.content?.trim()) return json(res, { error: 'Content required' }, 400);
    if (!db.comments) db.comments = [];
    const comment = { id: 'c' + Date.now(), postId, authorId: claims.id, content: body.content.trim(), likes: 0, likedBy: [], createdAt: new Date().toISOString() };
    db.comments.push(comment);
    post.comments = (post.comments || 0) + 1;
    // Notify post author
    if (post.authorId !== claims.id) {
      db.notifications.push({ id: 'n' + Date.now(), userId: post.authorId, type: 'comment', from: claims.id, message: `${getUser(claims.id)?.name} commented on your post`, read: false, createdAt: new Date().toISOString() });
    }
    saveDB(db);
    return json(res, { ...comment, author: publicUser(getUser(claims.id)) }, 201);
  }

  const commentLikeMatch = p.match(/^\/api\/comments\/(.+)\/like$/);
  if (commentLikeMatch && method === 'POST') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    if (!db.comments) db.comments = [];
    const comment = db.comments.find(c => c.id === commentLikeMatch[1]);
    if (!comment) return json(res, { error: 'Comment not found' }, 404);
    if (!comment.likedBy) comment.likedBy = [];
    const idx = comment.likedBy.indexOf(claims.id);
    if (idx === -1) { comment.likedBy.push(claims.id); comment.likes++; }
    else { comment.likedBy.splice(idx, 1); comment.likes = Math.max(0, comment.likes - 1); }
    saveDB(db);
    return json(res, { likes: comment.likes, liked: idx === -1 });
  }

  // ── MESSAGING ─────────────────────────────────────────────────────────────

  // Get conversations list
  if (p === '/api/conversations' && method === 'GET') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    if (!db.messages) db.messages = [];
    // Group messages into conversations
    const convMap = {};
    db.messages.forEach(m => {
      if (m.from !== claims.id && m.to !== claims.id) return;
      const otherId = m.from === claims.id ? m.to : m.from;
      if (!convMap[otherId]) convMap[otherId] = { withUser: publicUser(getUser(otherId)), lastMessage: m, unread: 0, messages: [] };
      convMap[otherId].messages.push(m);
      if (new Date(m.createdAt) > new Date(convMap[otherId].lastMessage.createdAt)) convMap[otherId].lastMessage = m;
      if (!m.read && m.to === claims.id) convMap[otherId].unread++;
    });
    const conversations = Object.values(convMap).sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
    return json(res, conversations);
  }

  // Get messages with a specific user
  const messagesWithMatch = p.match(/^\/api\/messages\/(.+)$/);
  if (messagesWithMatch && method === 'GET') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    const otherId = messagesWithMatch[1];
    if (!db.messages) db.messages = [];
    const msgs = db.messages
      .filter(m => (m.from === claims.id && m.to === otherId) || (m.from === otherId && m.to === claims.id))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    // Mark as read
    msgs.forEach(m => { if (m.to === claims.id) m.read = true; });
    saveDB(db);
    return json(res, msgs.map(m => ({ ...m, fromUser: publicUser(getUser(m.from)), toUser: publicUser(getUser(m.to)) })));
  }

  // Send a message
  if (messagesWithMatch && method === 'POST') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    const toId = messagesWithMatch[1];
    const toUser = getUser(toId);
    if (!toUser) return json(res, { error: 'User not found' }, 404);
    const body = await readBody(req);
    if (!body.content?.trim()) return json(res, { error: 'Message content required' }, 400);
    if (!db.messages) db.messages = [];
    const msg = { id: 'm' + Date.now(), from: claims.id, to: toId, content: body.content.trim(), read: false, createdAt: new Date().toISOString() };
    db.messages.push(msg);
    // Notify recipient
    db.notifications.push({ id: 'n' + Date.now(), userId: toId, type: 'message', from: claims.id, message: `${getUser(claims.id)?.name} sent you a message`, read: false, createdAt: new Date().toISOString() });
    saveDB(db);
    return json(res, { ...msg, fromUser: publicUser(getUser(claims.id)), toUser: publicUser(toUser) }, 201);
  }

  // ── GLOBAL SEARCH ─────────────────────────────────────────────────────────

  if (p === '/api/search' && method === 'GET') {
    const q = (url.searchParams.get('q') || '').toLowerCase().trim();
    const type = url.searchParams.get('type') || 'all'; // all, people, posts, jobs
    if (!q) return json(res, { people: [], posts: [], jobs: [] });

    const results = {};
    if (type === 'all' || type === 'people') {
      results.people = db.users.filter(u =>
        u.name.toLowerCase().includes(q) || (u.headline || '').toLowerCase().includes(q) || (u.location || '').toLowerCase().includes(q)
      ).map(publicUser).slice(0, 10);
    }
    if (type === 'all' || type === 'posts') {
      results.posts = db.posts.filter(p =>
        (p.content || '').toLowerCase().includes(q)
      ).map(p => ({ ...p, author: p.authorId ? publicUser(getUser(p.authorId)) : null })).slice(0, 10);
    }
    if (type === 'all' || type === 'jobs') {
      results.jobs = db.jobs.filter(j =>
        j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || (j.skills || []).some(s => s.toLowerCase().includes(q))
      ).slice(0, 10);
    }
    return json(res, results);
  }

  // ── PROFILE SECTIONS (Experience, Education, Skills, Certifications) ─────

  // Get full profile with sections
  const profileViewMatch = p.match(/^\/api\/profile\/(.+)$/);
  if (profileViewMatch && method === 'GET') {
    const userId = profileViewMatch[1];
    const user = getUser(userId);
    if (!user) return json(res, { error: 'User not found' }, 404);
    return json(res, {
      ...publicUser(user),
      experience: (db.experience || []).filter(e => e.userId === userId),
      education: (db.education || []).filter(e => e.userId === userId),
      skills: (db.skills || []).filter(s => s.userId === userId),
      certifications: (db.certifications || []).filter(c => c.userId === userId),
      languages: (db.languages || []).filter(l => l.userId === userId)
    });
  }

  // Add Experience
  if (p === '/api/profile/experience' && method === 'POST') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    const body = await readBody(req);
    if (!body.title || !body.company) return json(res, { error: 'Title and company required' }, 400);
    if (!db.experience) db.experience = [];
    const exp = { id: 'exp' + Date.now(), userId: claims.id, title: body.title, company: body.company, location: body.location || '', startDate: body.startDate || '', endDate: body.endDate || '', current: body.current || false, description: body.description || '', employmentType: body.employmentType || 'Full-time', createdAt: new Date().toISOString() };
    db.experience.push(exp);
    saveDB(db);
    return json(res, exp, 201);
  }

  // Delete Experience
  const expDeleteMatch = p.match(/^\/api\/profile\/experience\/(.+)$/);
  if (expDeleteMatch && method === 'DELETE') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    if (!db.experience) db.experience = [];
    db.experience = db.experience.filter(e => !(e.id === expDeleteMatch[1] && e.userId === claims.id));
    saveDB(db);
    return json(res, { ok: true });
  }

  // Add Education
  if (p === '/api/profile/education' && method === 'POST') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    const body = await readBody(req);
    if (!body.school) return json(res, { error: 'School required' }, 400);
    if (!db.education) db.education = [];
    const edu = { id: 'edu' + Date.now(), userId: claims.id, school: body.school, degree: body.degree || '', fieldOfStudy: body.fieldOfStudy || '', startYear: body.startYear || '', endYear: body.endYear || '', grade: body.grade || '', activities: body.activities || '', createdAt: new Date().toISOString() };
    db.education.push(edu);
    saveDB(db);
    return json(res, edu, 201);
  }

  // Delete Education
  const eduDeleteMatch = p.match(/^\/api\/profile\/education\/(.+)$/);
  if (eduDeleteMatch && method === 'DELETE') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    if (!db.education) db.education = [];
    db.education = db.education.filter(e => !(e.id === eduDeleteMatch[1] && e.userId === claims.id));
    saveDB(db);
    return json(res, { ok: true });
  }

  // Add/Remove Skills
  if (p === '/api/profile/skills' && method === 'POST') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    const body = await readBody(req);
    if (!body.name) return json(res, { error: 'Skill name required' }, 400);
    if (!db.skills) db.skills = [];
    if (db.skills.find(s => s.userId === claims.id && s.name.toLowerCase() === body.name.toLowerCase())) return json(res, { error: 'Skill already exists' }, 409);
    const skill = { id: 'sk' + Date.now(), userId: claims.id, name: body.name, endorsements: 0, endorsedBy: [], createdAt: new Date().toISOString() };
    db.skills.push(skill);
    saveDB(db);
    return json(res, skill, 201);
  }

  const skillDeleteMatch = p.match(/^\/api\/profile\/skills\/(.+)$/);
  if (skillDeleteMatch && method === 'DELETE') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    if (!db.skills) db.skills = [];
    db.skills = db.skills.filter(s => !(s.id === skillDeleteMatch[1] && s.userId === claims.id));
    saveDB(db);
    return json(res, { ok: true });
  }

  // Endorse a skill
  const endorseMatch = p.match(/^\/api\/profile\/skills\/(.+)\/endorse$/);
  if (endorseMatch && method === 'POST') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    if (!db.skills) db.skills = [];
    const skill = db.skills.find(s => s.id === endorseMatch[1]);
    if (!skill) return json(res, { error: 'Skill not found' }, 404);
    if (skill.userId === claims.id) return json(res, { error: 'Cannot endorse own skill' }, 400);
    if (!skill.endorsedBy) skill.endorsedBy = [];
    if (skill.endorsedBy.includes(claims.id)) return json(res, { error: 'Already endorsed' }, 409);
    skill.endorsedBy.push(claims.id);
    skill.endorsements = skill.endorsedBy.length;
    saveDB(db);
    return json(res, skill);
  }

  // Add Certification
  if (p === '/api/profile/certifications' && method === 'POST') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    const body = await readBody(req);
    if (!body.name || !body.organization) return json(res, { error: 'Name and organization required' }, 400);
    if (!db.certifications) db.certifications = [];
    const cert = { id: 'cert' + Date.now(), userId: claims.id, name: body.name, organization: body.organization, issueDate: body.issueDate || '', expirationDate: body.expirationDate || '', credentialId: body.credentialId || '', credentialUrl: body.credentialUrl || '', createdAt: new Date().toISOString() };
    db.certifications.push(cert);
    saveDB(db);
    return json(res, cert, 201);
  }

  // ── POLLS (Rich Post Content) ─────────────────────────────────────────────

  // Vote on a poll
  const pollVoteMatch = p.match(/^\/api\/posts\/(.+)\/vote$/);
  if (pollVoteMatch && method === 'POST') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { error: 'Unauthorized' }, 401);
    const post = getPost(pollVoteMatch[1]);
    if (!post || !post.poll) return json(res, { error: 'Poll not found' }, 404);
    const body = await readBody(req);
    const optIdx = body.optionIndex;
    if (optIdx === undefined || optIdx < 0 || optIdx >= post.poll.options.length) return json(res, { error: 'Invalid option' }, 400);
    if (!post.poll.voters) post.poll.voters = {};
    if (post.poll.voters[claims.id] !== undefined) return json(res, { error: 'Already voted' }, 409);
    post.poll.voters[claims.id] = optIdx;
    post.poll.options[optIdx].votes = (post.poll.options[optIdx].votes || 0) + 1;
    post.poll.totalVotes = (post.poll.totalVotes || 0) + 1;
    saveDB(db);
    return json(res, { poll: post.poll, votedIndex: optIdx });
  }

  // ── STATS (mimics LinkedIn's ingraphs gauge real data) ───────────────────

  if (p === '/api/stats' && method === 'GET') {
    const claims = authMiddleware(req);
    if (!claims) return json(res, { viewers: 0, impressions: 0 });
    return json(res, {
      viewers: Math.floor(100 + Math.random() * 200),
      impressions: Math.floor(1000 + Math.random() * 3000),
      searchAppearances: Math.floor(10 + Math.random() * 90)
    });
  }

  // ── STATIC FILES ──────────────────────────────────────────────────────────

  let pathname = p === '/' ? '/index.html' : p;
  // For routes like /profile, /jobs, /network → serve index.html (SPA)
  if (!path.extname(pathname) && !pathname.startsWith('/api/') && !pathname.startsWith('/homepage-guest/') && !pathname.startsWith('/litms/') && !pathname.startsWith('/li/')) {
    pathname = '/index.html';
  }

  const filePath = path.join(__dirname, pathname);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   OpenToNetwork — LinkedIn Clone via REA         ║');
  console.log('║   Evidence: ev_0befe5b572cd75c45f024763f2f85ea0d ║');
  console.log(`║   🌐  http://127.0.0.1:${PORT}/                       ║`);
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  console.log('📡 REA-Captured API Contracts active:');
  console.log('   GET  /homepage-guest/manifest.json');
  console.log('   GET  /litms/api/metadata/user');
  console.log('   POST /homepage-guest/api/ingraphs/gauge');
  console.log('   POST /homepage-guest/api/ingraphs/counter');
  console.log('   POST /li/track');
  console.log('');
  console.log('🔑 Auth endpoints:');
  console.log('   POST /api/auth/register');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/auth/me');
  console.log('');
  console.log('📰 App endpoints:');
  console.log('   GET  /api/feed   POST /api/posts   POST /api/posts/:id/like');
  console.log('   GET  /api/jobs   GET  /api/people  POST /api/connections');
  console.log('   GET  /api/notifications  GET /api/stats');
  console.log('');
  console.log('💬 Messaging:');
  console.log('   GET  /api/conversations  GET /api/messages/:userId  POST /api/messages/:userId');
  console.log('');
  console.log('💭 Comments:');
  console.log('   GET  /api/posts/:id/comments  POST /api/posts/:id/comments  POST /api/comments/:id/like');
  console.log('');
  console.log('🔍 Search:');
  console.log('   GET  /api/search?q=...&type=all|people|posts|jobs');
  console.log('');
  console.log('👤 Profile Sections:');
  console.log('   GET  /api/profile/:id  POST /api/profile/experience  POST /api/profile/education');
  console.log('   POST /api/profile/skills  POST /api/profile/certifications  POST /api/profile/skills/:id/endorse');
  console.log('');
  console.log('📊 Polls:');
  console.log('   POST /api/posts/:id/vote');
});
