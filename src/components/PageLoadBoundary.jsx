import { Component } from 'react';

export default class PageLoadBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="section" role="alert"><span className="eyebrow">LET’S TRY THAT AGAIN</span><h1>Your next visit is worth another look.</h1><p>This page could not be opened. Please reload or return to the homepage.</p><div className="premium-actions"><button type="button" className="premium-button" onClick={() => window.location.reload()}>Reload page</button><a className="elegant-text-link" href="/">Return to Elparaiso</a></div></main>;
  }
}
