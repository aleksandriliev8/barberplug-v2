import { render } from "@testing-library/react";
import type { ComponentType } from "react";
import { createRoutesStub } from "react-router";

/** Renders a component inside a router at `url`, with `/:lang` params like the real app. */
export function renderAt(url: string, Component: ComponentType) {
  const Stub = createRoutesStub([
    { path: "/:lang", Component },
    { path: "/:lang/*", Component },
  ]);
  return render(<Stub initialEntries={[url]} />);
}
