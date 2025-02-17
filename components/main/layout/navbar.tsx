import React, { useContext, useState } from "react";
import styles from "../../shared/layout/Navbar/Navbar.module.scss";
import Link from "next/link";
import { Menu, X } from "react-feather";
import AnimateHeight from "react-animate-height";
import { Dictionary } from "lodash";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { WidgetContext } from "./layout";
import { EffektButton, EffektButtonType } from "../../shared/components/EffektButton/EffektButton";
import { ResponsiveImage } from "../../shared/responsiveimage";

export type NavLink = {
  _type: "navitem";
  _key: string;
  title: string;
  slug: string;
};

export type MainNavbarGroup = {
  _type: "navgroup";
  _key: string;
  title: string;
  items: NavLink[];
};

export type MainNavbarItem = NavLink | MainNavbarGroup;

export type MainNavbarProps = {
  logo: SanityImageSource;
  elements: MainNavbarItem[];
};

export const Navbar: React.FC<MainNavbarProps> = ({ elements, logo }) => {
  const [widgetOpen, setWidgetOpen] = useContext(WidgetContext);

  const [expandMenu, setExpandMenu] = useState<boolean>(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<Dictionary<boolean>>(
    elements.reduce((a, v) => ({ ...a, [v._key]: false }), {}),
  );

  const setExpanded = (expanded: boolean) => {
    if (expanded && window.innerWidth < 1180) document.body.style.overflow = "hidden";
    else if (typeof document !== "undefined") document.body.style.overflow = "auto";

    setExpandMenu(expanded);
  };

  const toggleExpanded = (key: string) => {
    const expanded = { ...expandedSubmenu };
    expanded[key] = !expandedSubmenu[key];
    setExpandedSubmenu(expanded);
  };

  return (
    <div className={`${styles.container} ${expandMenu ? styles.navbarExpanded : ""}`}>
      <nav className={`${styles.navbar}`} data-cy="navbar">
        <div className={styles.logoWrapper}>
          <div className={styles.logoWrapperImage}>
            <Link href="/">
              <a>
                <ResponsiveImage image={logo} onClick={() => setExpanded(false)} priority />
              </a>
            </Link>
          </div>
          <button className={styles.expandBtn} onClick={() => setExpanded(!expandMenu)}>
            {expandMenu ? <X size={32} color={"black"} /> : <Menu size={32} color={"black"} />}
          </button>
        </div>
        <ul>
          {elements.map((el) =>
            el._type === "navgroup" ? (
              <li
                key={el._key}
                className={
                  expandedSubmenu[el._key] ? styles.expandedSubmenu : styles.collapsedSubmenu
                }
              >
                <button
                  onBlur={() => expandedSubmenu[el._key] && toggleExpanded(el._key)} 
                  onMouseLeave={() => { 
                    if (window.screen.width > 1180) expandedSubmenu[el._key] && toggleExpanded(el._key);
                  }} 
                  onClick={() => toggleExpanded(el._key)}
                >
                  {el.title}
                </button>
                <AnimateHeight height={expandedSubmenu[el._key] ? "auto" : "0%"} animateOpacity>
                  <div className={styles.submenu}>
                    <ul>
                      {el.items.map((subel) => (
                        <li key={subel.title} onClick={() => setExpanded(false)}>
                          <Link href={`/${subel.slug}`} passHref>
                            {subel.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimateHeight>
              </li>
            ) : (
              <li key={el._key} onClick={() => setExpanded(false)}>
                <Link href={`/${el.slug}`} passHref>
                  {el.title}
                </Link>
              </li>
            ),
          )}
          <li className={styles.buttonsWrapper}>
            <Link href="/profile" passHref>
              <EffektButton
                extraMargin={true}
                type={EffektButtonType.SECONDARY}
                onClick={() => setExpanded(false)}
              >
                Logg inn
              </EffektButton>
            </Link>
            <EffektButton
              extraMargin={true} 
              onClick={() => setWidgetOpen(true)}
            >
              Send donasjon
            </EffektButton>
          </li>
        </ul>
      </nav>
    </div>
  );
};
