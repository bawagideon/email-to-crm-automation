// Email to CRM Automation Engine
class EmailToCrmEngine {
  constructor() {}

  parseEmail(rawText, fromHeader = '') {
    const emailMatch = fromHeader.match(/<([^>]+)>/) || [null, fromHeader.trim()];
    const senderEmail = emailMatch[1] || '';

    // Extract Name
    let senderName = '';
    const nameMatch = fromHeader.match(/^"?([^"<]+)"?s*</);
    if (nameMatch) {
      senderName = nameMatch[1].trim();
    } else {
      senderName = senderEmail.split('@')[0].replace(/[._]/g, ' ');
    }

    // Extract Budget
    let estimatedBudget = null;
    const budgetMatch = rawText.match(/\$(\d[\d,]*(\.\d+)?)/);
    if (budgetMatch) {
      estimatedBudget = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
    }

    // Extract Urgency
    let urgency = 'NORMAL';
    if (/(urgent|asap|immediately|critical|deadline)/i.test(rawText)) {
      urgency = 'HIGH';
    }

    // Extract Phone
    const phoneMatch = rawText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0].trim() : null;

    // Classify Intent
    let intent = 'GENERAL_INQUIRY';
    if (/(quote|pricing|proposal|contract|how much)/i.test(rawText)) {
      intent = 'REQUEST_QUOTE';
    } else if (/(demo|meeting|calendar|schedule|call)/i.test(rawText)) {
      intent = 'SCHEDULE_DEMO';
    }

    const domain = senderEmail.split('@')[1] || '';
    const company = domain && !/(gmail|yahoo|hotmail|outlook)/i.test(domain) 
      ? domain.split('.')[0].toUpperCase() 
      : 'Private Individual';

    return {
      senderName,
      senderEmail,
      company,
      phone,
      estimatedBudget,
      urgency,
      intent,
      crmPayload: {
        firstname: senderName.split(' ')[0],
        lastname: senderName.split(' ').slice(1).join(' ') || 'Prospect',
        email: senderEmail,
        company,
        phone,
        deal_value: estimatedBudget || 2500,
        lead_status: 'NEW_UNTOUCHED',
        priority: urgency
      },
      suggestedReply: this.generateReplyDraft(senderName, intent, estimatedBudget)
    };
  }

  generateReplyDraft(name, intent, budget) {
    if (intent === 'REQUEST_QUOTE') {
      return `Hi ${name},\n\nThank you for reaching out! We received your quote request${budget ? ' for $' + budget.toLocaleString() : ''}. I've prepared our standard solution overview. When is a good time for a 10-minute discovery call?\n\nBest regards,\nGideon Bawa`;
    }
    return `Hi ${name},\n\nThanks for your note. Let's schedule a brief walkthrough this week to inspect your requirements.\n\nBest regards,\nGideon Bawa`;
  }
}

module.exports = { EmailToCrmEngine };
