import React from "react";

const Alert = ({ children, className = '' }) => (
  <div className={`rounded-lg border border-gray-200 p-4 ${className}`}>
    {children}
  </div>
);

const AlertDescription = ({ children, className = '' }) => (
  <div className={`text-sm text-gray-500 ${className}`}>
    {children}
  </div>
);

export { Alert, AlertDescription };