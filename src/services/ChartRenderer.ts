import { Bar } from "../types/bar.type";
import {DateUtils} from "../utils/DateUtils";
import {ChartStyles} from "../utils/ChartStyles";

export class ChartRenderer {
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private bars: Bar[];
    private zoomLevel: number = 1;
    private offsetX: number = 0;
    private isDragging: boolean = false;
    private lastMouseX: number = 0;

    private readonly padding: number = 50; // Отступ для осей и меток
    private readonly topPadding: number = 20;
    private readonly bottomPadding: number = 30;

    constructor(ctx: CanvasRenderingContext2D, width: number, height: number, bars: Bar[]) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.bars = bars;

        // Привязываем события
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
    }


    // === Методы управления мышью ===
    public onMouseDown(event: MouseEvent) {
        this.isDragging = true;
        this.lastMouseX = event.clientX;
        window.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("mouseup", this.onMouseUp);
    }

    private onMouseMove(event: MouseEvent) {
        if (!this.isDragging) return;
        const dx = event.clientX - this.lastMouseX;
        this.setOffset(this.offsetX - dx); // Смещение графика
        this.lastMouseX = event.clientX;
    }

    private onMouseUp() {
        this.isDragging = false;
        window.removeEventListener("mousemove", this.onMouseMove);
        window.removeEventListener("mouseup", this.onMouseUp);
    }

    // === Методы зума и смещения ===
    public getZoomLevel(): number {
        return this.zoomLevel;
    }

    public setZoomLevel(newZoomLevel: number) {
        this.zoomLevel = Math.max(0.5, Math.min(newZoomLevel, 5)); // Ограничение зума
        this.draw();
    }

    public setOffset(newOffset: number) {
        const maxOffset = Math.max(0, this.bars.length * this.getBarWidth() - (this.width - this.padding));
        this.offsetX = Math.max(0, Math.min(newOffset, maxOffset)); // Ограничение смещения
        this.draw();
    }

    public draw() {
        this.clearCanvas();
        const { minPrice, maxPrice } = this.getVisiblePriceRange();
        this.drawGrid(minPrice, maxPrice);
        this.drawBars(minPrice, maxPrice);
        this.drawAxes();
        this.drawLabels(minPrice, maxPrice);
    }

    private clearCanvas() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    private getVisiblePriceRange() {
        const barWidth = this.getBarWidth();
        const firstBarIndex = Math.floor(this.offsetX / barWidth);
        const visibleBars = Math.min(this.bars.length - firstBarIndex, Math.ceil((this.width - this.padding) / barWidth));

        const visiblePrices = this.bars.slice(firstBarIndex, firstBarIndex + visibleBars);
        const maxPrice = Math.max(...visiblePrices.map(bar => bar.high));
        const minPrice = Math.min(...visiblePrices.map(bar => bar.low));

        const pricePadding = (maxPrice - minPrice) * 0.05 || 0.01;
        return { minPrice: minPrice - pricePadding, maxPrice: maxPrice + pricePadding };
    }

    private getBarWidth(): number {
        return 10 * this.zoomLevel;
    }

    private drawGrid(minPrice: number, maxPrice: number) {
        this.ctx.strokeStyle = ChartStyles.GRID_COLOR;
        this.ctx.lineWidth = 0.5;

        this.drawHorizontalLines(minPrice, maxPrice);
        this.drawVerticalLines();
    }

    private drawHorizontalLines(minPrice: number, maxPrice: number) {
        const priceStep = (maxPrice - minPrice) / 10;
        this.ctx.beginPath();
        for (let i = 0; i <= 10; i++) {
            const y = this.priceToY(minPrice + i * priceStep, minPrice, maxPrice);
            this.drawLine(this.padding, y, this.width, y);
        }
        this.ctx.stroke();
    }

    private drawVerticalLines() {
        const barWidth = this.getBarWidth();
        const visibleBars = Math.ceil((this.width - this.padding) / barWidth);

        this.ctx.beginPath();
        for (let i = 0; i <= visibleBars; i++) {
            const x = this.padding + i * barWidth - (this.offsetX % barWidth);
            this.drawLine(x, 0, x, this.height - this.padding);
        }
        this.ctx.stroke();
    }

    private drawLine(x1: number, y1: number, x2: number, y2: number) {
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
    }

    private drawBars(minPrice: number, maxPrice: number) {
        const barWidth = this.getBarWidth();
        const firstBarIndex = Math.floor(this.offsetX / barWidth);
        const visibleBars = Math.min(this.bars.length - firstBarIndex, Math.ceil((this.width - this.padding) / barWidth));

        for (let i = 0; i < visibleBars; i++) {
            const bar = this.bars[firstBarIndex + i];
            const x = this.padding + i * barWidth - (this.offsetX % barWidth);

            this.drawCandle(bar, x, barWidth, minPrice, maxPrice);
        }
    }

    private drawCandle(bar: Bar, x: number, barWidth: number, minPrice: number, maxPrice: number) {
        const yOpen = this.priceToY(bar.open, minPrice, maxPrice);
        const yClose = this.priceToY(bar.close, minPrice, maxPrice);
        const yHigh = this.priceToY(bar.high, minPrice, maxPrice);
        const yLow = this.priceToY(bar.low, minPrice, maxPrice);

        const candleColor = bar.close >= bar.open ? ChartStyles.POSITIVE_CANDLE_COLOR : ChartStyles.NEGATIVE_CANDLE_COLOR;

        // Рисуем "хвост" свечи
        this.ctx.strokeStyle = candleColor;
        this.ctx.beginPath();
        this.ctx.lineWidth = 0.7;
        this.drawLine(x + barWidth / 2, yHigh, x + barWidth / 2, yLow);
        this.ctx.stroke();

        // Рисуем тело свечи
        const bodyWidth = Math.max(3, barWidth * 0.7);
        this.ctx.fillStyle = candleColor;
        this.ctx.fillRect(x + (barWidth - bodyWidth) / 2, Math.min(yOpen, yClose), bodyWidth, Math.abs(yClose - yOpen));
    }

    // === Отрисовка осей ===
    private drawAxes() {
        this.setStrokeStyle("black", 1);

        // Левый блок для цен
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.padding, this.height);

        // Ось Y
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding, 0);
        this.ctx.lineTo(this.padding, this.height - this.padding);
        this.ctx.stroke();

        // Ось X
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height - this.padding);
        this.ctx.lineTo(this.width, this.height - this.padding);
        this.ctx.stroke();
    }

    // === Отрисовка меток на осях ===
    private drawLabels(minPrice: number, maxPrice: number) {
        const priceStep = (maxPrice - minPrice) / 10;
        this.setFontStyle("12px Arial", "black");

        // Метки цен
        for (let i = 0; i <= 10; i++) {
            const price = minPrice + i * priceStep;
            const y = this.priceToY(price, minPrice, maxPrice);
            this.ctx.fillText(price.toFixed(3), 5, y + 3);
        }

        // Метки дат и времени
        const barWidth = this.getBarWidth();
        const firstBarIndex = Math.floor(this.offsetX / barWidth);
        const visibleBars = Math.ceil((this.width - this.padding) / barWidth);
        const step = Math.max(1, Math.floor(visibleBars / 10));

        for (let i = 0; i < visibleBars; i += step) {
            const bar = this.bars[firstBarIndex + i];
            const x = this.padding + i * barWidth - (this.offsetX % barWidth);

            const date = new Date(bar.time);
            const dateString = date.toLocaleDateString("ru-RU");
            const timeString = date.toLocaleTimeString("ru-RU");

            const textWidth = Math.max(this.ctx.measureText(dateString).width, this.ctx.measureText(timeString).width);
            const centeredX = x - textWidth / 2;

            this.ctx.fillText(dateString, centeredX, this.height - this.bottomPadding + 12);
            this.ctx.fillText(timeString, centeredX, this.height - this.bottomPadding + 27);
        }
    }

    // === Вспомогательные методы ===
    private setStrokeStyle(color: string, width: number) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
    }

    private setFontStyle(font: string, color: string) {
        this.ctx.font = font;
        this.ctx.fillStyle = color;
    }

    private priceToY(price: number, minPrice: number, maxPrice: number): number {
        const priceRange = maxPrice - minPrice;
        const y = ((price - minPrice) / priceRange) * (this.height - this.padding - this.topPadding - this.bottomPadding);
        return this.height - this.padding - this.bottomPadding - y;
    }

}
