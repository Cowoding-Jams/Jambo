import Enmap from "enmap";

interface rmdDb{
    timeout: NodeJS.Timeout;
    destination: number;
    message: string;
}

export const timeDb = new Map<number, rmdDb>();

export const latexDb = new Enmap<string, string>("latex");
