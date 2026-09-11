"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { hrefFor, navigation } from "@/lib/docs/navigation";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Documentation" className="sidebar-nav">
      {navigation.map((group) => (
        <section key={group.title} className="sidebar-group">
          <h2 className="sidebar-group-title">{group.title}</h2>
          <ul>
            {group.items.map((item) => {
              const href = hrefFor(item.slug);
              const current = pathname === href || pathname === `${href}/`;
              return (
                <li key={item.slug}>
                  <Link href={href} aria-current={current ? "page" : undefined} className="sidebar-link">
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
}
