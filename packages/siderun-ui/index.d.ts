/** Options for configuring the SideRun visual effect. */
export interface SideRunOptions {
  /** Corner radius in pixels (default 8) */
  radius?: number;
  /** Tail length used in runner geometry (default 10) */
  tail?: number;
  /** Gap between segments (default 10) */
  gap?: number;
  /** Easing factor per frame (0..1), higher is snappier (default 0.1) */
  ease?: number;
  /** Axis to track for hover positioning ('x' | 'y'), default 'x' */
  hoverAxis?: 'x' | 'y';
  /** Start position anchors */
  isBottom?: boolean;
  isTop?: boolean;
  /** If true, track live pointer position over the host (default false) */
  trackPointer?: boolean;
  /** Extra margin around host box for the effect wrapper (default 11) */
  margin?: number;
}

 /** Cleanup function returned by init() */
 export type SideRunCleanup = () => void;

 /**
  * Initialize the SideRun effect for a host element.
  * Returns a cleanup function to remove the effect and listeners.
  */
 export function init(hostEl: HTMLElement, options?: SideRunOptions): SideRunCleanup;

 /**
  * UMD global typings (optional) for using via <script> tag.
  * Consumers in TS may augment the global namespace if needed.
  */
 declare global {
   interface Window {
     SideRun?: {
       init: (hostEl: HTMLElement, options?: SideRunOptions) => SideRunCleanup;
     };
   }
 }

export as namespace SideRun;
