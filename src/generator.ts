import EventEmitter from "node:events";
import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { Ora } from "ora";
import { NovelAI } from "nai-studio";
import { Config } from "./types";

const output = path.join(process.cwd(), "output");
if (!fs.existsSync(output)) {
    fs.mkdirSync(output);
}

config();
const nai = new NovelAI(process.env.NOVEL_AI_TOKEN);

export class Painting {
    public path: string;

    constructor(filepath: string) {
        const ext = path.extname(filepath);
        if (ext) {
            filepath = filepath.slice(0, -ext.length);
        }
        this.path = filepath;
    }

    public get image(): Buffer {
        return fs.readFileSync(`${this.path}.png`);
    }

    public get config(): Config {
        return JSON.parse(fs.readFileSync(`${this.path}.json`, "utf8"));
    }

    public get rendered(): boolean {
        return fs.existsSync(`${this.path}.png`);
    }

    public async render(spinner?: Ora): Promise<void> {
        if (this.rendered) {
            spinner?.info(`Skipped ${this.path}.png (Exists)`);
            return;
        }

        spinner?.start(`Rendering ${this.path}.png`);
        const start_time = Date.now();
        const image = await nai.image(this.config.prompt, this.config.negative, this.config);
        fs.writeFileSync(`${this.path}.png`, image);
        const seconds = ((Date.now() - start_time) / 1000).toFixed(2);
        spinner?.succeed(`Rendered ${this.path}.png (${seconds}s)`);
    }
}

export class Collection extends EventEmitter {
    public name: string;
    public paintings: Painting[];

    constructor(name: string) {
        super();
        this.name = name;

        if (!fs.existsSync(path.join(output, name))) {
            fs.mkdirSync(path.join(output, name));
        }

        this.paintings = fs
            .readdirSync(path.join(output, name))
            .filter((file) => file.endsWith(".json"))
            .map((file) => new Painting(path.join(output, name, file.slice(0, -5))));
    }

    public add(name: string, config: Config): Painting {
        const filepath = path.join(output, this.name, name);
        if (this.paintings.some((painting) => painting.path === filepath)) {
            throw new Error(
                `A painting with name "${name}" already exists in collection "${this.name}".`,
            );
        }

        fs.writeFileSync(`${filepath}.json`, JSON.stringify(config, null, 4));
        const painting = new Painting(filepath);
        this.paintings.push(painting);
        this.emit("add", painting);
        return painting;
    }

    public async render(spinner?: Ora): Promise<void> {
        for (const painting of this.paintings) {
            await painting.render(spinner);
        }
    }

    public on(event: "add", listener: (painting: Painting) => void): this;
    public on(event: string | symbol, listener: (...args: any[]) => void): this {
        return super.on(event, listener);
    }
}
