"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@modules/common/components/ui"
import { Fragment } from "react"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { Locale } from "@lib/data/locales"


const SideMenuItems: { name: string; href: string }[] = [
  { name: "Home", href: "/" },
  { name: "Store", href: "/store" },
  { name: "Training", href: "/disciplines/training" },
  { name: "Nutrition", href: "/disciplines/nutrition" },
  { name: "Recovery", href: "/disciplines/recovery" },
  { name: "Account", href: "/account" },
  { name: "Bag", href: "/cart" },
]

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
}

const SideMenu = ({ regions, locales, currentLocale }: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full inline-flex items-center min-h-11 min-w-11 px-1 text-sm font-semibold text-ink transition-colors focus:outline-none hover:text-signal"
                >
                  Menu
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="fixed inset-0 z-[50] bg-black/50 backdrop-blur-sm pointer-events-auto"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <PopoverPanel className="flex flex-col fixed small:absolute left-2 right-2 top-[calc(env(safe-area-inset-top,0px)+0.5rem)] small:left-2 small:right-auto small:w-[min(100%,22rem)] h-[min(calc(100dvh-1rem),36rem)] z-[51] text-sm text-ui-fg-base">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col h-full bg-paper border border-line rounded-2xl justify-between p-5 small:p-6 shadow-2xl shadow-black/20 overflow-y-auto overscroll-contain"
                  >
                    <div className="flex justify-end" id="xmark">
                      <button
                        data-testid="close-menu-button"
                        onClick={close}
                        className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-full hover:bg-mute"
                        aria-label="Close menu"
                      >
                        <XMark />
                      </button>
                    </div>
                    <ul className="flex flex-col gap-1 items-stretch justify-start list-none m-0 p-0">
                      {SideMenuItems.map(({ name, href }) => {
                        return (
                          <li key={name}>
                            <LocalizedClientLink
                              href={href}
                              className="font-display font-extrabold text-2xl small:text-3xl leading-tight text-ink hover:text-signal transition-colors block py-2.5 min-h-11"
                              onClick={close}
                              data-testid={`${name.toLowerCase()}-link`}
                            >
                              {name}
                            </LocalizedClientLink>
                          </li>
                        )
                      })}
                    </ul>
                    <div className="flex flex-col gap-y-6">
                      {!!locales?.length && (
                        <div
                          className="flex justify-between"
                          onMouseEnter={languageToggleState.open}
                          onMouseLeave={languageToggleState.close}
                        >
                          <LanguageSelect
                            toggleState={languageToggleState}
                            locales={locales}
                            currentLocale={currentLocale}
                          />
                          <ArrowRightMini
                            className={clx(
                              "transition-transform duration-150",
                              languageToggleState.state ? "-rotate-90" : ""
                            )}
                          />
                        </div>
                      )}
                      <div
                        className="flex justify-between"
                        onMouseEnter={countryToggleState.open}
                        onMouseLeave={countryToggleState.close}
                      >
                        {regions && (
                          <CountrySelect
                            toggleState={countryToggleState}
                            regions={regions}
                          />
                        )}
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150",
                            countryToggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                      <Text className="flex justify-between txt-compact-small">
                        © {new Date().getFullYear()} OneCurve Sports. All rights
                        reserved.
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
