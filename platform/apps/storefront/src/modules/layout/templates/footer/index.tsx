import { listCategories } from "@lib/data/categories"
import BrandMark from "@modules/common/components/brand-mark"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const productCategories = await listCategories().catch(() => [])
  const topCategories = (productCategories || []).filter(
    (c: any) => !c.parent_category
  )

  return (
    <footer className="oc-dark w-full border-t border-white/10">
      <div className="content-container flex flex-col w-full">
        <div className="grid grid-cols-1 small:grid-cols-12 gap-12 pt-16 small:pt-20 pb-14">
          <div className="small:col-span-5 flex flex-col gap-5 max-w-md">
            <BrandMark size="lg" light />
            <p className="text-white/55 text-base leading-relaxed m-0 font-medium">
              Performance equipment for India. Cricket live — training and
              nutrition next. Spec-honest. One inventory.
            </p>
            <p className="font-display font-bold text-signal text-lg m-0">
              Move with the curve.
            </p>
          </div>

          <div className="small:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10 text-sm">
            {topCategories.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-[11px] uppercase tracking-[0.2em] text-signal font-bold">
                  Shop
                </span>
                <ul
                  className="flex flex-col gap-2.5 list-none m-0 p-0"
                  data-testid="footer-categories"
                >
                  {topCategories.slice(0, 6).map((c: any) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="text-white/60 hover:text-white transition-colors font-medium"
                        href={`/categories/${c.handle}`}
                        data-testid="category-link"
                      >
                        {c.name}
                      </LocalizedClientLink>
                    </li>
                  ))}
                  <li>
                    <LocalizedClientLink
                      className="text-white/60 hover:text-white transition-colors font-medium"
                      href="/store"
                    >
                      All products
                    </LocalizedClientLink>
                  </li>
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <span className="text-[11px] uppercase tracking-[0.2em] text-signal font-bold">
                Account
              </span>
              <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
                <li>
                  <LocalizedClientLink
                    href="/account"
                    className="text-white/60 hover:text-white transition-colors font-medium"
                  >
                    My account
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/cart"
                    className="text-white/60 hover:text-white transition-colors font-medium"
                  >
                    Cart
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[11px] uppercase tracking-[0.2em] text-signal font-bold">
                Help
              </span>
              <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
                <li>
                  <LocalizedClientLink
                    href="/legal/shipping-returns"
                    className="text-white/60 hover:text-white transition-colors font-medium"
                    data-testid="footer-shipping-returns"
                  >
                    Shipping &amp; returns
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/legal/privacy"
                    className="text-white/60 hover:text-white transition-colors font-medium"
                    data-testid="footer-privacy"
                  >
                    Privacy
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/legal/terms"
                    className="text-white/60 hover:text-white transition-colors font-medium"
                    data-testid="footer-terms"
                  >
                    Terms
                  </LocalizedClientLink>
                </li>
                <li>
                  <a
                    href="mailto:support@onecurve.in"
                    className="text-white/60 hover:text-white transition-colors font-medium"
                    data-testid="footer-contact"
                  >
                    support@onecurve.in
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col small:flex-row gap-2 w-full py-8 justify-between border-t border-white/10 text-white/40 text-xs font-medium">
          <span>© {new Date().getFullYear()} OneCurve. All rights reserved.</span>
          <span>India · Performance equipment</span>
        </div>
      </div>
    </footer>
  )
}
