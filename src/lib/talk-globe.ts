import { geoDistance, geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import topology from "../data/land-110m.json";

const world = topology as unknown as Topology<{ land: GeometryCollection }>;
const land = feature(world, world.objects.land);
const grid = geoGraticule10();

// France is a country-level marker: one source specifies Paris, another only France.
export const talkPlaces = [
  { id: "france", label: "France", coordinates: [2.2, 46.6] as [number, number], matches: (location: string) => /France$/.test(location) },
  { id: "salt-lake-city", label: "Salt Lake City", coordinates: [-111.89, 40.76] as [number, number], matches: (location: string) => location.startsWith("Salt Lake City") },
  { id: "hong-kong", label: "Hong Kong", coordinates: [114.17, 22.32] as [number, number], matches: (location: string) => location === "Hong Kong" },
];

export const createGlobeProjection = () => geoOrthographic()
  .translate([180, 180]).scale(156).rotate([-10, -24]).precision(.7);

export function globeFrame(projection: ReturnType<typeof createGlobeProjection>) {
  const path = geoPath(projection);
  const rotation = projection.rotate();
  const center: [number, number] = [-rotation[0], -rotation[1]];
  return {
    land: path(land) ?? "",
    grid: path(grid) ?? "",
    markers: talkPlaces.map((place) => {
      const [x, y] = projection(place.coordinates) ?? [180, 180];
      return { ...place, x, y, visible: geoDistance(center, place.coordinates) < Math.PI / 2 - .06 };
    }),
  };
}
