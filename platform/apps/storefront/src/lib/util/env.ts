export const getBaseURL = () => {
  // Public site URL used for canonical tags, sitemap, OG, JSON-LD.
  // Codespaces/preview/prod set NEXT_PUBLIC_BASE_URL; falls back to the
  // production domain so SEO output is always absolute and correct.
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.CODESPACE_NAME
      ? `https://${process.env.CODESPACE_NAME}-8000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || "app.github.dev"}`
      : "https://onecurve.in")
  )
}

// Default storefront region/country prefix (India / INR).
export const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "in"
