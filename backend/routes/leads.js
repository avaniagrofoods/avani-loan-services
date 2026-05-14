// Backend API Routes for VAPI Integration
// File: backend/routes/leads.js

const express = require('express');
const router = express.Router();

// Mock Twilio & Google Sheets setup (in production, configure these properly)
const mockLeadsDatabase = [];

// POST: Save lead data from form submission
router.post('/save-lead', async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      loanType,
      amount,
      city,
      callId,
      timestamp,
      aiCallInitiated
    } = req.body;

    const leadData = {
      id: Date.now(),
      name,
      phone,
      email,
      loanType,
      amount,
      city: city || 'Latur',
      callId: callId || null,
      timestamp: timestamp || new Date().toISOString(),
      aiCallInitiated: aiCallInitiated || false,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    // In production: Save to Google Sheets or database
    mockLeadsDatabase.push(leadData);

    // Log for debugging
    console.log('Lead saved:', leadData);

    res.json({
      success: true,
      message: 'Lead saved successfully',
      leadId: leadData.id
    });
  } catch (error) {
    console.error('Error saving lead:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST: Send WhatsApp message
router.post('/send-whatsapp', async (req, res) => {
  try {
    const { phoneNumber, message, loanType } = req.body;

    // In production: Use Twilio WhatsApp API or WhatsApp Business API
    console.log('WhatsApp Message:', {
      to: phoneNumber,
      message,
      loanType,
      timestamp: new Date().toISOString()
    });

    // Mock send (in production, integrate with Twilio)
    res.json({
      success: true,
      messageSid: `msg_${Date.now()}`,
      message: 'WhatsApp message queued for sending'
    });
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST: Send SMS reminder
router.post('/send-sms', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    console.log('SMS Message:', {
      to: phoneNumber,
      message,
      timestamp: new Date().toISOString()
    });

    // Mock send (in production, integrate with Twilio)
    res.json({
      success: true,
      messageSid: `sms_${Date.now()}`,
      message: 'SMS queued for sending'
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST: Handle VAPI webhook callbacks
router.post('/webhooks/vapi-callback', async (req, res) => {
  try {
    const webhookData = req.body;

    console.log('VAPI Webhook Received:', {
      callId: webhookData.callId,
      callStatus: webhookData.callStatus,
      phoneNumber: webhookData.customerNumber,
      duration: webhookData.duration
    });

    // Extract and process call data
    const callData = {
      callId: webhookData.callId,
      phoneNumber: webhookData.customerNumber,
      status: webhookData.callStatus,
      duration: webhookData.duration,
      transcript: webhookData.transcript || null,
      recordingUrl: webhookData.recordingUrl || null,
      analysis: webhookData.analysis || {},
      timestamp: new Date().toISOString()
    };

    // Save call data to database/sheets
    // Process lead qualification based on analysis
    // Trigger follow-up workflows

    res.json({
      success: true,
      message: 'Webhook processed successfully',
      callData
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST: Schedule appointment
router.post('/schedule-appointment', async (req, res) => {
  try {
    const {
      leadName,
      phoneNumber,
      loanType,
      appointmentDate,
      appointmentTime,
      notes
    } = req.body;

    const appointmentData = {
      id: `apt_${Date.now()}`,
      leadName,
      phoneNumber,
      loanType,
      appointmentDate,
      appointmentTime,
      notes,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    // Send SMS reminder
    const reminderMessage = `Hi ${leadName}! Your appointment for ${loanType} is scheduled on ${appointmentDate} at ${appointmentTime}. We look forward to meeting you. Call: +91 7249108474`;

    console.log('Appointment Scheduled:', appointmentData);
    console.log('Sending reminder SMS:', reminderMessage);

    // In production: Send actual SMS via Twilio
    res.json({
      success: true,
      message: 'Appointment scheduled and reminder sent',
      appointmentId: appointmentData.id
    });
  } catch (error) {
    console.error('Appointment scheduling error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET: Retrieve all leads
router.get('/all-leads', (req, res) => {
  try {
    res.json({
      success: true,
      leads: mockLeadsDatabase,
      total: mockLeadsDatabase.length
    });
  } catch (error) {
    console.error('Error retrieving leads:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET: Get lead by ID
router.get('/lead/:id', (req, res) => {
  try {
    const lead = mockLeadsDatabase.find(l => l.id === parseInt(req.params.id));

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.json({
      success: true,
      lead
    });
  } catch (error) {
    console.error('Error retrieving lead:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST: Bulk import leads from CSV
router.post('/bulk-import', async (req, res) => {
  try {
    const { leads } = req.body; // Array of lead objects

    if (!Array.isArray(leads)) {
      return res.status(400).json({
        success: false,
        error: 'Leads must be an array'
      });
    }

    const importedLeads = leads.map((lead, index) => ({
      id: Date.now() + index,
      ...lead,
      status: 'imported',
      createdAt: new Date().toISOString()
    }));

    mockLeadsDatabase.push(...importedLeads);

    console.log(`Bulk imported ${importedLeads.length} leads`);

    res.json({
      success: true,
      message: `${importedLeads.length} leads imported successfully`,
      importedCount: importedLeads.length
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST: Send bulk WhatsApp to leads
router.post('/send-bulk-whatsapp', async (req, res) => {
  try {
    const { leadIds, message } = req.body;

    if (!Array.isArray(leadIds)) {
      return res.status(400).json({
        success: false,
        error: 'leadIds must be an array'
      });
    }

    const leadsToMessage = mockLeadsDatabase.filter(l => leadIds.includes(l.id));

    console.log(`Sending WhatsApp to ${leadsToMessage.length} leads`);

    res.json({
      success: true,
      message: `WhatsApp queued for ${leadsToMessage.length} leads`,
      sentCount: leadsToMessage.length
    });
  } catch (error) {
    console.error('Bulk WhatsApp error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET: Get analytics/dashboard metrics
router.get('/analytics', (req, res) => {
  try {
    const analytics = {
      totalLeads: mockLeadsDatabase.length,
      activeLeads: mockLeadsDatabase.filter(l => l.status === 'active').length,
      aiCallsInitiated: mockLeadsDatabase.filter(l => l.aiCallInitiated).length,
      loanTypeBreakdown: mockLeadsDatabase.reduce((acc, lead) => {
        acc[lead.loanType] = (acc[lead.loanType] || 0) + 1;
        return acc;
      }, {}),
      cityBreakdown: mockLeadsDatabase.reduce((acc, lead) => {
        acc[lead.city] = (acc[lead.city] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
