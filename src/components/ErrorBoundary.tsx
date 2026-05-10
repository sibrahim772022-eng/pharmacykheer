import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", fontFamily: "sans-serif", color: "#333", direction: "rtl" }}>
          <h1 style={{ color: "#d93025" }}>عذراً، حدث خطأ غير متوقع.</h1>
          <p>تفاصيل الخطأ:</p>
          <pre style={{ background: "#f1f3f4", padding: "10px", borderRadius: "5px", overflow: "auto", direction: "ltr", textAlign: "left" }}>
            {this.state.error?.message}
          </pre>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default ErrorBoundary;
