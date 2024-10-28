import { ChartStyles } from "../utils/ChartStyles";

/**
 * AxesRenderer – відповідає за відображення осей X та Y на графіку.
 */
export class AxesRenderer {
    constructor(
        private ctx: CanvasRenderingContext2D, // Контекст малювання
        private width: number, // Ширина графіка
        private height: number, // Висота графіка
        private padding: number // Відступ для осей
    ) {}

    /**
     * Основний метод для малювання осей X та Y.
     */
    public draw() {
        this.ctx.strokeStyle = ChartStyles.AXES_COLOR; // Використовуємо стиль для кольору осей
        this.ctx.lineWidth = 1;

        this.drawYAxis(); // Малюємо вісь Y
        this.drawXAxis(); // Малюємо вісь X
    }

    /**
     * Малювання осі Y (ціни).
     */
    private drawYAxis() {
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding, 0); // Починаємо з верхнього краю
        this.ctx.lineTo(this.padding, this.height - this.padding); // До нижнього краю
        this.ctx.stroke();
    }

    /**
     * Малювання осі X (часу).
     */
    private drawXAxis() {
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height - this.padding); // Починаємо з лівого краю
        this.ctx.lineTo(this.width, this.height - this.padding); // До правого краю
        this.ctx.stroke();
    }
}
