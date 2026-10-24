"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";


export default function HomePage() {
  const router = useRouter();

  return (
    <main className={styles.page}>
      <div className={styles.gridBackground} />
      <div className={styles.scanline} />

      <div className={`${styles.orb} ${styles.orbOne}`} />
      <div className={`${styles.orb} ${styles.orbTwo}`} />

      <div className={styles.layout}>
        <section className={styles.hero}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>IT</div>
            <div>
              <strong>
                SUPPORT<span>DESK</span>
              </strong>
              <small>IT SERVICE MANAGEMENT</small>
            </div>
          </div>

          <div className={styles.status}>
            <span className={styles.statusDot} />
            SYSTEM ONLINE
          </div>

          <h1>
            Technology that
            <br />
            <span>keeps you moving.</span>
          </h1>

          <p className={styles.description}>
            Your central hub for technical support, incident reporting, and
            service management.
          </p>

          <div className={styles.machine}>
            <div className={styles.machineRing} />
            <div className={styles.machineRingInner} />

            <div className={`${styles.gear} ${styles.gearLarge}`}>⚙</div>
            <div className={`${styles.gear} ${styles.gearSmall}`}>⚙</div>
            <div className={`${styles.gear} ${styles.gearBottom}`}>⚙</div>

            <div className={styles.machineCore}>
              <div className={styles.corePulse} />
              <span>IT</span>
              <small>CORE SYSTEM</small>
            </div>

            <div className={`${styles.circuit} ${styles.circuitOne}`} />
            <div className={`${styles.circuit} ${styles.circuitTwo}`} />
            <div className={`${styles.circuit} ${styles.circuitThree}`} />

            <div className={`${styles.particle} ${styles.particleOne}`} />
            <div className={`${styles.particle} ${styles.particleTwo}`} />
            <div className={`${styles.particle} ${styles.particleThree}`} />
          </div>

          <div className={styles.features}>
            <div>
              <span className={styles.featureIcon}>01</span>
              <span>Incident Management</span>
            </div>
            <div>
              <span className={styles.featureIcon}>02</span>
              <span>Real-Time Ticket Tracking</span>
            </div>
            <div>
              <span className={styles.featureIcon}>03</span>
              <span>Technical Support</span>
            </div>
          </div>
        </section>

        <section className={styles.loginPanel}>
          <div className={styles.panelTop}>
            <span>WELCOME BACK</span>
            <span className={styles.panelLine} />
          </div>

          <h2>Access your workspace.</h2>
          <p className={styles.panelDescription}>
            Select your account type to continue to the portal.
          </p>

          <button
            type="button"
            onClick={() => router.push("/admin/login")}
            className={styles.adminButton}
          >
            <span className={styles.buttonIcon}>⌘</span>
            <span className={styles.buttonText}>
              <strong>Continue as Admin</strong>
              <small>Manage tickets and support operations</small>
            </span>
            <span className={styles.arrow}>↗</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/client")}
            className={styles.userButton}
          >
            <span className={styles.userIcon}>◎</span>
            <span className={styles.buttonText}>
              <strong>Continue as User</strong>
              <small>Submit tickets and track your requests</small>
            </span>
            <span className={styles.arrow}>↗</span>
          </button>

          <div className={styles.divider}>
            <span />
            SECURE ACCESS
            <span />
          </div>

          <div className={styles.security}>
            <span className={styles.lock}>♧</span>
            <p>
              Protected workspace
              <small>Your account type determines your access.</small>
            </p>
            <span className={styles.secureDot} />
          </div>

          <p className={styles.footer}>
            IT SUPPORT TICKET MANAGEMENT SYSTEM
            <br />
            <span>DESIGNED FOR RELIABLE SUPPORT OPERATIONS</span>
          </p>
        </section>
      </div>

      <div className={styles.bottomBar}>
        <span>SUPPORTDESK / PORTAL v1.0</span>
        <span>ENGINEERED FOR EFFICIENCY</span>
      </div>
    </main>
  );
}
