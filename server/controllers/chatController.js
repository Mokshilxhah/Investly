const Startup = require('../models/Startup');

/**
 * Clean & Concise Diligence Context Engine
 * Provides short, executive-ready answers without walls of text.
 */

function formatStartupBrief(s) {
  const overall = s.scorecard?.overallInvestmentScore ? `${s.scorecard.overallInvestmentScore.toFixed(1)}/10` : 'Not Rated';
  const status = s.decision?.status || 'UNDER_EVALUATION';
  const statusEmoji = status === 'INVEST' ? '🟢' : status === 'WATCHLIST' ? '🟡' : status === 'REJECT' ? '🔴' : '🟣';

  return `### **${s.companyName}** (${s.industry} • ${s.stage})
- **Score & Status**: **${overall}** | ${statusEmoji} **\`${status}\`**
- **Founder**: **${s.founder?.name || 'Founding Team'}** (${s.founder?.background || 'Bio in progress'})
- **Revenue**: ${s.analysis?.revenue || 'Pre-revenue'}
- **Thesis**: *"${s.analysis?.investmentThesis || s.decision?.comment || 'Diligence in progress'}"*
- [Open Studio →](/evaluation?id=${s._id})`;
}

function processInAppQuery(query, startups) {
  const q = (query || '').toLowerCase().trim();

  // 1. GREETING
  if (['hi', 'hello', 'hey', 'help'].some(w => q === w || q.startsWith(w + ' '))) {
    return {
      reply: `👋 **Hi! I'm your Diligence Copilot.**\n\nI have live access to all **${startups.length} startups** in your pipeline. Ask me anything about deals, founder scores, risk alerts, or comparisons.`,
      suggestions: ['🏆 Top Deal', '🛡️ Risk Alerts', '📊 Portfolio Summary', '⚡ Founder Rankings'],
    };
  }

  // 2. SCORING FORMULA
  if (q.includes('formula') || q.includes('score') && (q.includes('how') || q.includes('calculate') || q.includes('weight'))) {
    return {
      reply: `📐 **Deal Scoring Weights:**\n\n- 👤 **Founder**: **30%**\n- 🌍 **Market TAM**: **20%**\n- 📈 **Growth & Traction**: **20%**\n- 💼 **Business Model**: **15%**\n- 🛡️ **Moat**: **10%**\n- ⚠️ **Risk Mitigation**: **5%**\n\n🟢 **INVEST**: $\\ge 8.0$ | 🟡 **WATCHLIST**: $6.0 - 7.9$ | 🔴 **REJECT**: $< 6.0$`,
      suggestions: ['🏆 Top Deal', '📊 Portfolio Summary'],
    };
  }

  // 3. COMPARISON (e.g. "compare X and Y" or "X vs Y")
  const vsMatch = q.match(/(?:compare\s+)?([a-z0-9\s]+?)\s+(?:and|vs|versus|\&)\s+([a-z0-9\s]+)/i);
  if (vsMatch) {
    const name1 = vsMatch[1].replace(/compare/i, '').trim();
    const name2 = vsMatch[2].trim();

    const s1 = startups.find(s => s.companyName.toLowerCase().includes(name1) || name1.includes(s.companyName.toLowerCase()));
    const s2 = startups.find(s => s.companyName.toLowerCase().includes(name2) || name2.includes(s.companyName.toLowerCase()));

    if (s1 && s2) {
      const score1 = s1.scorecard?.overallInvestmentScore || 0;
      const score2 = s2.scorecard?.overallInvestmentScore || 0;
      const winner = score1 >= score2 ? s1 : s2;

      return {
        reply: `⚖️ **${s1.companyName} vs ${s2.companyName}**\n\n| Metric | ${s1.companyName} | ${s2.companyName} |\n|---|:---:|:---:|\n| **Overall Score** | **${score1 ? `${score1.toFixed(1)}/10` : '—'}** | **${score2 ? `${score2.toFixed(1)}/10` : '—'}** |\n| **Founder Score** | ${s1.evaluation?.overallScore ? `${s1.evaluation.overallScore.toFixed(1)}/10` : '—'} | ${s2.evaluation?.overallScore ? `${s2.evaluation.overallScore.toFixed(1)}/10` : '—'} |\n| **Market TAM** | ${s1.analysis?.marketScore || '—'}/10 | ${s2.analysis?.marketScore || '—'}/10 |\n| **Growth** | ${s1.analysis?.growthScore || '—'}/10 | ${s2.analysis?.growthScore || '—'}/10 |\n| **Status** | \`${s1.decision?.status || 'PENDING'}\` | \`${s2.decision?.status || 'PENDING'}\` |\n\n🏆 **Leader**: **${winner.companyName}** (${winner.scorecard?.overallInvestmentScore?.toFixed(1) || '—'}/10)\n\n👉 [Open Comparison Matrix →](/compare?ids=${s1._id},${s2._id})`,
        suggestions: [`Explore ${s1.companyName}`, `Explore ${s2.companyName}`, '🏆 Top Deal'],
      };
    }
  }

  // 4. SPECIFIC STARTUP DIRECT QUERY
  const matchedStartup = startups.find(s => {
    const sName = s.companyName.toLowerCase();
    const fName = (s.founder?.name || '').toLowerCase();
    return q.includes(sName) || (fName.length > 4 && q.includes(fName));
  });

  if (matchedStartup) {
    return {
      reply: formatStartupBrief(matchedStartup),
      suggestions: [`What are the risks of ${matchedStartup.companyName}?`, '📊 Portfolio Summary'],
    };
  }

  // 5. TOP OPPORTUNITY
  if (q.includes('top') || q.includes('best') || q.includes('highest') || q.includes('leader')) {
    const scored = [...startups]
      .filter(s => (s.scorecard?.overallInvestmentScore || 0) > 0)
      .sort((a, b) => (b.scorecard?.overallInvestmentScore || 0) - (a.scorecard?.overallInvestmentScore || 0));

    if (scored.length === 0) {
      return { reply: 'No scored startups found yet. Rate deals in the Evaluation Studio to see rankings!' };
    }

    const top = scored[0];
    const second = scored[1];

    let msg = `🏆 **Top Deal: ${top.companyName} (${top.scorecard?.overallInvestmentScore?.toFixed(1)}/10)**\n\n`;
    msg += `- **Sector**: \`${top.industry}\` • ${top.stage}\n`;
    msg += `- **Founder**: **${top.founder?.name}** (${top.founder?.background})\n`;
    msg += `- **Thesis**: *"${top.analysis?.investmentThesis || top.decision?.comment}"*\n`;
    msg += `- **Status**: 🟢 **\`${top.decision?.status || 'INVEST'}\`**\n\n`;
    if (second) {
      msg += `🥈 **Runner-up**: **${second.companyName}** (${second.scorecard?.overallInvestmentScore?.toFixed(1)}/10)\n\n`;
    }
    msg += `👉 [Open Diligence Studio →](/evaluation?id=${top._id})`;

    return { reply: msg, suggestions: ['🛡️ Risk Alerts', '📊 Portfolio Summary', '⚡ Founder Rankings'] };
  }

  // 6. DECISION FILTER (INVEST, WATCHLIST, REJECT)
  if (q.includes('invest') || q.includes('watchlist') || q.includes('reject')) {
    let target = 'INVEST';
    if (q.includes('watchlist')) target = 'WATCHLIST';
    if (q.includes('reject')) target = 'REJECT';

    const filtered = startups.filter(s => s.decision?.status === target);
    if (filtered.length === 0) {
      return { reply: `No deals currently marked as **\`${target}\`**.` };
    }

    let msg = `📋 **Startups Marked \`${target}\` (${filtered.length}):**\n\n`;
    filtered.forEach((s, i) => {
      const score = s.scorecard?.overallInvestmentScore ? `${s.scorecard.overallInvestmentScore.toFixed(1)}/10` : '—';
      msg += `${i + 1}. **${s.companyName}** (${s.industry}) — **${score}** | [Open →](/evaluation?id=${s._id})\n`;
    });

    return { reply: msg, suggestions: ['🏆 Top Deal', '📊 Portfolio Summary'] };
  }

  // 7. RISK RADAR
  if (q.includes('risk') || q.includes('alert') || q.includes('flag')) {
    const flagged = startups.filter(s => (s.analysis?.riskScore || 0) >= 7 || s.decision?.status === 'REJECT');
    const secure = startups.filter(s => (s.analysis?.riskScore || 0) <= 3 && s.decision?.status === 'INVEST');

    let msg = `🛡️ **Portfolio Risk Summary:**\n\n`;
    if (flagged.length > 0) {
      msg += `⚠️ **High Risk Deals:**\n`;
      flagged.forEach(s => {
        msg += `- **${s.companyName}**: ${s.analysis?.keyRisks || 'Elevated risk profile'}\n`;
      });
      msg += `\n`;
    }
    if (secure.length > 0) {
      msg += `✅ **Low Risk Leaders:**\n`;
      secure.forEach(s => {
        msg += `- **${s.companyName}** (Risk: ${s.analysis?.riskScore || 2}/10)\n`;
      });
    }

    return { reply: msg, suggestions: ['🏆 Top Deal', '📊 Portfolio Summary'] };
  }

  // 8. FOUNDER RANKINGS
  if (q.includes('founder') || q.includes('team') || q.includes('talent')) {
    const sorted = [...startups]
      .filter(s => (s.evaluation?.overallScore || 0) > 0)
      .sort((a, b) => (b.evaluation?.overallScore || 0) - (a.evaluation?.overallScore || 0));

    let msg = `👤 **Top Founder Scores:**\n\n`;
    sorted.slice(0, 4).forEach((s, i) => {
      msg += `${i + 1}. **${s.founder?.name}** (${s.companyName}) — **${s.evaluation?.overallScore?.toFixed(1)}/10**\n   *${s.founder?.background}*\n`;
    });

    return { reply: msg, suggestions: ['🏆 Top Deal', '📊 Portfolio Summary'] };
  }

  // 9. PORTFOLIO SUMMARY
  if (q.includes('portfolio') || q.includes('summary') || q.includes('stats') || q.includes('overview')) {
    const total = startups.length;
    const invested = startups.filter(s => s.decision?.status === 'INVEST').length;
    const watchlist = startups.filter(s => s.decision?.status === 'WATCHLIST').length;
    const rejected = startups.filter(s => s.decision?.status === 'REJECT').length;
    const scored = startups.filter(s => s.scorecard?.overallInvestmentScore > 0);
    const avg = scored.length > 0
      ? (scored.reduce((acc, s) => acc + s.scorecard.overallInvestmentScore, 0) / scored.length).toFixed(1)
      : '0.0';

    return {
      reply: `📊 **Portfolio Overview:**\n\n- **Total Startups**: **${total}**\n- **Invested**: **${invested}** | **Watchlist**: **${watchlist}** | **Rejected**: **${rejected}**\n- **Average Score**: **${avg} / 10**\n\n👉 [Open Full Dashboard →](/)`,
      suggestions: ['🏆 Top Deal', '🛡️ Risk Alerts', '⚡ Founder Rankings'],
    };
  }

  // 10. DEFAULT
  return {
    reply: `I analyzed your portfolio of **${startups.length} startups**. Try asking:\n- *"What is our top investment opportunity?"*\n- *"Compare Aura Security vs TracePay"*\n- *"Show all high risk alerts"*`,
    suggestions: ['🏆 Top Deal', '🛡️ Risk Alerts', '📊 Portfolio Summary'],
  };
}

const handleChatQuery = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message query is required' });
    }

    const startups = await Startup.find({}).lean();
    const result = processInAppQuery(message, startups);

    res.status(200).json({
      success: true,
      reply: result.reply,
      suggestions: result.suggestions || ['🏆 Top Deal', '🛡️ Risk Alerts', '📊 Portfolio Summary'],
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleChatQuery,
};
