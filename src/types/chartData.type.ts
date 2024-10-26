import {Bar} from "./bar.type";

export interface ChartData {
    bars: Bar[];
    chunkStart: number;
}