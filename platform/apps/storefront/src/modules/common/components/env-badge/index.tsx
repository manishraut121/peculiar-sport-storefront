import { getOcEnv, showEnvBadge } from "@lib/flags"

/**
 * Visible only on dev/stage so staff never confuse stage with live shop.
 * Hidden automatically when OC_ENV=prod (flags.ops.show_env_badge=false).
 */
export default function EnvBadge() {
  if (!showEnvBadge()) return null
  const env = getOcEnv()
  const label = env.toUpperCase()
  const color =
    env === "stage"
      ? "bg-amber-500 text-black"
      : "bg-sky-500 text-white"

  return (
    <div
      className={`fixed bottom-3 left-3 z-[100] rounded px-2 py-1 text-[10px] font-bold tracking-widest shadow-lg ${color}`}
      data-testid="env-badge"
      data-oc-env={env}
      aria-label={`Environment: ${label}`}
    >
      {label}
    </div>
  )
}
