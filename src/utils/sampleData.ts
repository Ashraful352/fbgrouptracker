import { GroupPost } from '../types';
import { FB_GROUPS_LIST } from '../data/groupList';
import { RETENTION_PERIOD_MS } from './time';

export const INITIAL_KEYWORDS = [
  'guest post',
  'backlink',
  'hiring',
  'budget',
  'dofollow',
  'urgent',
  'link building',
  'local seo',
  'niche edit',
  'client need',
];

interface PostTemplate {
  authorName: string;
  groupSlugMatch?: string;
  categoryMatch?: string;
  content: string;
  relativeHoursAgo: number;
  priority?: 'high' | 'normal';
}

const SEED_TEMPLATES: PostTemplate[] = [
  {
    authorName: 'Tanvir Hossain',
    groupSlugMatch: 'guestpostseobacklinksservice',
    content: 'Urgent Client Requirement: Looking for real organic traffic guest post sites in Tech & SaaS niche. DA 50+, DR 45+, Organic Traffic 10k+. Dofollow link required. Please inbox your sheet with live URL samples and instant prices. Serious vendors only!',
    relativeHoursAgo: 0.25, // 15 mins ago
    priority: 'high',
  },
  {
    authorName: 'Rashidul Islam',
    groupSlugMatch: 'seojobspost',
    content: 'Hiring Full-Time SEO Specialist for UK E-commerce Client. Responsibilities: On-page optimization, Schema markup, technical audits (Screaming Frog), and monthly outreach. Budget: $400 - $650/month. Drop your portfolio or Upwork profile link.',
    relativeHoursAgo: 1.2,
    priority: 'high',
  },
  {
    authorName: 'Saad Ahmed',
    groupSlugMatch: 'bdseoexpert',
    content: 'Has anyone seen indexing delays after the recent Google Search core algorithm update? My new informational blog posts are stuck in "Discovered - currently not indexed" for 5 days. Any proven indexing tips without paid indexing tools?',
    relativeHoursAgo: 2.8,
    priority: 'normal',
  },
  {
    authorName: 'Arafat Rahman',
    groupSlugMatch: 'LinkBuildingStrategies',
    content: 'Need high-authority editorial backlinks for an Australian Health & Fitness clinic. Looking for niche edits on aged articles (indexed > 6 months). Immediate deal if metrics match. Budget is flexible.',
    relativeHoursAgo: 5.5,
    priority: 'high',
  },
  {
    authorName: 'Mahmudul Hasan',
    groupSlugMatch: 'localseocommunityandgooglemybusiness',
    content: 'Need help with Google Business Profile (GBP) video verification for a service-area business in Dallas, Texas. Verification rejected twice. Who has experience solving this?',
    relativeHoursAgo: 9.1,
    priority: 'normal',
  },
  {
    authorName: 'Farhan Tariq',
    groupSlugMatch: 'seomastermindspakistan',
    content: 'Exchange high DR 60+ SaaS blogs: Looking for reciprocal or ABC 3-way guest post link building partners in the MarTech/CRM space. No PBNs or link farms please.',
    relativeHoursAgo: 15.3,
    priority: 'high',
  },
  {
    authorName: 'Sakib Chowdhury',
    groupSlugMatch: 'seosquadbangladesh',
    content: 'Looking for a reliable Content Writer with deep understanding of Surfer SEO & NeuronWriter. English fluency must be native level. 10 articles/week ongoing project. Comment your per-word rate.',
    relativeHoursAgo: 20.0,
    priority: 'normal',
  },
  {
    authorName: 'Naimur Rahman',
    groupSlugMatch: 'freeguestpostingsite',
    content: 'Sharing 100+ Free Instant Approval Guest Posting Sites list for general niches. Bookmark and share with fellow digital marketers. Leave a comment to get direct Google Drive spreadsheet access.',
    relativeHoursAgo: 23.6, // Expiring in ~24 minutes! Shows countdown in action!
    priority: 'normal',
  },
];

export function generateInitialPosts(): GroupPost[] {
  const now = Date.now();

  return SEED_TEMPLATES.map((tmpl, idx) => {
    let group = FB_GROUPS_LIST.find(g => g.slug === tmpl.groupSlugMatch);
    if (!group) {
      group = FB_GROUPS_LIST[idx % FB_GROUPS_LIST.length];
    }

    const createdAt = now - Math.floor(tmpl.relativeHoursAgo * 60 * 60 * 1000);
    const expiresAt = createdAt + RETENTION_PERIOD_MS;

    const matchedKeywords = INITIAL_KEYWORDS.filter(kw =>
      tmpl.content.toLowerCase().includes(kw.toLowerCase())
    );

    const isHigh = tmpl.priority === 'high' || matchedKeywords.length > 0;

    return {
      id: `post_seed_${idx + 1}_${Date.now()}`,
      groupId: group.id,
      groupName: group.name,
      groupUrl: group.url,
      authorName: tmpl.authorName,
      content: tmpl.content,
      postUrl: `${group.url}/posts/${Math.floor(100000000000000 + Math.random() * 900000000000000)}/`,
      createdAt,
      expiresAt,
      isStarred: idx === 1, // sample starred item
      isRead: idx > 3,
      tags: [group.category],
      matchedKeywords,
      priority: isHigh ? 'high' : 'normal',
    };
  });
}

// Dynamic post generator for Real-Time Radar simulation
const RADAR_AUTHORS = [
  'Zubair Khan',
  'Shakil Ahmed',
  'Kamran Ali',
  'Rifat Hasan',
  'Naveed Akhtar',
  'Sabbir Mahmud',
  'Arifur Rahman',
  'Mustafa Kamal',
  'Tamim Iqbal',
  'Hassan Raza',
];

const RADAR_CONTENT_SNIPPETS = [
  {
    text: 'Client Need: Looking for High DA 60+ Business and Finance guest post sites. Real traffic only (Semrush 15k+). Immediate payment via Payoneer or Wise. Drop list in inbox.',
    keywords: ['client need', 'guest post', 'budget'],
  },
  {
    text: 'Hiring an experienced Link Builder for white-hat blogger outreach. Must know how to find target webmasters via Hunter.io / Pitchbox. Full-time opportunity.',
    keywords: ['hiring', 'link building'],
  },
  {
    text: 'Urgent: Need 5 Dofollow backlinks for home improvement website in Florida. Minimum DR 40. Please PM prices and sample URLs.',
    keywords: ['urgent', 'dofollow', 'backlink'],
  },
  {
    text: 'Local SEO client ranking question: Local pack rankings dropped after moving address 2 miles away. GMB citation audit in progress. What is the fastest ranking recovery tactic?',
    keywords: ['local seo'],
  },
  {
    text: 'Selling high-quality aged guest post inventory on Forbes, Entrepreneur, and TechRadar tier sites. Dofollow links guaranteed. Inbox for pricing sheet.',
    keywords: ['guest post', 'dofollow'],
  },
  {
    text: 'Looking for a dedicated SEO Auditor to review an 80,000-page e-commerce site with pagination & canonical issues. Good budget for experienced professional.',
    keywords: ['budget', 'hiring'],
  },
  {
    text: 'Free Backlink Opportunity: Doing a roundup post on "Top Digital Marketing Trends for 2026". Drop your insights with author bio and website link to be featured.',
    keywords: ['backlink', 'guest post'],
  },
];

export function generateRandomRadarPost(keywords: string[] = INITIAL_KEYWORDS): GroupPost {
  const now = Date.now();
  const randomGroup = FB_GROUPS_LIST[Math.floor(Math.random() * FB_GROUPS_LIST.length)];
  const randomAuthor = RADAR_AUTHORS[Math.floor(Math.random() * RADAR_AUTHORS.length)];
  const snippetObj = RADAR_CONTENT_SNIPPETS[Math.floor(Math.random() * RADAR_CONTENT_SNIPPETS.length)];

  const matchedKeywords = keywords.filter(kw =>
    snippetObj.text.toLowerCase().includes(kw.toLowerCase())
  );

  return {
    id: `post_radar_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    groupId: randomGroup.id,
    groupName: randomGroup.name,
    groupUrl: randomGroup.url,
    authorName: randomAuthor,
    content: snippetObj.text,
    postUrl: `${randomGroup.url}/posts/${Math.floor(100000000000000 + Math.random() * 900000000000000)}/`,
    createdAt: now,
    expiresAt: now + RETENTION_PERIOD_MS,
    isStarred: false,
    isRead: false,
    tags: [randomGroup.category],
    matchedKeywords,
    priority: matchedKeywords.length > 0 ? 'high' : 'normal',
  };
}
