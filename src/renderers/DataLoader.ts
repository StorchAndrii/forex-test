import {Bar} from "../types/bar.type";


export class DataLoader {
    private readonly apiUrl: string;

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
    }

    async fetchBars(): Promise<Bar[]> {
        try {
            const response = await fetch(this.apiUrl);

            if (!response.ok) {
                throw new Error(`Ошибка загрузки данных: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();


            return data.flatMap((chunk: any) =>
                chunk.Bars.map((bar: any) => ({
                    time: (chunk.ChunkStart + bar.Time) * 1000,
                    open: bar.Open,
                    high: bar.High,
                    low: bar.Low,
                    close: bar.Close,
                    volume: bar.TickVolume,
                }))
            );
        } catch (error) {
            console.error("Error:", error);
            return [];
        }
    }
}
