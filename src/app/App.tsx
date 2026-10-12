import { lazy, Suspense } from "react";
import { Link, Route, Routes, useLocation } from "react-router";
import { FrameMeter } from "../engine/FrameMeter";
import { EngineBoundary } from "./EngineBoundary";

// Pages load in their own chunks (three, zod and the shaders stay out of the initial bundle).
const Home = lazy(() => import("./Home"));
const ShaderPage = lazy(() => import("./ShaderPage"));

export function App() {
  const { pathname } = useLocation();
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Shader Garden home">
          <span className="brand-mark" aria-hidden="true">
            ✳
          </span>
          <h1>Shader Garden</h1>
        </Link>
        <nav aria-label="Main navigation">
          <Link
            className="collection-nav"
            to="/"
            aria-current={pathname === "/" ? "page" : undefined}
          >
            The collection
          </Link>
          <a href="https://github.com/adam-riffi/shader-garden" target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        </nav>
      </header>
      <main id="main-content" tabIndex={-1}>
        {/* Keyed by path so an error on one page does not stick after navigating away. */}
        <EngineBoundary key={pathname}>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/s/:name" element={<ShaderPage />} />
              <Route
                path="*"
                element={
                  <p className="route-message">
                    Nothing grows here. <Link to="/">Back to the gallery</Link>
                  </p>
                }
              />
            </Routes>
          </Suspense>
        </EngineBoundary>
        <FrameMeter />
      </main>
    </>
  );
}
