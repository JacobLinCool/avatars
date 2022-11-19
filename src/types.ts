export interface Config {
	prompt: string;
	negative: string;
	model: "safe-diffusion" | "nai-diffusion" | "nai-diffusion-furry";
	width: number;
	height: number;
	steps: number;
	scale: number;
	sampler: "k_euler_ancestral" | "k_euler" | "k_lms" | "plms" | "ddim";
	seed: number;
}
