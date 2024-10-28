import {Bar} from "../types/bar.type";

export class LabelRenderer {
    constructor(
        private ctx: CanvasRenderingContext2D,
        private padding: number,
        private bottomPadding: number
    ) {}

    public draw(
        bars: Bar[],
        minPrice: number,
        maxPrice: number,
        offsetX: number,
        barWidth: number
    ) {
        this.drawPriceLabels(minPrice, maxPrice);
        this.drawDateTimeLabels(bars, offsetX, barWidth);
    }

    private drawPriceLabels(minPrice: number, maxPrice: number) {
        const priceStep = (maxPrice - minPrice) / 10;

        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "black";

        for (let i = 0; i <= 10; i++) {
            const price = minPrice + i * priceStep;
            const y = this.priceToY(price, minPrice, maxPrice);
            this.ctx.fillText(price.toFixed(3), 5, y + 3); // Відступ зліва
        }
    }

    private drawDateTimeLabels(bars: Bar[], offsetX: number, barWidth: number) {
        const firstBarIndex = Math.floor(offsetX / barWidth);
        const visibleBars = Math.ceil((this.ctx.canvas.width - this.padding) / barWidth);
        const step = Math.max(1, Math.floor(visibleBars / 10));

        for (let i = 0; i < visibleBars; i += step) {
            const bar = bars[firstBarIndex + i];
            const x = this.padding + i * barWidth - (offsetX % barWidth);

            const date = new Date(bar.time);
            const dateString = date.toLocaleDateString("ru-RU");
            const timeString = date.toLocaleTimeString("ru-RU");

            const textWidth = Math.max(
                this.ctx.measureText(dateString).width,
                this.ctx.measureText(timeString).width
            );

            const centeredX = x - textWidth / 2;

            this.ctx.fillText(dateString, centeredX, this.ctx.canvas.height - this.bottomPadding + 12);
            this.ctx.fillText(timeString, centeredX, this.ctx.canvas.height - this.bottomPadding + 27);
        }
    }

    private priceToY(price: number, minPrice: number, maxPrice: number): number {
        const priceRange = maxPrice - minPrice;
        const canvasHeight = this.ctx.canvas.height;
        return canvasHeight - this.padding -
            ((price - minPrice) / priceRange) * (canvasHeight - this.padding - 30);
    }
}