"use client";

import { ReactNode } from "react";

export default function DrawerSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t pt-3 mt-3">
      <h3 className="font-medium mb-2">{title}</h3>
      {children}
    </section>
  );
}
