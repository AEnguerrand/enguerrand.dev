import { harbourMotion } from '../../lib/harbour-motion';
import { facingCss, groundProjection } from '../../lib/floatplane-view';

// One cacheable static stylesheet, shared by every page with the harbour footer.
export const prerender = true;
export function GET() {
  const styles = [0,1].map(id => {
    const plane = harbourMotion(id, groundProjection('harbour'));
    return plane.css + facingCss(plane.name, 'harbour', plane.headings, plane.duration);
  });
  return new Response(styles.join('\n'), {
    headers: { 'Content-Type': 'text/css; charset=utf-8' },
  });
}
