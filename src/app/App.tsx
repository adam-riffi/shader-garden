import { lazy, Suspense } from "react";
import { FrameMeter } from "../engine/FrameMeter";
import { EngineBoundary } from "./EngineBoundary";

// three and React Three Fiber load in their own chunk, keeping the initial bundle small.
const EngineDemo = lazy(() => import("./EngineDemo"));

export function App() {
  return (
    <main>
      <h1>Shader Garden</h1>
      <EngineBoundary>
        <Suspense fallback={null}>
          <EngineDemo />
        </Suspense>
      </EngineBoundary>
      <FrameMeter />
    </main>
  );
}
