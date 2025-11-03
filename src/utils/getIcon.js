export default function getIcon(name) {
  return new URL(`../assets/FlightSurveillance/${name}.png`, import.meta.url).href;
}