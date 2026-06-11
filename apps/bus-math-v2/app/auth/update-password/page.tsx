import { redirect } from "next/navigation";

/**
 * Redirects to the settings page for password updates.
 *
 * @returns Never returns — always redirects.
 */
export default function Page() {
  redirect("/settings");
}
