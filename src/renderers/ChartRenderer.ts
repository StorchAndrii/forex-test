import { Bar } from "../types/bar.type";
import { GridRenderer } from "./GridRenderer";
import { BarRenderer } from "./BarRenderer";
import { AxesRenderer } from "./AxesRenderer";
import { LabelRenderer } from "./LabelRenderer";
import { MouseHandler } from "../utils/MouseHandler";
import {ChartStyles} from "../utils/ChartStyles";


export class ChartRenderer {
    private zoomLevel: number = 1;
    private offsetX: number = 0;

    // Ініціалізація підрендерерів
    private gridRenderer: GridRenderer;
    private barRenderer: BarRenderer;
    private axesRenderer: AxesRenderer;
    private labelRenderer: LabelRenderer;

    constructor(
        private ctx: CanvasRenderingContext2D, // 2D-контекст для малювання
        private width: number, // Ширина полотна
        private height: number, // Висота полотна
        private bars: Bar[], // Дані для побудови графіка
        canvas: HTMLCanvasElement, // HTML-елемент canvas
        private padding: number = ChartStyles.PADDING_TOP // Відступи для графіка
    ) {
        // Ініціалізуємо всі рендерери
        this.gridRenderer = new GridRenderer(ctx, width, height, 50);
        this.barRenderer = new BarRenderer(ctx);
        this.axesRenderer = new AxesRenderer(ctx, width, height, 50);
        this.labelRenderer = new LabelRenderer(ctx, 50, 30);

        // Ініціалізуємо обробник подій миші з колбеками для зсуву і масштабу
        new MouseHandler(
            canvas,
            this.handleDrag.bind(this), // Колбек для зміщення графіка
            this.handleZoom.bind(this) // Колбек для масштабування
        );
    }

    // === Обробка зміщення при перетягуванні ===
    private handleDrag(dx: number) {
        this.setOffset(this.offsetX - dx); // Оновлюємо зсув по осі X
    }

    // === Обробка зміни масштабу ===
    private handleZoom(zoomDelta: number) {
        this.setZoomLevel(this.zoomLevel + zoomDelta); // Оновлюємо рівень зуму
    }

    public getZoomLevel(): number {
        return this.zoomLevel;
    }
    /**
     * Встановлює новий рівень зуму та перемальовує графік.
     */
    public setZoomLevel(newZoomLevel: number) {
        this.zoomLevel = Math.max(0.5, Math.min(newZoomLevel, 5)); // Обмеження масштабу
        this.draw(); // Перемальовуємо графік після зміни масштабу
    }

    /**
     * Встановлює новий зсув графіка та викликає перемальовування.
     */
    public setOffset(newOffset: number) {
        const maxOffset = Math.max(
            0,
            this.bars.length * this.getBarWidth() - (this.width - 50)
        );
        this.offsetX = Math.max(0, Math.min(newOffset, maxOffset)); // Обмеження зсуву
        this.draw(); // Перемальовуємо графік після зсуву
    }

    /**
     * Головний метод для малювання графіка.
     */
    public draw() {
        this.ctx.clearRect(0, 0, this.width, this.height); // Очищення полотна

        const { minPrice, maxPrice } = this.getVisiblePriceRange(); // Отримуємо видимий діапазон цін

        // Використовуємо підрендерери для побудови графіка
        this.gridRenderer.draw(minPrice, maxPrice, this.offsetX, this.getBarWidth());
        this.barRenderer.draw(this.bars, minPrice, maxPrice, this.offsetX, this.getBarWidth(), 50);
        this.axesRenderer.draw(); // Малюємо осі
        this.labelRenderer.draw(this.bars, minPrice, maxPrice, this.offsetX, this.getBarWidth()); // Малюємо мітки
    }

    /**
     * Визначає діапазон видимих цін для поточного зсуву і масштабу.
     */
    private getVisiblePriceRange() {
        const firstBarIndex = Math.floor(this.offsetX / this.getBarWidth());
        const visibleBars = Math.min(this.bars.length - firstBarIndex, Math.ceil((this.width - this.padding) / this.getBarWidth()));

        const visiblePrices = this.bars.slice(firstBarIndex, firstBarIndex + visibleBars);
        const maxPrice = Math.max(...visiblePrices.map(bar => bar.high));
        const minPrice = Math.min(...visiblePrices.map(bar => bar.low));

        const pricePadding = (maxPrice - minPrice) * 0.05 || 0.01;
        return { minPrice: minPrice - pricePadding, maxPrice: maxPrice + pricePadding };
    }


    /**
     * Розраховує ширину одного бару з урахуванням масштабу.
     */
    private getBarWidth(): number {
        return 10 * this.zoomLevel; // Ширина бару зі зміною зуму
    }
}
