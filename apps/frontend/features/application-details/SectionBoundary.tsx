"use client";

import React from "react";
import Alert from "@/components/ui/Alert";

/** Keeps a failing section (activity, tasks, files) from taking down the sheet. */
export default class SectionBoundary extends React.Component<
  { title: string; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err: unknown) {
    console.error(`[SectionBoundary:${this.props.title}]`, err);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert title={`${this.props.title} couldn't be displayed`}>
          The rest of this application is still available. Close and reopen it to try again.
        </Alert>
      );
    }
    return this.props.children;
  }
}
