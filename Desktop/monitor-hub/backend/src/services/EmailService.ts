import { Resend } from 'resend';

const getResend = () => new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  static async sendDownAlert(to: string, checkName: string, checkUrl: string, responseTime?: number) {
    try {
      await getResend().emails.send({
        from: process.env.ALERT_FROM_EMAIL || 'onboarding@resend.dev',
        to,
        subject: `[MonitorHub] ${checkName} is DOWN`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
            <div style="margin-bottom: 24px;">
              <span style="font-size: 15px; font-weight: 600; color: #185FA5;">MonitorHub</span>
            </div>
            <div style="background: #FCEBEB; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
              <div style="font-size: 13px; font-weight: 600; color: #791F1F; margin-bottom: 4px;">Monitor is down</div>
              <div style="font-size: 13px; color: #A32D2D;">${checkName} is not responding</div>
            </div>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #999; width: 120px;">Monitor</td>
                <td style="padding: 8px 0; color: #0c0c0c; font-weight: 500;">${checkName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #999;">URL</td>
                <td style="padding: 8px 0; color: #185FA5;">${checkUrl}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #999;">Status</td>
                <td style="padding: 8px 0; color: #A32D2D; font-weight: 500;">Down</td>
              </tr>
              ${responseTime ? `<tr><td style="padding: 8px 0; color: #999;">Response</td><td style="padding: 8px 0; color: #0c0c0c;">${responseTime}ms</td></tr>` : ''}
              <tr>
                <td style="padding: 8px 0; color: #999;">Time</td>
                <td style="padding: 8px 0; color: #0c0c0c;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
            <div style="margin-top: 24px; padding-top: 24px; border-top: 0.5px solid #e5e5e3; font-size: 12px; color: #999;">
              This alert was sent by MonitorHub. You are receiving this because you configured email alerts.
            </div>
          </div>
        `,
      });
      console.log('Alert email sent to ' + to);
    } catch (error) {
      console.error('Failed to send alert email:', error);
    }
  }

  static async sendRecoveryAlert(to: string, checkName: string, checkUrl: string, responseTime?: number) {
    try {
      await getResend().emails.send({
        from: process.env.ALERT_FROM_EMAIL || 'onboarding@resend.dev',
        to,
        subject: `[MonitorHub] ${checkName} recovered`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
            <div style="margin-bottom: 24px;">
              <span style="font-size: 15px; font-weight: 600; color: #185FA5;">MonitorHub</span>
            </div>
            <div style="background: #EAF3DE; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
              <div style="font-size: 13px; font-weight: 600; color: #27500A; margin-bottom: 4px;">Monitor recovered</div>
              <div style="font-size: 13px; color: #3B6D11;">${checkName} is back online</div>
            </div>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #999; width: 120px;">Monitor</td>
                <td style="padding: 8px 0; color: #0c0c0c; font-weight: 500;">${checkName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #999;">URL</td>
                <td style="padding: 8px 0; color: #185FA5;">${checkUrl}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #999;">Status</td>
                <td style="padding: 8px 0; color: #3B6D11; font-weight: 500;">Operational</td>
              </tr>
              ${responseTime ? `<tr><td style="padding: 8px 0; color: #999;">Response</td><td style="padding: 8px 0; color: #0c0c0c;">${responseTime}ms</td></tr>` : ''}
              <tr>
                <td style="padding: 8px 0; color: #999;">Time</td>
                <td style="padding: 8px 0; color: #0c0c0c;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
            <div style="margin-top: 24px; padding-top: 24px; border-top: 0.5px solid #e5e5e3; font-size: 12px; color: #999;">
              This alert was sent by MonitorHub.
            </div>
          </div>
        `,
      });
      console.log('Recovery email sent to ' + to);
    } catch (error) {
      console.error('Failed to send recovery email:', error);
    }
  }
}