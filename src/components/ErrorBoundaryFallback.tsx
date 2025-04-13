import { memo } from 'react';

const ErrorBoundaryFallback = ({ error }: { error: unknown }) => {
  return (
    <div>
      <p>An unhandled error occurred:</p>
      <blockquote>
        <code>
          {error instanceof Error
            ? error.message
            : typeof error === 'string'
            ? error
            : JSON.stringify(error)}
        </code>
      </blockquote>
    </div>
  );
};

export default memo(ErrorBoundaryFallback);
