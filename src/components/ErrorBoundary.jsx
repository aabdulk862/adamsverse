import { Component } from "react";
import { logError } from "../lib/logger";
import Navbar from "./Navbar";

/**
 * React Error Boundary — catches unhandled rendering errors,
 * shows a fallback UI with Navbar preserved, and reports
 * errors through the centralized logger.
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 13.4
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    logError(error, { componentStack: info?.componentStack });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <>
          <Navbar />
          <main className="error-fallback">
            <h1>Something went wrong</h1>
            <p>An unexpected error occurred. You can try reloading the page.</p>
            <button
              type="button"
              className="error-fallback-reload"
              onClick={this.handleReload}
            >
              Reload
            </button>
          </main>
        </>
      );
    }

    return this.props.children;
  }
}
