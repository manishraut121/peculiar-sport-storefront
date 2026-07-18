import { listCategories } from "@lib/data/categories"
import BrandMark from "@modules/common/components/brand-mark"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const productCategories = await listCategories().catch(() => [])
  const topCategories = (productCategories || []).filter(
    (c: any) => !c.parent_category
  )

  return (
    <footer className="oc-dark w-full border-t border-ui-border-base">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-12 small:flex-row items-start justify-between pt-16 small:pt-20 pb-14">
          <div className="max-w-sm flex flex-col gap-4">
            <BrandMark size="lg" light />
            <p className="text-ui-fg-muted text-sm leading-relaxed m-0">
              Precision cricket equipment. English Willow graded and pressed for
              the perfect pickup curve. Handcrafted in India.
            </p>
            <p className="text-boundary text-xs uppercase tracking-[0.2em] m-0">
              The perfect curve.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 md:gap-x-16 text-sm">
            {topCategories.length > 0 && (
              <div className="flex flex-col gap-y-3">
                <span className="text-[11px] uppercase tracking-[0.22em] text-boundary font-medium">
                  Shop
                </span>
                <ul
                  className="flex flex-col gap-y-2 list-none m-0 p-0"
                  data-testid="footer-categories"
                >
                  {topCategories.slice(0, 6).map((c: any) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="text-ui-fg-subtle hover:text-boundary transition-colors"
                        href={`/categories/${c.handle}`}
                        data-testid="category-link"
                      >
                        {c.name}
                      </LocalizedClientLink>
                    </li>
                  ))}
                  <li>
                    <LocalizedClientLink
                      className="text-ui-fg-subtle hover:text-boundary transition-colors"
                      href="/store"
                    >
                      All products
                    </LocalizedClientLink>
                  </li>
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-y-3">
              <span className="text-[11px] uppercase tracking-[0.22em] text-boundary font-medium">
                Account
              </span>
              <ul className="flex flex-col gap-y-2 list-none m-0 p-0">
                <li>
                  <LocalizedClientLink
                    href="/account"
                    className="text-ui-fg-subtle hover:text-boundary transition-colors"
                  >
                    My account
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/cart"
                    className="text-ui-fg-subtle hover:text-boundary transition-colors"
                  >
                    Cart
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-y-3">
              <span className="text-[11px] uppercase tracking-[0.22em] text-boundary font-medium">
                Help
              </span>
              <ul className="flex flex-col gap-y-2 list-none m-0 p-0">
                <li>
                  <LocalizedClientLink
                    href="/legal/shipping-returns"
                    className="text-ui-fg-subtle hover:text-boundary transition-colors"
                    data-testid="footer-shipping-returns"
                  >
                    Shipping &amp; returns
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/legal/privacy"
                    className="text-ui-fg-subtle hover:text-boundary transition-colors"
                    data-testid="footer-privacy"
                  >
                    Privacy
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/legal/terms"
                    className="text-ui-fg-subtle hover:text-boundary transition-colors"
                    data-testid="footer-terms"
                  >
                    Terms
                  </LocalizedClientLink>
                </li>
                <li>
                  <a
                    href="mailto:support@onecurve.in"
                    className="text-ui-fg-subtle hover:text-boundary transition-colors"
                    data-testid="footer-contact"
                  >
                    support@onecurve.in
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col small:flex-row gap-2 w-full py-8 justify-between border-t border-ui-border-base text-ui-fg-muted text-xs">
          <span>
            © {new Date().getFullYear()} OneCurve Sports. All rights reserved.
          </span>
          <span className="uppercase tracking-[0.15em]">
            Made in India <span className="text-boundary">●</span> onecurve.in
          </span>
        </div>
      </div>
    </footer>
  )
}
