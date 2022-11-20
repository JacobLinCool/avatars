import { hairs, bangs } from "../utils";

export default [
    ["solo, upper body, looking at viewer"],
    ["1girl", "1boy"],
    ["open mouth", "smile", ":d", ...Array(3).fill("")],
    [
        "aqua",
        "brown",
        "orange",
        "yellow",
        "green",
        "teal",
        "cyan",
        "blue",
        "violet",
        "purple",
        "fuchsia",
        "pink",
        "red",
    ].map((color) => `{{{${color}_eyes}}}`),
    [...hairs, ...Array(hairs.length).fill("")],
    [...bangs, ...Array(bangs.length).fill("")],
    ["shirt", "jacket", "sweater", "sweatshirt", "hoodie", "coat"],
    ["{{sketch}}, {{monochrome}}, black_and_white, dynamic angle"],
];
