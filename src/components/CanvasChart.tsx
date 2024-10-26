import React, { useEffect, useRef, useState } from "react";
import { ChartRenderer } from "../services/ChartRenderer";
import { Bar } from "../types/bar.type";
import { DataLoader } from "../services/DataLoader";

interface CanvasChartProps {
    apiUrl: string;
}

const CanvasChart: React.FC<CanvasChartProps> = ({ apiUrl }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [bars, setBars] = useState<Bar[]>([]);
    const [renderer, setRenderer] = useState<ChartRenderer | null>(null);

    // Загружаем данные с API
    useEffect(() => {
        const dataLoader = new DataLoader(apiUrl);
        dataLoader.fetchBars().then((loadedBars) => {
            setBars(loadedBars);
        });
    }, [apiUrl]);

    // Инициализируем ChartRenderer после загрузки данных
    useEffect(() => {
        if (canvasRef.current && bars.length > 0) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d")!;
            const chartRenderer = new ChartRenderer(ctx, canvas.width, canvas.height, bars);
            setRenderer(chartRenderer);
            chartRenderer.draw(); // Отрисовываем график

            // Привязываем события мыши
            canvas.addEventListener("mousedown", chartRenderer.onMouseDown);

            // Очистка слушателей при размонтировании
            return () => {
                canvas.removeEventListener("mousedown", chartRenderer.onMouseDown);
            };
        }
    }, [bars]);

    // Обработчик для масштабирования колесом мыши
    const handleWheel = (e: React.WheelEvent) => {
        if (renderer) {
            const newZoomLevel = renderer.getZoomLevel() + (e.deltaY > 0 ? -0.1 : 0.1);
            renderer.setZoomLevel(newZoomLevel);
        }
    };

    return (
        <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            onWheel={handleWheel}
            style={{
                border: "1px solid black",
                cursor: "default",
            }}
        />
    );
};

export default CanvasChart;
