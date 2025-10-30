import sgMail from "@sendgrid/mail";

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

const FROM_EMAIL = process.env.EMAIL_FROM || "engit1406@gmail.com";

// Email templates
const emailTemplates = {
  weeklyReport: (user, data) => ({
    subject: `📊 Your Weekly GitHub Report - ${user.fullname}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0969da;">Your Weekly Progress Report</h2>
        <p>Hi ${user.fullname},</p>
        <p>Here's your GitHub activity summary for this week:</p>
        
        <div style="background: #f6f8fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>📈 Your Stats</h3>
          <p><strong>Current Score:</strong> ${data.score || "N/A"}</p>
          <p><strong>Rank:</strong> #${data.rank || "N/A"}</p>
          <p><strong>Commits This Week:</strong> ${data.weeklyCommits || 0}</p>
          <p><strong>Repositories:</strong> ${data.repoCount || 0}</p>
        </div>
        
        <p>Keep up the great work! 🚀</p>
        <p><a href="${process.env.CLIENT_URL}/stats/${user.githubUsername || user.fullname}" style="background: #0969da; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Full Stats</a></p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e1e4e8;">
        <p style="color: #6a737d; font-size: 12px;">You're receiving this because you enabled weekly reports in your <a href="${process.env.CLIENT_URL}/user-profile/${user._id}">email preferences</a>.</p>
      </div>
    `,
  }),

  scoreAlert: (user, data) => ({
    subject: `${data.change > 0 ? "🎉" : "📉"} Your en-git Score ${data.change > 0 ? "Increased" : "Decreased"}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${data.change > 0 ? "#3fb950" : "#d29922"};">Score Update Alert</h2>
        <p>Hi ${user.fullname},</p>
        <p>Your en-git score has ${data.change > 0 ? "increased" : "decreased"} by <strong>${Math.abs(data.change)} points</strong>!</p>
        
        <div style="background: #f6f8fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Previous Score:</strong> ${data.oldScore}</p>
          <p><strong>New Score:</strong> ${data.newScore}</p>
          <p><strong>Change:</strong> <span style="color: ${data.change > 0 ? "#3fb950" : "#d29922"};">${data.change > 0 ? "+" : ""}${data.change}</span></p>
        </div>
        
        <p><a href="${process.env.CLIENT_URL}/stats/${user.githubUsername || user.fullname}" style="background: #0969da; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Your Profile</a></p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e1e4e8;">
        <p style="color: #6a737d; font-size: 12px;">Manage your <a href="${process.env.CLIENT_URL}/user-profile/${user._id}">email preferences</a>.</p>
      </div>
    `,
  }),

  achievement: (user, data) => ({
    subject: `🏆 Achievement Unlocked: ${data.achievementName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #a855f7;">🏆 Achievement Unlocked!</h2>
        <p>Hi ${user.fullname},</p>
        <p>Congratulations! You've unlocked a new achievement:</p>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center; color: white;">
          <h1 style="font-size: 48px; margin: 0;">${data.achievementIcon || "🏆"}</h1>
          <h3 style="margin: 10px 0;">${data.achievementName}</h3>
          <p>${data.achievementDescription}</p>
        </div>
        
        <p>Keep pushing forward! 🚀</p>
        <p><a href="${process.env.CLIENT_URL}/user-profile/${user._id}" style="background: #a855f7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View All Achievements</a></p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e1e4e8;">
        <p style="color: #6a737d; font-size: 12px;">Manage your <a href="${process.env.CLIENT_URL}/user-profile/${user._id}">email preferences</a>.</p>
      </div>
    `,
  }),

  leaderboardUpdate: (user, data) => ({
    subject: `${data.rankChange > 0 ? "📈" : "📉"} Your Leaderboard Rank Changed!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0969da;">Leaderboard Update</h2>
        <p>Hi ${user.fullname},</p>
        <p>Your position on the en-git leaderboard has changed!</p>
        
        <div style="background: #f6f8fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Previous Rank:</strong> #${data.oldRank}</p>
          <p><strong>New Rank:</strong> #${data.newRank}</p>
          <p><strong>Change:</strong> <span style="color: ${data.rankChange > 0 ? "#3fb950" : "#d29922"};">${data.rankChange > 0 ? "↑" : "↓"} ${Math.abs(data.rankChange)} positions</span></p>
        </div>
        
        <p><a href="${process.env.CLIENT_URL}/leaderboard" style="background: #0969da; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Leaderboard</a></p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e1e4e8;">
        <p style="color: #6a737d; font-size: 12px;">Manage your <a href="${process.env.CLIENT_URL}/user-profile/${user._id}">email preferences</a>.</p>
      </div>
    `,
  }),
};

// Send email function
export async function sendEmail(to, type, user, data) {
  try {
    const template = emailTemplates[type](user, data);

    const msg = {
      to,
      from: {
        email: FROM_EMAIL,
        name: "en-git",
      },
      subject: template.subject,
      html: template.html,
    };

    const response = await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}`);
    return { success: true, messageId: response[0].headers["x-message-id"] };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Bulk send emails
export async function sendBulkEmails(recipients, type, data) {
  const results = await Promise.allSettled(
    recipients.map((recipient) => sendEmail(recipient.email, type, recipient, data))
  );

  const successful = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
  const failed = results.length - successful;

  console.log(`📧 Bulk email results: ${successful} sent, ${failed} failed`);
  return { successful, failed, total: results.length };
}
