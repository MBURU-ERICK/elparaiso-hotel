import { Component, lazy, Suspense } from 'react';
const GalleryLightbox = lazy(() => import('./GalleryLightbox'));

// A failed optional download should not take down a page or erase an enquiry.
class ViewerBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    const photo = this.props.images[this.props.initialIndex || 0];
    return <div className="gallery-viewer-notice" role="alert"><span>The photo viewer could not be loaded.</span>{photo && <a href={photo.image_url} target="_blank" rel="noopener noreferrer">Open original photograph</a>}<button type="button" onClick={this.props.onClose}>Close</button></div>;
  }
}
export default function LazyGalleryLightbox(props) {
  return <ViewerBoundary {...props}><Suspense fallback={<div className="gallery-viewer-notice" role="status"><span>Opening photograph viewer…</span><button type="button" onClick={props.onClose}>Cancel</button></div>}><GalleryLightbox {...props} /></Suspense></ViewerBoundary>;
}
