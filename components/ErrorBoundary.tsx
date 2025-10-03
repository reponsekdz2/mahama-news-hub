import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // FIX: Initialize state using a public class field. This is a modern alternative to using a constructor and ensures `this.state` is correctly typed and available throughout the component.
  public state: ErrorBoundaryState = {
    hasError: false,
    error: undefined,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // Here you would typically log the error to a service like Sentry
  }

  private handleReport = () => {
    const subject = "Mahama News TV - Application Error Report";
    const body = `
      Hello Support Team,
      
      I encountered an error in the application.
      
      Error Details:
      ----------------
      Message: ${this.state.error?.message}
      Stack: ${this.state.error?.stack}
      ----------------
      
      Please investigate this issue.
      
      Regards,
      A concerned user
    `;
    window.location.href = `mailto:support@mahamanews.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4 text-center">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl max-w-lg w-full">
                <svg className="w-20 h-20 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-4">Something went wrong.</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    We're sorry for the inconvenience. A critical error occurred and our team has been notified. Please refresh the page to continue.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                    <button
                      onClick={() => window.location.reload()}
                      className="px-6 py-2 bg-accent-600 text-white font-semibold rounded-lg shadow-md hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                    >
                      Refresh Page
                    </button>
                    <button
                      onClick={this.handleReport}
                      className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                    >
                      Report Issue
                    </button>
                </div>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
