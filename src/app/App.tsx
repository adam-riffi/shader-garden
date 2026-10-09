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
    <main>
      <h1>Shader Garden</h1>
      {/* Keyed by path so an error on one page does not stick after navigating away. */}
      <EngineBoundary key={pathname}>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/s/:name" element={<ShaderPage />} />
            <Route
              path="*"
              element={
                <p>
                  Nothing grows here. <Link to="/">Back to the gallery</Link>
                </p>
              }
            />
          </Routes>
        </Suspense>
      </EngineBoundary>
      <FrameMeter />
    </main>
  );
}
