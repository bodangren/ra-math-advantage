import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function UnauthorizedPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell">
        <div className="narrow card">
          <p className="eyebrow">Access decision</p>
          <h1>Access not available</h1>
          <p>Your current account does not have permission for this page.</p>
          <Link className="button" href="/">
            Return to overview
          </Link>
        </div>
      </main>
    </>
  );
}
