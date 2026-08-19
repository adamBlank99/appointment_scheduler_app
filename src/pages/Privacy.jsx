import { ArrowLeft, Database, ShieldCheck, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"

function Privacy() {
  return (
    <main className="privacy-page">
      <div className="privacy-shell">
        <article className="privacy-card">
          <Link className="back-link" to="/login"><ArrowLeft size={17} />Back to sign in</Link>
          <p className="eyebrow eyebrow-dark">Privacy & acceptable use</p>
          <h1>Your data should stay understandable.</h1>
          <p className="privacy-updated">Last updated August 19, 2026</p>

          <section>
            <h2><Database size={20} />What the application stores</h2>
            <p>Account mode stores your email address, authentication records, any legacy profile metadata already associated with your account, and the appointment names, dates, times, priorities, and notes you choose to enter. Supabase provides authentication and database hosting; Vercel serves the website. Authentication and hosting providers may process operational information such as IP addresses and request logs.</p>
          </section>

          <section>
            <h2><ShieldCheck size={20} />How it is used</h2>
            <p>Information is used only to authenticate your account, provide your private appointment workspace, prevent abuse, and operate this portfolio demonstration. It is not sold or used for advertising.</p>
            <p>Do not enter passwords, payment information, health information, government identifiers, or other sensitive personal data. This portfolio project is not intended for confidential or regulated scheduling.</p>
          </section>

          <section>
            <h2>Guest Demo</h2>
            <p>Guest appointments stay in the current browser tab using session storage. They are not sent to Supabase and disappear when the tab’s session data is cleared.</p>
          </section>

          <section>
            <h2><Trash2 size={20} />Retention and deletion</h2>
            <p>Appointment records remain until you delete them or delete your account. Signed-in users can request permanent account deletion from the application navigation. Short-lived abuse-prevention records may be retained for up to ten minutes.</p>
          </section>

          <section>
            <h2>Acceptable use</h2>
            <p>Do not automate account creation, send abusive authentication requests, probe other users’ data, upload unlawful content, or attempt to disrupt the service. Access may be restricted when activity threatens the application or its providers.</p>
          </section>

          <section>
            <h2>Questions</h2>
            <p>For security or privacy questions, contact the project owner through the <a href="https://github.com/adamBlank99/appointment_scheduler_app" rel="noreferrer">GitHub repository</a>. Do not include private appointment content in a public GitHub issue.</p>
          </section>
        </article>
      </div>
    </main>
  )
}

export default Privacy
