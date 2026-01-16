import { ref } from "vue";

export class DragHelper {


    public settingRoot = ref<HTMLElement | null>(null);
    private isDragging = false;
    private offsetX = 0;
    private offsetY = 0;

    constructor(settingRoot: any) {
        this.settingRoot = settingRoot;
    }

    public startDrag = (event: MouseEvent) => {
        if (!this.settingRoot.value) return;
        this.isDragging = true;
        this.offsetX = event.clientX - this.settingRoot.value.offsetLeft;
        this.offsetY = event.clientY - this.settingRoot.value.offsetTop;

        document.addEventListener('mousemove', this.onDrag);
        document.addEventListener('mouseup', this.stopDrag);
    };

    public onDrag = (event: MouseEvent) => {
        if (!this.isDragging || !this.settingRoot.value) return;
        this.settingRoot.value.style.left = `${event.clientX - this.offsetX}px`;
        this.settingRoot.value.style.top = `${event.clientY - this.offsetY}px`;
    };

    public stopDrag = () => {
        this.isDragging = false;
        document.removeEventListener('mousemove', this.onDrag);
        document.removeEventListener('mouseup', this.stopDrag);
    };
}