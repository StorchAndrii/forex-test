import React, { useEffect, useRef, useState } from "react";
import { ChartRenderer } from "../renderers/ChartRenderer";
import { Bar } from "../types/bar.type";
import { DataLoader } from "../renderers/DataLoader";

interface CanvasChartProps {
    apiUrl: string;
}

const CanvasChart: React.FC<CanvasChartProps> = ({ apiUrl }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [bars, setBars] = useState<Bar[]>([]);
    const [renderer, setRenderer] = useState<ChartRenderer | null>(null);

    useEffect(() => {
        const dataLoader = new DataLoader(apiUrl);
        dataLoader.fetchBars().then((loadedBars) => setBars(loadedBars));
    }, [apiUrl]);


    useEffect(() => {
        if (canvasRef.current && bars.length > 0) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d")!;
            const chartRenderer = new ChartRenderer(ctx, canvas.width, canvas.height, bars, canvas); // Додаємо canvas як аргумент

            setRenderer(chartRenderer);
            chartRenderer.draw();
        }
    }, [bars]);

    // Обробник для масштабування колесом миші
    const handleWheel = (e: React.WheelEvent) => {
        if (renderer) {
            const currentZoom = renderer.getZoomLevel();
            const newZoomLevel = currentZoom + (e.deltaY > 0 ? -0.1 : 0.1);
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
