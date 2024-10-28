export class MouseHandler {
    private isDragging: boolean = false; // Стан перетягування
    private lastMouseX: number = 0; // Остання позиція миші по осі X

    constructor(
        private canvas: HTMLCanvasElement, // Елемент canvas
        private onDrag: (dx: number) => void, // Колбек для зміщення
        private onZoom: (zoomDelta: number) => void // Колбек для масштабування
    ) {
        // Прив'язка подій миші
        this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
        this.canvas.addEventListener("wheel", this.onWheel.bind(this)); // Масштабування колесом миші
    }

    private onMouseDown(event: MouseEvent) {
        this.isDragging = true; // Активуємо перетягування
        this.lastMouseX = event.clientX; // Запам'ятовуємо позицію миші
        window.addEventListener("mousemove", this.onMouseMove.bind(this));
        window.addEventListener("mouseup", this.onMouseUp.bind(this));
    }

    private onMouseMove(event: MouseEvent) {
        if (!this.isDragging) return; // Якщо не перетягуємо, виходимо

        const dx = event.clientX - this.lastMouseX; // Зміщення по X
        this.onDrag(dx); // Викликаємо колбек для зміщення
        this.lastMouseX = event.clientX; // Оновлюємо останню позицію миші
    }

    private onMouseUp() {
        this.isDragging = false; // Завершуємо перетягування
        window.removeEventListener("mousemove", this.onMouseMove.bind(this));
        window.removeEventListener("mouseup", this.onMouseUp.bind(this));
    }

    private onWheel(event: WheelEvent) {
        const zoomDelta = event.deltaY > 0 ? -0.1 : 0.1; // Зміна масштабу
        this.onZoom(zoomDelta); // Викликаємо колбек для масштабування
    }
}
