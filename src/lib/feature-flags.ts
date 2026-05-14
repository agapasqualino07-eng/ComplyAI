/**
 * Feature flags lette da env vars pubbliche (NEXT_PUBLIC_*).
 * Sono valutate sia a build-time (statiche) che a runtime (Server Components),
 * a seconda del contesto in cui vengono importate.
 */

/**
 * `false` quando `NEXT_PUBLIC_SHOW_AUTH=false` su Vercel.
 * Quando false: la landing nasconde tutti i CTA login/signup/checkout e le
 * route protette redirigono alla homepage. Pensato per presentazioni dove
 * vogliamo mostrare solo i contenuti pubblici/legali.
 */
export const SHOW_AUTH: boolean = process.env.NEXT_PUBLIC_SHOW_AUTH !== "false";
