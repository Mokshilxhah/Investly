require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Startup = require('../models/Startup');
const {
  calculateFounderScore,
  calculateOverallInvestmentScore,
  getSystemRecommendation,
  generateDecisionExplanation,
} = require('../utils/scoring');

const seedStartups = [
  {
    companyName: 'FinPulse AI',
    industry: 'Fintech',
    stage: 'Seed',
    founder: {
      name: 'Sarah Chen',
      background: 'Ex-Stripe VP of Product, 12 years building core payment routing infrastructure. Stanford CS MS.',
    },
    website: 'https://finpulse.ai',
    location: 'San Francisco, CA',
    description: 'Autonomous financial anomaly detection and automated treasury optimization for high-growth tech scaleups.',
    evaluation: {
      experience: 9,
      domainExpertise: 10,
      execution: 9,
      vision: 8,
      teamStrength: 9,
    },
    analysis: {
      marketOpportunity: '$45B global corporate treasury and financial ops TAM growing at 28% CAGR.',
      marketScore: 9,
      businessModel: 'B2B SaaS with $30k-$120k ACV tiered by managed asset volume.',
      businessModelScore: 8,
      competitiveLandscape: 'Legacy tools like Kyriba are slow to implement; FinPulse integrates in under 15 minutes via modern APIs.',
      competitionScore: 8,
      revenue: '$420K ARR, 3.4x YoY growth, net dollar retention 138%.',
      growthPotential: 'Massive expansion across mid-market enterprise with zero sales-led friction.',
      growthScore: 9,
      keyRisks: 'Stringent financial data privacy regulations (SOC2 Type II in progress).',
      riskScore: 7,
      investmentThesis: 'Strong founder-market fit, proven early velocity, and enterprise stickiness in critical financial workflow.',
    },
    decision: {
      status: 'INVEST',
      comment: 'Exceptional founder pedigree with top-tier domain expertise. Clear product-market fit and best-in-class unit economics.',
      decidedBy: 'Moksh (Lead Partner)',
      decidedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    pipelineStage: 'CLOSED',
  },
  {
    companyName: 'NeuroHealth Labs',
    industry: 'Healthtech',
    stage: 'Series A',
    founder: {
      name: 'Dr. Aris Thorne',
      background: 'Neuroscientist at Johns Hopkins, 2 previous clinical diagnostics startup exits ($80M+).',
    },
    website: 'https://neurohealthlabs.io',
    location: 'Boston, MA',
    description: 'Non-invasive neural biomarker monitoring headset for early Alzheimer’s and neurodegenerative detection.',
    evaluation: {
      experience: 9,
      domainExpertise: 10,
      execution: 8,
      vision: 9,
      teamStrength: 8,
    },
    analysis: {
      marketOpportunity: '$22B diagnostic and clinical neurology market with urgent payer demand.',
      marketScore: 9,
      businessModel: 'Hardware lease + recurring clinical analytics software subscription per scan.',
      businessModelScore: 8,
      competitiveLandscape: 'Traditional PET scans cost $5,000+; NeuroHealth performs 10-minute screening at $150.',
      competitionScore: 9,
      revenue: '$1.8M ARR across 45 clinical neurology centers.',
      growthPotential: 'Expanding into outpatient primary care and clinical trial patient stratification.',
      growthScore: 8,
      keyRisks: 'FDA 510(k) clearance timeline and clinical reimbursement code adoption.',
      riskScore: 6,
      investmentThesis: 'Breakthrough diagnostic accuracy with massive cost reduction over existing hospital hardware.',
    },
    decision: {
      status: 'INVEST',
      comment: 'Superb clinical validation, strong IP portfolio, and high gross margin SaaS expansion model.',
      decidedBy: 'Elena Rostova (Principal)',
      decidedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    pipelineStage: 'CLOSED',
  },
  {
    companyName: 'CloudScale DB',
    industry: 'SaaS',
    stage: 'Seed',
    founder: {
      name: 'Marcus Vance',
      background: 'Former Senior Distributed Systems Architect at AWS DynamoDB. Open source contributor.',
    },
    website: 'https://cloudscaledb.dev',
    location: 'Seattle, WA',
    description: 'Serverless vector database engine optimized for real-time multimodal AI indexing and hybrid search.',
    evaluation: {
      experience: 8,
      domainExpertise: 9,
      execution: 7,
      vision: 8,
      teamStrength: 7,
    },
    analysis: {
      marketOpportunity: 'Surging vector and AI database spend forecasted to hit $18B by 2028.',
      marketScore: 8,
      businessModel: 'Consumption-based cloud infrastructure pricing with enterprise dedicated VPC tiers.',
      businessModelScore: 7,
      competitiveLandscape: 'Competing with Pinecone, Weaviate, and pgvector. CloudScale differentiates on sub-millisecond p99 latency.',
      competitionScore: 6,
      revenue: '$180K ARR with 12,000 active open-source developers.',
      growthPotential: 'Developer adoption is viral; enterprise sales pipeline building up.',
      growthScore: 8,
      keyRisks: 'High compute costs during early scale; competition from hyperscalers (AWS/GCP/Azure native vector stores).',
      riskScore: 6,
      investmentThesis: 'Differentiated latency benchmark numbers and strong developer community backing.',
    },
    decision: {
      status: 'WATCHLIST',
      comment: 'Impressive tech stack and founder capability. Watching Q2 customer conversion rates and monetization velocity.',
      decidedBy: 'Marcus Vance',
      decidedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    pipelineStage: 'EVALUATION',
  },
  {
    companyName: 'GreenGrid Energy',
    industry: 'CleanTech',
    stage: 'Pre-seed',
    founder: {
      name: 'Amara Patel',
      background: 'Clean energy policy fellow at MIT Energy Initiative. First-time founder.',
    },
    website: 'https://greengrid.energy',
    location: 'Austin, TX',
    description: 'Decentralized peer-to-peer microgrid arbitrage platform enabling commercial facilities to trade solar surplus.',
    evaluation: {
      experience: 6,
      domainExpertise: 8,
      execution: 6,
      vision: 8,
      teamStrength: 6,
    },
    analysis: {
      marketOpportunity: '$35B commercial grid resilience and renewable energy trading opportunity.',
      marketScore: 7,
      businessModel: '2.5% transaction fee on all peer-to-peer power transfers + hardware hub sale.',
      businessModelScore: 6,
      competitiveLandscape: 'Heavy municipal utility regulatory barriers and legacy grid operator pushback.',
      competitionScore: 5,
      revenue: 'Pre-revenue. 3 pilot industrial parks signed in ERCOT territory.',
      growthPotential: 'Huge if state energy market deregulation expands; restricted otherwise.',
      growthScore: 7,
      keyRisks: 'Utility regulatory approvals and complex hardware deployment logistics.',
      riskScore: 4,
      investmentThesis: 'High vision play on energy transition, but regulatory moat is double-edged.',
    },
    decision: {
      status: 'WATCHLIST',
      comment: 'Promising pilot results in Texas. Need to see regulatory clearance and pilot conversion to paid contracts.',
      decidedBy: 'Moksh (Lead Partner)',
      decidedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    pipelineStage: 'UNDER_REVIEW',
  },
  {
    companyName: 'QuickDrop Logistics',
    industry: 'Logistics',
    stage: 'Seed',
    founder: {
      name: 'Kevin Zhao',
      background: 'Ex-Uber Eats city launcher. Background in logistics operations.',
    },
    website: 'https://quickdropnow.com',
    location: 'Chicago, IL',
    description: '15-minute ultra-fast grocery delivery network relying on micro-fulfillment dark stores.',
    evaluation: {
      experience: 5,
      domainExpertise: 5,
      execution: 4,
      vision: 4,
      teamStrength: 4,
    },
    analysis: {
      marketOpportunity: 'Crowded on-demand delivery market with high customer acquisition costs.',
      marketScore: 4,
      businessModel: 'Negative unit economics after factoring delivery wages, store lease, and food spoilage.',
      businessModelScore: 3,
      competitiveLandscape: 'Dominant incumbents (Instacart, DoorDash, Gopuff) have massive capital advantages.',
      competitionScore: 3,
      revenue: '$80K GMV monthly with heavy promotional subsidy burn.',
      growthPotential: 'High burn rate with unsustainable unit economics.',
      growthScore: 4,
      keyRisks: 'Cash depletion within 4 months without continuous venture subsidy.',
      riskScore: 2,
      investmentThesis: 'No sustainable competitive advantage in a heavily capital-destructive category.',
    },
    decision: {
      status: 'REJECT',
      comment: 'Fundamentally unviable unit economics and fierce incumbent competition with no clear moat.',
      decidedBy: 'Investment Committee',
      decidedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
    pipelineStage: 'CLOSED',
  },
  {
    companyName: 'CyberShield X',
    industry: 'Cybersecurity',
    stage: 'Series A',
    founder: {
      name: 'David Holtz',
      background: 'Ex-NSA Red Team lead, former Head of Threat Intel at CrowdStrike.',
    },
    website: 'https://cybershieldx.security',
    location: 'Washington, DC',
    description: 'AI-driven proactive agentic penetration testing that simulates advanced nation-state attacks autonomously.',
    evaluation: {
      experience: 9,
      domainExpertise: 10,
      execution: 9,
      vision: 9,
      teamStrength: 9,
    },
    analysis: {
      marketOpportunity: '$30B offensive cybersecurity and automated pentesting sector.',
      marketScore: 9,
      businessModel: 'Annual enterprise subscription ($85k average contract value) + automated remediation upsell.',
      businessModelScore: 9,
      competitiveLandscape: 'Traditional pentests take 4 weeks and $40k per audit; CyberShield runs continuous automated tests 24/7.',
      competitionScore: 9,
      revenue: '$2.2M ARR, growing 220% YoY with zero customer churn.',
      growthPotential: 'Expansive enterprise pipeline across Fortune 500 banks and defense contractors.',
      growthScore: 9,
      keyRisks: 'Safety guardrails to ensure simulated attacks never disrupt active production infrastructure.',
      riskScore: 8,
      investmentThesis: 'Unrivaled offensive threat expertise, pristine enterprise retention, and massive market tailwinds.',
    },
    decision: {
      status: 'INVEST',
      comment: 'Top quartile SaaS metrics, stellar customer references from tier-1 CISOs, and defensible IP.',
      decidedBy: 'Moksh (Lead Partner)',
      decidedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    pipelineStage: 'COMMITTEE',
  },
  {
    companyName: 'EduBridge Virtual',
    industry: 'EdTech',
    stage: 'Seed',
    founder: {
      name: 'Maya Lin',
      background: 'Former curriculum director at Coursera, EdTech podcast host.',
    },
    website: 'https://edubridgelearn.com',
    location: 'Toronto, Canada',
    description: 'Interactive AI tutor for high school STEM students integrated directly into homework platforms.',
    evaluation: {
      experience: 7,
      domainExpertise: 8,
      execution: 6,
      vision: 7,
      teamStrength: 7,
    },
    analysis: {
      marketOpportunity: '$14B supplementary K-12 tutoring market.',
      marketScore: 7,
      businessModel: 'B2C monthly subscription ($29/mo) and school district licensing.',
      businessModelScore: 6,
      competitiveLandscape: 'Facing competition from Khan Academy, Chegg, and ChatGPT Plus directly.',
      competitionScore: 5,
      revenue: '$310K ARR across 4,200 active paid student subscribers.',
      growthPotential: 'Good organic student referrals; school district sales cycles are long (9-12 months).',
      growthScore: 6,
      keyRisks: 'High summer churn and low barriers to entry from generic LLM wrappers.',
      riskScore: 5,
      investmentThesis: 'Engaging UX, but needs deeper curriculum moats to prevent displacement by frontier LLMs.',
    },
    decision: {
      status: 'UNDER_EVALUATION',
      comment: 'Currently undergoing pedagogical benchmarking and retention analysis.',
      decidedBy: 'Investment Analyst',
      decidedAt: null,
    },
    pipelineStage: 'EVALUATION',
  },
  {
    companyName: 'Veloce Retail',
    industry: 'E-commerce',
    stage: 'Idea',
    founder: {
      name: 'Jordan Bell',
      background: 'E-commerce dropshipping store manager for 3 years.',
    },
    website: 'https://veloceretail.shop',
    location: 'Miami, FL',
    description: 'Social commerce platform for influencer-curated flash sales of unbranded overseas fashion apparel.',
    evaluation: {
      experience: 4,
      domainExpertise: 5,
      execution: 3,
      vision: 4,
      teamStrength: 3,
    },
    analysis: {
      marketOpportunity: 'Commoditized fashion dropshipping.',
      marketScore: 4,
      businessModel: '10% take rate with zero inventory commitment.',
      businessModelScore: 4,
      competitiveLandscape: 'Overwhelmed by Shein, Temu, and TikTok Shop.',
      competitionScore: 2,
      revenue: 'Pre-launch prototype.',
      growthPotential: 'Very low retention and extreme customer acquisition costs.',
      growthScore: 3,
      keyRisks: 'Supplier quality control, shipment delays, and high return rates.',
      riskScore: 2,
      investmentThesis: 'Lacks technical moat, defensible distribution, or unique value proposition.',
    },
    decision: {
      status: 'REJECT',
      comment: 'No defensible IP or unfair advantage against dominant discount e-commerce platforms.',
      decidedBy: 'Investment Committee',
      decidedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    pipelineStage: 'CLOSED',
  }
];

const seedDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/startup_intelligence';
  console.log(`[Seed] Connecting to MongoDB: ${uri}`);

  let mongoMemoryServer = null;
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
  } catch (err) {
    console.warn(`[Seed] Direct connect failed (${err.message}). Using In-Memory MongoDB...`);
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoMemoryServer.getUri());
  }

  console.log('[Seed] Clearing existing startups...');
  await Startup.deleteMany({});

  console.log(`[Seed] Inserting ${seedStartups.length} startups with precomputed scores...`);

  for (const startupData of seedStartups) {
    // Compute founder score
    const founderScore = calculateFounderScore(startupData.evaluation);
    startupData.evaluation.overallScore = founderScore;
    startupData.evaluation.updatedAt = new Date();

    // Compute scorecard
    const scores = {
      founderScore,
      marketScore: startupData.analysis.marketScore,
      businessModelScore: startupData.analysis.businessModelScore,
      growthScore: startupData.analysis.growthScore,
      competitionScore: startupData.analysis.competitionScore,
      riskScore: startupData.analysis.riskScore,
    };

    const overallInvestmentScore = calculateOverallInvestmentScore(scores);
    const systemRecommendation = getSystemRecommendation(overallInvestmentScore);
    const { strengths, concerns, confidence } = generateDecisionExplanation({
      ...scores,
      overallInvestmentScore,
    });

    startupData.scorecard = {
      founderScore,
      marketScore: startupData.analysis.marketScore,
      businessModelScore: startupData.analysis.businessModelScore,
      growthScore: startupData.analysis.growthScore,
      competitionScore: startupData.analysis.competitionScore,
      riskScore: startupData.analysis.riskScore,
      overallInvestmentScore,
      systemRecommendation,
      strengths,
      concerns,
      confidence,
    };

    await Startup.create(startupData);
  }

  console.log('✅ [Seed] Successfully seeded startup data!');
  await mongoose.connection.close();
  if (mongoMemoryServer) await mongoMemoryServer.stop();
  process.exit(0);
};

if (require.main === module) {
  seedDB().catch(err => {
    console.error('❌ [Seed] Error seeding database:', err);
    process.exit(1);
  });
}

module.exports = { seedStartups };
