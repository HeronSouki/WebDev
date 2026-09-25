// Minimal stand-in for Framer's "framer" module so the components run outside Framer.
// Only what the Elastic components use is implemented.
import * as React from "react"

export const ControlType = {
    Boolean: "boolean",
    Number: "number",
    String: "string",
    Color: "color",
    Enum: "enum",
    Array: "array",
    Object: "object",
    Image: "image",
    ResponsiveImage: "responsiveimage",
    Link: "link",
    File: "file",
    Font: "font",
} as const

export const RenderTarget = {
    canvas: "CANVAS",
    export: "EXPORT",
    thumbnail: "THUMBNAIL",
    preview: "PREVIEW",
    current: (): string => ((globalThis as any).__framerRenderTarget as string) || "PREVIEW",
    hasRestrictions: () => false,
}

export function addPropertyControls(component: any, controls: Record<string, any>) {
    component.propertyControls = controls
}

function defaultsOf(controls: Record<string, any>): Record<string, any> {
    const out: Record<string, any> = {}
    for (const [key, control] of Object.entries(controls)) {
        if (control && "defaultValue" in control) out[key] = control.defaultValue
        else if (control?.type === "array") out[key] = []
        else if (control?.type === "object") out[key] = defaultsOf(control.controls ?? {})
    }
    return out
}

/** Renders a code component with the defaults declared in its property controls. */
export function withDefaults<P>(Component: React.ComponentType<P>) {
    const defaults = defaultsOf((Component as any).propertyControls ?? {})
    return function WithDefaults(props: Partial<P>) {
        return <Component {...(defaults as P)} {...props} />
    }
}
