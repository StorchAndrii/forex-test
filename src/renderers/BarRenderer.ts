import { Bar } from "../types/bar.type";
import {ChartStyles} from "../utils/ChartStyles";

/**
 * BarRenderer – відповідає за відображення барів (свічок).
 */
export class BarRenderer {
    constructor(private ctx: CanvasRenderingContext2D) {}

    public draw(
        bars: Bar[],
        minPrice: number,
        maxPrice: number,
        offsetX: number,
        barWidth: number,
        padding: number
    ) {
        const firstBarIndex = Math.floor(offsetX / barWidth);
        const visibleBars = Math.min(bars.length - firstBarIndex, Math.ceil((this.ctx.canvas.width - padding) / barWidth));

        for (let i = 0; i < visibleBars; i++) {
            const bar = bars[firstBarIndex + i];
            const x = padding + i * barWidth - (offsetX % barWidth);
            this.drawCandle(bar, x, barWidth, minPrice, maxPrice);
        }
    }

    private drawCandle(bar: Bar, x: number, barWidth: number, minPrice: number, maxPrice: number) {
        const yOpen = this.priceToY(bar.open, minPrice, maxPrice);
        const yClose = this.priceToY(bar.close, minPrice, maxPrice);
        const yHigh = this.priceToY(bar.high, minPrice, maxPrice);
        const yLow = this.priceToY(bar.low, minPrice, maxPrice);

        const candleColor = bar.close >= bar.open
            ? ChartStyles.POSITIVE_CANDLE_COLOR
            : ChartStyles.NEGATIVE_CANDLE_COLOR;

        // Рендер хвоста свічки
        this.ctx.strokeStyle = candleColor;
        this.ctx.lineWidth = 0.7;
        this.ctx.beginPath();
        this.ctx.moveTo(x + barWidth / 2, yHigh);
        this.ctx.lineTo(x + barWidth / 2, yLow);
        this.ctx.stroke();

        // Рендер тіла свічки
        const bodyWidth = Math.max(3, barWidth * 0.7);
        this.ctx.fillStyle = candleColor;
        this.ctx.fillRect(
            x + (barWidth - bodyWidth) / 2,
            Math.min(yOpen, yClose),
            bodyWidth,
            Math.abs(yClose - yOpen)
        );
    }

    private priceToY(price: number, minPrice: number, maxPrice: number): number {
        const priceRange = maxPrice - minPrice;
        const yRange = this.ctx.canvas.height - ChartStyles.PADDING_TOP - ChartStyles.PADDING_BOTTOM;

        // Уникнення ділення на нуль
        if (priceRange === 0) {
            return this.ctx.canvas.height / 2; // Якщо всі ціни однакові, малюємо посередині
        }

        // Розрахунок позиції Y
        return this.ctx.canvas.height - ChartStyles.PADDING_BOTTOM -
            ((price - minPrice) / priceRange) * yRange;
    }
}
