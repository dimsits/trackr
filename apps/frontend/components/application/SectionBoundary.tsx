"use client";

import React from "react";

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
        <div className="text-sm text-red-600">
          {this.props.title} failed to render.
        </div>
      );
    }
    return this.props.children;
  }
}
