export function EnvVarWarning() {
  const missingVars: string[] = [];

  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    missingVars.push("NEXT_PUBLIC_CONVEX_URL");
  }

  if (missingVars.length === 0) return null;

  return (
    <div className="bg-warning/10 border border-warning/30 rounded-md p-4 text-sm text-warning">
      <p className="font-semibold mb-1">Missing environment variables:</p>
      <ul className="list-disc list-inside">
        {missingVars.map((v) => (
          <li key={v}>{v}</li>
        ))}
      </ul>
    </div>
  );
}
