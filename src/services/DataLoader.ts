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
            console.log("API Response:", data); // Для отладки

            // Объединяем все бары в один массив и корректируем время
            const allBars: Bar[] = data.flatMap((chunk: any) =>
                chunk.Bars.map((bar: any) => ({
                    time: (chunk.ChunkStart + bar.Time) * 1000, // Учитываем смещение времени
                    open: bar.Open,
                    high: bar.High,
                    low: bar.Low,
                    close: bar.Close,
                    volume: bar.TickVolume,
                }))
            );

            console.log("Загруженные бары:", allBars); // Отладочный вывод
            return allBars;
        } catch (error) {
            console.error("Ошибка при загрузке данных:", error);
            return []; // Возвращаем пустой массив при ошибке
        }
    }
}
