"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import loginDesign from "../../page.module.css";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to sign in.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={loginDesign.page}>
      <div className={loginDesign.gridBackground} aria-hidden="true" />
      <div className={loginDesign.scanline} aria-hidden="true" />

      <div
        className={`${loginDesign.orb} ${loginDesign.orbOne}`}
        aria-hidden="true"
      />
      <div
        className={`${loginDesign.orb} ${loginDesign.orbTwo}`}
        aria-hidden="true"
      />

      <div className={loginDesign.layout}>
        <section className={loginDesign.hero}>
          <div className={loginDesign.brand}>
            <div className={loginDesign.brandIcon}>IT</div>
            <div>
              <strong>
                SUPPORT<span>DESK</span>
              </strong>
              <small>ADMINISTRATOR PORTAL</small>
            </div>
          </div>

          <div className={loginDesign.status}>
            <span className={loginDesign.statusDot} />
            SECURE ADMINISTRATOR ACCESS
          </div>

          <h1>
            Manage IT,
            <br />
            <span>solve problems.</span>
          </h1>

          <p className={loginDesign.description}>
            Access the support dashboard to manage tickets, monitor technical
            issues, assign requests, and help your team keep operations running
            smoothly.
          </p>

          <div className={loginDesign.machine} aria-hidden="true">
            <div className={loginDesign.machineRing} />
            <div className={loginDesign.machineRingInner} />

            <div className={loginDesign.machineCore}>
              <div className={loginDesign.corePulse} />
              <span>IT</span>
              <small>ADMIN CORE</small>
            </div>

            <span className={`${loginDesign.gear} ${loginDesign.gearLarge}`}>
              ⚙
            </span>
            <span className={`${loginDesign.gear} ${loginDesign.gearSmall}`}>
              ⚙
            </span>
            <span className={`${loginDesign.gear} ${loginDesign.gearBottom}`}>
              ⚙
            </span>

            <div
              className={`${loginDesign.circuit} ${loginDesign.circuitOne}`}
            />
            <div
              className={`${loginDesign.circuit} ${loginDesign.circuitTwo}`}
            />
            <div
              className={`${loginDesign.circuit} ${loginDesign.circuitThree}`}
            />

            <span
              className={`${loginDesign.particle} ${loginDesign.particleOne}`}
            />
            <span
              className={`${loginDesign.particle} ${loginDesign.particleTwo}`}
            />
            <span
              className={`${loginDesign.particle} ${loginDesign.particleThree}`}
            />
          </div>

          <div className={loginDesign.features}>
            <div>
              <span className={loginDesign.featureIcon}>●</span>
              Manage support tickets
            </div>
            <div>
              <span className={loginDesign.featureIcon}>●</span>
              Assign technical requests
            </div>
            <div>
              <span className={loginDesign.featureIcon}>●</span>
              Track issue resolution
            </div>
          </div>
        </section>

        <section className={loginDesign.loginPanel}>
          <button
            type="button"
            onClick={() => router.push("/")}
            className={loginDesign.backButton}
          >
            <span aria-hidden="true">←</span>
            Back to account selection
          </button>

          <div className={loginDesign.panelTop}>
            ADMINISTRATOR ACCOUNT
            <span className={loginDesign.panelLine} />
          </div>

          <h2 className={loginDesign.authHeading}>Welcome back.</h2>

          <p className={loginDesign.authIntro}>
            Sign in with your administrator credentials to access the IT support
            dashboard.
          </p>

          <form onSubmit={handleSubmit} className={loginDesign.authForm}>
            <label htmlFor="admin-username" className={loginDesign.authLabel}>
              Username
              <input
                id="admin-username"
                type="text"
                autoComplete="username"
                className={loginDesign.authInput}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your admin username"
                required
              />
            </label>

            <label htmlFor="admin-password" className={loginDesign.authLabel}>
              Password
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                className={loginDesign.authInput}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </label>

            {error && (
              <p role="alert" className={loginDesign.authMessage}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={loginDesign.authSubmit}
            >
              {loading ? "Signing in..." : "Sign In as Admin  →"}
            </button>
          </form>

          <div className={loginDesign.authSecurity}>
            <span className={loginDesign.authSecurityIcon}>⌑</span>
            <span>
              <strong>Protected administrator access</strong>
              <br />
              Sign in with your authorized credentials to manage support
              operations.
            </span>
          </div>

          <p className={loginDesign.footer}>
            IT SUPPORTDESK
            <br />
            <span>ADMIN ACCESS · IT SERVICE MANAGEMENT</span>
          </p>
        </section>
      </div>

      <div className={loginDesign.bottomBar}>
        <span>IT SUPPORTDESK</span>
        <span>ADMINISTRATOR PORTAL · SECURE ACCESS</span>
      </div>
    </main>
  );
}
