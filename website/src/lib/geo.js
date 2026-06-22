// Shared lon/lat → unit-sphere conversion. Imported by BOTH the Node bake
// script (scripts/globe-to-ply.mjs) and the browser globe component
// (src/components/AtlasGlobe.astro) so the baked land cloud and the live pins
// land in exactly the same coordinate frame — any divergence here puts pins
// off the coast.
//
// R = 0.5 matches the project's PLY convention (clouds normalised so the
// largest extent is 1.0, i.e. fitting in [-0.5, 0.5]).
//
// Frame: +Y is the north pole. Longitude 0 / latitude 0 (the Gulf of Guinea)
// faces +Z toward the camera's default position.

/**
 * @param {number} lon  Longitude in degrees, -180..180.
 * @param {number} lat  Latitude in degrees, -90..90.
 * @param {number} [R]  Sphere radius (default 0.5).
 * @returns {[number, number, number]} [x, y, z]
 */
export function lonLatToVec3(lon, lat, R = 0.5) {
  const phi = ((90 - lat) * Math.PI) / 180; // polar angle from +Y
  const theta = ((lon + 180) * Math.PI) / 180;
  return [
    -R * Math.sin(phi) * Math.cos(theta),
    R * Math.cos(phi),
    R * Math.sin(phi) * Math.sin(theta),
  ];
}
