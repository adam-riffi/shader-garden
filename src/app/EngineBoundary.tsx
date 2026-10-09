import { Component, type ReactNode } from "react";

interface State {
  failed: boolean;
}

/** Keeps the page usable when WebGL2 is missing or the engine chunk fails to load. */
export class EngineBoundary extends Component<{ children: ReactNode }, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override render() {
    return this.state.failed ? <p>This browser cannot run WebGL2 shaders.</p> : this.props.children;
  }
}
