const LoadingState = ({ message = "Loading..." }) => {
  return (
    <div className="ui-loading" role="status" aria-live="polite" aria-busy="true">
      <div className="ui-loading__inner">
        <span className="ui-loading__spinner" />
        <p className="ui-loading__text">{message}</p>
      </div>
    </div>
  );
};

export default LoadingState;
