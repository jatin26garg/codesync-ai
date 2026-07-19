import { Resend } from "resend";

const resend = new Resend('re_VA9nmKjQ_PQGdoTERpJpNqc6t7CmL21KK');

export async function sendInvitationEmail(
    email: string, projectName: string, token: string,owner :string) {

    const invitelink = `http://localhost:3000/invite/accept/token=${token}`;

    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: `You're invited to join "${projectName}" on collaborative Code Editor Project`,
        html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1e1e1e; color: #d4d4d4; border-radius: 10px;">
            <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #333;">
                <h1 style="color: #4fc3f7; margin: 0;">🚀 CodeSync AI</h1>
                <p style="color: #888; margin: 5px 0;">Collaborative Coding Platform</p>
            </div>

            <div style="padding: 30px 0;">
                <h2 style="color: #fff; margin-top: 0;">Project Invitation</h2>
                <p style="color: #d4d4d4; font-size: 16px; line-height: 1.6;">
                    <strong style="color: #4fc3f7;">${owner}</strong> has invited you to join the project:
                </p>
                
                <div style="background: #2d2d2d; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4fc3f7;">
                    <h3 style="color: #fff; margin: 0;">📁 ${projectName}</h3>
                </div>

                <p style="color: #d4d4d4; font-size: 16px; line-height: 1.6;">
                    Click the button below to accept the invitation and start collaborating:
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${invitelink}" 
                       style="display: inline-block; padding: 14px 40px; background: #4fc3f7; color: #1e1e1e; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; transition: background 0.3s;">
                        Accept Invitation 🚀
                    </a>
                </div>

                <p style="color: #888; font-size: 14px; margin-top: 20px;">
                    This invitation will expire in <strong style="color: #d4d4d4;">7 days</strong>.
                    If you don't have a CodeSync AI account, you'll be prompted to create one.
                </p>

                <p style="color: #888; font-size: 14px; margin-top: 30px;">
                    If you didn't expect this invitation, you can ignore this email.
                </p>
            </div>

            <div style="border-top: 1px solid #333; padding: 15px 0; text-align: center; color: #666; font-size: 12px;">
                <p>© ${new Date().getFullYear()} CodeSync AI. All rights reserved.</p>
            </div>
        </div>`
    })
}