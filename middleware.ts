import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const accept = request.headers.get("accept") || "";

  // Markdown for Agents: if client accepts text/markdown, return markdown version
  if (accept.includes("text/markdown")) {
    // For homepage, serve the markdown summary
    if (request.nextUrl.pathname === "/") {
      const url = new URL("/index.md", request.url);
      const response = NextResponse.rewrite(url);
      response.headers.set("Content-Type", "text/markdown; charset=utf-8");
      response.headers.set("Vary", "Accept");
      return response;
    }
  }

  // Add Link headers for agent discovery on all HTML responses
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  if (pathname === "/" || pathname.startsWith("/stroop-test") || pathname.startsWith("/schulte-grid") || pathname.startsWith("/nback-memory") || pathname.startsWith("/reaction-time") || pathname.startsWith("/attention-span") || pathname.startsWith("/digit-span")) {
    const links = [
      `</.well-known/agent-skills/index.json>; rel="agent-skills"; type="application/json"`,
      `</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"`,
      `</guide>; rel="service-doc"`,
      `</about>; rel="about"`,
    ];
    response.headers.set("Link", links.join(", "));
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/stroop-test",
    "/schulte-grid",
    "/nback-memory",
    "/reaction-time",
    "/attention-span",
    "/digit-span",
    "/about",
    "/guide",
    "/privacy",
    "/terms",
    "/cookies",
  ],
};
