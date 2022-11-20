import fs from "node:fs";
import path from "node:path";
import { program } from "commander";
import ora from "ora";
import cuid from "cuid";
import { resolution } from "nai-studio";
import { Collection } from "./generator";
import matrix from "./matrix";

program
    .command("restore")
    .option("-f, --filter <name>", "Filter by collection name", "")
    .action(async (options) => {
        const collections = fs
            .readdirSync("output")
            .filter((name) => name.includes(options.filter));

        for (const name of collections) {
            const c = new Collection(name);

            const spinner = ora(`Restoring ${name}`).start();
            await c.render(spinner);
            spinner.succeed(`Restored ${c.paintings.length} paintings in ${name}`);
        }
    });

program
    .command("index")
    .option("-t, --title <title>", "Title of the index", "Novel AI Paintings")
    .option("-c, --cols <n>", "Number of columns", Number, 4)
    .option("--json <n>", "Indentation of the JSON, negative for no JSON", Number, -1)
    .action(async (options) => {
        const base = path.join(process.cwd(), "output");
        const collections = fs
            .readdirSync(base)
            .filter((name) => fs.statSync(path.join(base, name)).isDirectory());

        let md = `# ${options.title}\n\n`;
        let json: Record<string, string[]> = {};

        for (const name of collections) {
            const c = new Collection(name);

            md += `<details open>\n<summary>\n${name}\n</summary>\n\n<table style="display: block; max-width: 100%; overflow: auto;">\n`;
            json[name] = c.paintings.map((p) => path.basename(p.path));

            for (let i = 0; i < c.paintings.length; i += options.cols) {
                md += "<tr>\n";

                for (let j = 0; j < options.cols; j++) {
                    const p = c.paintings[i + j];
                    if (p) {
                        const png = `${p.path.replace(base, ".")}.png`;
                        md += `<td><a target="_blank" href="${png}"><img src="${png}"></a>\n`;
                        md +=
                            "<details>\n\n```json\n" +
                            JSON.stringify(p.config, null, 4) +
                            "\n```\n\n</details>\n</td>\n";
                    }
                }

                md += "</tr>\n";
            }

            md += "</table></details>\n";
        }

        md += `<style> img { max-width: 100%; } pre { max-width: 100%; white-space: pre-wrap !important; } </style>`;

        fs.writeFileSync(path.join(base, "README.md"), md);
        if (options.json >= 0) {
            fs.writeFileSync(
                path.join(base, "index.json"),
                JSON.stringify(json, null, options.json),
            );
        }
        ora().succeed(`Generated index in ${base}`);
    });

program
    .argument("<matrix>", "Matrix name")
    .argument("<collection>", "Collection name")
    .option("-n, --number <n>", "Number of paintings to generate", Number, 10)
    .option("-s, --scale <n>", "Scale of paintings to generate", Number, 11)
    .option(
        "-w, --width <n>",
        "Width of paintings to generate",
        Number,
        resolution.normal.portrait.width,
    )
    .option(
        "-h, --height <n>",
        "Height of paintings to generate",
        Number,
        resolution.normal.portrait.height,
    )
    .option("-m, --model <model>", "Model to use", "safe-diffusion")
    .option("-S, --sampler <sampler>", "Sampler to use", "k_euler_ancestral")
    .option("--dry", "Dry run (Don't render images)")
    .action(async (matrix_name: string, collection_name, options) => {
        if (!(matrix_name in matrix)) {
            console.error(`Matrix ${matrix_name} not found`);
            process.exit(1);
        }

        const m = matrix[matrix_name as keyof typeof matrix];
        const c = new Collection(collection_name);

        for (let i = 0; i < options.number; i++) {
            c.add(`${collection_name}_${cuid()}`, {
                prompt: m.map((row) => row[Math.floor(Math.random() * row.length)]).join(", "),
                negative: "",
                model: options.model,
                width: options.width,
                height: options.height,
                steps: 28,
                scale: options.scale,
                sampler: options.sampler,
                seed: Math.floor(Math.random() * 2 ** 31),
            });
        }

        if (options.dry) {
            ora().succeed(`Created ${options.number} painting configs in ${collection_name}`);
            return;
        }

        const spinner = ora("Generating").start();
        await c.render(spinner);
        spinner.succeed("Done");
    })
    .parse();
