export class GridRenderer {
    constructor(
        private ctx: CanvasRenderingContext2D,
        private width: number,
        private height: number,
        private padding: number
    ) {}

    public draw(minPrice: number, maxPrice: number, offsetX: number, barWidth: number) {
        this.ctx.strokeStyle = "#e0e0e0";
        this.ctx.lineWidth = 0.5;

        this.drawHorizontalLines(minPrice, maxPrice);
        this.drawVerticalLines(offsetX, barWidth);
    }

    private drawHorizontalLines(minPrice: number, maxPrice: number) {
        const priceStep = (maxPrice - minPrice) / 10;

        this.ctx.beginPath();
        for (let i = 0; i <= 10; i++) {
            const y = this.priceToY(minPrice + i * priceStep, minPrice, maxPrice);
            this.ctx.moveTo(this.padding, y);
            this.ctx.lineTo(this.width, y);
        }
        this.ctx.stroke();
    }

    private drawVerticalLines(offsetX: number, barWidth: number) {
        const visibleBars = Math.ceil((this.width - this.padding) / barWidth);

        this.ctx.beginPath();
        for (let i = 0; i <= visibleBars; i++) {
            const x = this.padding + i * barWidth - (offsetX % barWidth);
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height - this.padding);
        }
        this.ctx.stroke();
    }

    private priceToY(price: number, minPrice: number, maxPrice: number): number {
        const priceRange = maxPrice - minPrice;
        return this.height - this.padding -
            ((price - minPrice) / priceRange) * (this.height - this.padding);
    }
}
