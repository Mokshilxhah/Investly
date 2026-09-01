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
    companyName: 'Aura Security',
    industry: 'Cybersecurity',
    stage: 'Series A',
    founder: {
      name: 'Elena Rostova',
      background: 'Ex-CrowdStrike VP of SecOps, 12 years in enterprise infrastructure. MIT CS MS.',
    },
    website: 'https://aurasecurity.io',
    location: 'San Francisco, CA',
    description: 'Autonomous cloud identity governance and real-time privileged access management for hybrid enterprise environments.',
    evaluation: {
      experience: 9,
      domainExpertise: 10,
      execution: 9,
      vision: 9,
      teamStrength: 9,
    },
    analysis: {
      marketOpportunity: '$32B cloud identity and access management TAM growing at 24% CAGR.',
      marketScore: 9,
      businessModel: 'Enterprise SaaS tiered by cloud workloads ($65k-$180k ACV).',
      businessModelScore: 9,
      competitiveLandscape: 'Legacy IAM vendors require months to deploy; Aura installs agentlessly via modern APIs in under 15 minutes.',
      competitionScore: 9,
      revenue: '$2.8M ARR, 210% YoY growth with net revenue retention of 142%.',
      growthPotential: 'Rapid mid-market and enterprise adoption driven by strict zero-trust regulatory mandates.',
      growthScore: 9,
      keyRisks: 'Enterprise sales cycle duration during macro software budget reviews.',
      riskScore: 2,
      investmentThesis: 'Elite founder-market fit, pristine retention cohorts, and mission-critical cloud security positioning.',
    },
    decision: {
      status: 'INVEST',
      comment: 'Top-quartile SaaS metrics, strong CISO customer references, and defensible IP in cloud identity verification.',
      decidedBy: 'Moksh (Lead Partner)',
      decidedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    pipelineStage: 'CLOSED',
  },
  {
    companyName: 'Kinetix Bio',
    industry: 'Healthtech',
    stage: 'Series A',
    founder: {
      name: 'Dr. Aris Thorne',
      background: 'Johns Hopkins Oncology Faculty, 2 previous clinical diagnostics exits ($90M+).',
    },
    website: 'https://kinetixbio.com',
    location: 'Boston, MA',
    description: 'High-throughput microfluidic platform for accelerated precision oncology drug screening and patient stratification.',
    evaluation: {
      experience: 9,
      domainExpertise: 10,
      execution: 8,
      vision: 9,
      teamStrength: 8,
    },
    analysis: {
      marketOpportunity: '$24B oncology biomarker and precision therapeutics discovery market.',
      marketScore: 9,
      businessModel: 'Consumable chip sales + recurring clinical analytics software subscription per assay.',
      businessModelScore: 8,
      competitiveLandscape: '10x faster screening turnaround compared to traditional cellular culture assays.',
      competitionScore: 9,
      revenue: '$2.1M ARR across 48 pharmaceutical research partners.',
      growthPotential: 'Expanding into outpatient clinical trials and companion diagnostic partnerships.',
      growthScore: 8,
      keyRisks: 'Regulatory validation timelines and pharma partner procurement cycles.',
      riskScore: 3,
      investmentThesis: 'Breakthrough screening precision with dramatic cost and time reduction for oncology research.',
    },
    decision: {
      status: 'INVEST',
      comment: 'Superb clinical validation, strong IP portfolio, and high gross margin recurring consumable model.',
      decidedBy: 'Sarah Chen (Principal)',
      decidedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    pipelineStage: 'CLOSED',
  },
  {
    companyName: 'TracePay',
    industry: 'Fintech',
    stage: 'Seed',
    founder: {
      name: 'Sarah Chen',
      background: 'Ex-Stripe Infrastructure Lead, 10 years in global treasury and automated payment routing.',
    },
    website: 'https://tracepay.io',
    location: 'New York, NY',
    description: 'Next-generation cross-border B2B settlement infrastructure using regulated programmable treasury rails.',
    evaluation: {
      experience: 9,
      domainExpertise: 9,
      execution: 8,
      vision: 8,
      teamStrength: 9,
    },
    analysis: {
      marketOpportunity: '$48B global B2B cross-border payments and corporate FX settlement market.',
      marketScore: 9,
      businessModel: '0.15% basis point fee on settlement volume + monthly enterprise treasury software fee.',
      businessModelScore: 8,
      competitiveLandscape: 'Traditional SWIFT transfers take 2-4 days; TracePay settles instantly at 80% lower cost.',
      competitionScore: 8,
      revenue: '$620K ARR, 3.2x YoY volume growth, 100% customer retention.',
      growthPotential: 'Massive organic demand across global supply chain exporters and multinational tech vendors.',
      growthScore: 8,
      keyRisks: 'Global financial compliance and local banking partner integration timelines.',
      riskScore: 3,
      investmentThesis: 'Top-tier payment infrastructure engineering pedigree solving a massive multi-trillion dollar market friction.',
    },
    decision: {
      status: 'INVEST',
      comment: 'Exceptional technical execution, rapid payment volume acceleration, and strong regulatory strategy.',
      decidedBy: 'Moksh (Lead Partner)',
      decidedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    pipelineStage: 'COMMITTEE',
  },
  {
    companyName: 'VectraDB',
    industry: 'SaaS',
    stage: 'Seed',
    founder: {
      name: 'Marcus Vance',
      background: 'Former Principal Distributed Systems Architect at AWS DynamoDB. Open source database maintainer.',
    },
    website: 'https://vectradb.dev',
    location: 'Seattle, WA',
    description: 'High-throughput, low-latency distributed vector database optimized for real-time multimodal AI inference.',
    evaluation: {
      experience: 8,
      domainExpertise: 9,
      execution: 7,
      vision: 8,
      teamStrength: 7,
    },
    analysis: {
      marketOpportunity: '$16B enterprise AI database and vector storage infrastructure market forecasted by 2028.',
      marketScore: 8,
      businessModel: 'Consumption-based cloud infrastructure pricing with enterprise dedicated VPC tiers.',
      businessModelScore: 7,
      competitiveLandscape: 'Competing with Pinecone and Weaviate. Differentiates on sub-millisecond p99 latency benchmarks.',
      competitionScore: 6,
      revenue: '$280K ARR with 18,000 active open-source developers.',
      growthPotential: 'Strong developer community flywheel; enterprise sales pipeline ramping quickly.',
      growthScore: 8,
      keyRisks: 'High infrastructure compute burn during scale; competitive pressure from cloud hyperscalers.',
      riskScore: 4,
      investmentThesis: 'Benchmark-leading performance numbers and strong bottom-up developer adoption.',
    },
    decision: {
      status: 'WATCHLIST',
      comment: 'Impressive tech stack and founder engineering depth. Monitoring Q2 customer conversion velocity and enterprise monetization.',
      decidedBy: 'Investment Committee',
      decidedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    pipelineStage: 'EVALUATION',
  },
  {
    companyName: 'Helios Energy',
    industry: 'CleanTech',
    stage: 'Seed',
    founder: {
      name: 'Amara Patel',
      background: 'Ex-Tesla Energy Operations, MIT Energy Initiative Fellow. 8 years in commercial storage.',
    },
    website: 'https://heliosenergy.io',
    location: 'Austin, TX',
    description: 'AI-driven dispatch and revenue optimization software for utility-scale battery storage and microgrids.',
    evaluation: {
      experience: 7,
      domainExpertise: 8,
      execution: 7,
      vision: 8,
      teamStrength: 7,
    },
    analysis: {
      marketOpportunity: '$30B renewable grid resilience and commercial battery management sector.',
      marketScore: 8,
      businessModel: '15% revenue share on energy market arbitrage profits + recurring telemetry fee.',
      businessModelScore: 7,
      competitiveLandscape: 'Regional utility integrations create high switching costs and defensible data moats.',
      competitionScore: 6,
      revenue: '$450K ARR across 6 utility-scale pilot installations in ERCOT and CAISO.',
      growthPotential: 'Strong tailwinds from clean energy legislation and grid modernization capital expenditures.',
      growthScore: 7,
      keyRisks: 'Energy regulatory changes and regional grid interconnection approval delays.',
      riskScore: 4,
      investmentThesis: 'Strong founder-market fit in high-growth grid infrastructure software with attractive profit-share model.',
    },
    decision: {
      status: 'WATCHLIST',
      comment: 'Encouraging pilot revenue data. Tracking contract conversion across the next two utility partners.',
      decidedBy: 'Moksh (Lead Partner)',
      decidedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    },
    pipelineStage: 'UNDER_REVIEW',
  },
  {
    companyName: 'Synthetix Robotics',
    industry: 'Technology',
    stage: 'Pre-seed',
    founder: {
      name: 'Liam O\'Connor',
      background: 'Ex-Boston Dynamics Robotics Lead, CMU Robotics MS. Author of 5 robotics vision patents.',
    },
    website: 'https://synthetixrobotics.com',
    location: 'Pittsburgh, PA',
    description: 'Vision-language foundation AI models for autonomous manipulation and bin-picking in industrial logistics.',
    evaluation: {
      experience: 8,
      domainExpertise: 8,
      execution: 6,
      vision: 8,
      teamStrength: 7,
    },
    analysis: {
      marketOpportunity: '$28B warehouse automation and industrial robotics software market.',
      marketScore: 8,
      businessModel: 'Robotics-as-a-Service (RaaS) annual software subscription per deployed robotic arm.',
      businessModelScore: 6,
      competitiveLandscape: 'Traditional robotics systems require custom scripting; Synthetix learns novel object handling in zero-shot.',
      competitionScore: 7,
      revenue: 'Pre-commercial stage with 2 signed paid evaluation pilots with Tier-1 logistics providers.',
      growthPotential: 'Massive scalability if zero-shot manipulation accuracy crosses 99.9% reliability bar.',
      growthScore: 7,
      keyRisks: 'Hardware-dependent sales cycle and long customer factory floor integration testing.',
      riskScore: 4,
      investmentThesis: 'Cutting-edge robotic foundation model architecture with world-class technical founder team.',
    },
    decision: {
      status: 'UNDER_EVALUATION',
      comment: 'Currently validating pilot throughput benchmarks and zero-shot error rates in live warehouse environments.',
      decidedBy: 'Investment Analyst',
      decidedAt: null,
    },
    pipelineStage: 'EVALUATION',
  },
  {
    companyName: 'Zenith Delivery',
    industry: 'Logistics',
    stage: 'Seed',
    founder: {
      name: 'Kevin Zhao',
      background: 'Former City Operations Launcher at Uber Eats and Gopuff.',
    },
    website: 'https://zenithdelivery.co',
    location: 'Chicago, IL',
    description: '15-minute on-demand grocery delivery network relying on leased micro-fulfillment dark stores.',
    evaluation: {
      experience: 5,
      domainExpertise: 5,
      execution: 4,
      vision: 4,
      teamStrength: 4,
    },
    analysis: {
      marketOpportunity: 'Heavily commoditized on-demand delivery market characterized by severe customer churn.',
      marketScore: 4,
      businessModel: 'Persistently negative contribution margins after rider compensation, leases, and inventory spoilage.',
      businessModelScore: 3,
      competitiveLandscape: 'Well-capitalized incumbents (DoorDash, Instacart) possess insurmountable CAC and scale advantages.',
      competitionScore: 3,
      revenue: '$110K monthly GMV maintained through unsustainable promotional subsidy spend.',
      growthPotential: 'High cash burn rate with poor cohort retention after promotional period ends.',
      growthScore: 4,
      keyRisks: 'Runway exhaustion within 3-4 months without immediate multi-million dollar equity financing.',
      riskScore: 8,
      investmentThesis: 'Unviable unit economics in a capital-destructive category without technological defensibility.',
    },
    decision: {
      status: 'REJECT',
      comment: 'Fundamentally flawed unit economics, lack of proprietary defensibility, and intense competitive saturation.',
      decidedBy: 'Investment Committee',
      decidedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
    pipelineStage: 'CLOSED',
  },
  {
    companyName: 'DropCart',
    industry: 'E-commerce',
    stage: 'Idea',
    founder: {
      name: 'Jordan Bell',
      background: 'Digital marketing affiliate and dropshipping storefront operator for 3 years.',
    },
    website: 'https://dropcart.shop',
    location: 'Miami, FL',
    description: 'Automated social commerce storefront builder for dropshipping unbranded apparel via short-form video ads.',
    evaluation: {
      experience: 4,
      domainExpertise: 4,
      execution: 3,
      vision: 4,
      teamStrength: 3,
    },
    analysis: {
      marketOpportunity: 'Saturated dropshipping tooling sector with declining organic merchant interest.',
      marketScore: 4,
      businessModel: '5% transaction take-rate + $29/month software fee.',
      businessModelScore: 4,
      competitiveLandscape: 'Heavily dominated by Shopify, TikTok Shop, and automated dropshipping apps.',
      competitionScore: 2,
      revenue: 'Pre-launch MVP prototype.',
      growthPotential: 'Extreme customer churn and heavy reliance on escalating paid social ad spend.',
      growthScore: 3,
      keyRisks: 'Supplier quality inconsistency, slow overseas shipping times, and high chargeback rates.',
      riskScore: 9,
      investmentThesis: 'Absence of technical moat, defensible distribution channels, or differentiated merchant value.',
    },
    decision: {
      status: 'REJECT',
      comment: 'No proprietary IP or durable competitive advantage against established e-commerce platform giants.',
      decidedBy: 'Investment Committee',
      decidedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    pipelineStage: 'CLOSED',
  },
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
