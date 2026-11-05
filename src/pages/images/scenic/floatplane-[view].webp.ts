import type { APIRoute, GetStaticPaths } from 'astro';
import { harbourMotion } from '../../../lib/harbour-motion';
import { flightViews, groundProjection } from '../../../lib/floatplane-view';
import { paintFlight } from '../../../lib/draw-floatplane';

export const prerender = true;
export const getStaticPaths: GetStaticPaths = () => ['harbour-blue', 'harbour-red'].map(view=>({params:{view}}));

export const GET: APIRoute = async ({params}) => {
  const red = params.view === 'harbour-red';
  const scene = 'harbour';
  const { headings } = harbourMotion(red ? 1 : 0, groundProjection(scene));
  const { poses } = flightViews(scene, headings);
  const bytes = await paintFlight(scene, poses, red ? '#a85b50' : '#345f79');
  return new Response(new Uint8Array(bytes), {headers:{'Content-Type':'image/webp'}});
};
