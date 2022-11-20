import { colors, hairs, bangs } from "../utils";

export default [
    ["solo, upper body, looking at viewer, open mouth, smile, :d"],
    ["1girl", "1boy"],
    colors.map((color) => `${color} hair, ${color} eyes`),
    [...hairs, ...Array(hairs.length).fill("")],
    [...bangs, ...Array(bangs.length).fill("")],
    ["shirt", "jacket", "sweater", "sweatshirt", "hoodie", "coat"],
    ["{{watercolor pencil}}, {watercolor}, sketch"],
];
