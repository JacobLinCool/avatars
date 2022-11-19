import { colors, hairs, bangs, hair_effects } from "../utils";

const matrix = [
    ["masterpiece"],
    ["white_background, simple_background"],
    colors.map((color) => `${color}_eyes`),
    colors.map((color) => `${color}_hair`),
    [...hairs, Array(hairs.length).fill("")],
    [...hairs, Array(hairs.length).fill("")],
    [...bangs, Array(bangs.length * 2).fill("")],
    [...hair_effects, Array(hair_effects.length * 2).fill("")],
];

export default matrix;
