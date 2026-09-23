(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/study/WordDetailView.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WordDetailView",
    ()=>WordDetailView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.3.0_@babel+core@7.29.7_supports-color@10.2.2__@opentelemetry+api@1.9.1_@types+n_4980c8738f84335d85802b1b8bb311de/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.3.0_@babel+core@7.29.7_supports-color@10.2.2__@opentelemetry+api@1.9.1_@types+n_4980c8738f84335d85802b1b8bb311de/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$24$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@1.24.0_react@19.2.4/node_modules/lucide-react/dist/esm/icons/rotate-ccw.mjs [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$morphologyApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/morphologyApi.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$morphologyLabels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/morphologyLabels.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function WordDetailView({ verseKey, wordPosition }) {
    _s();
    const [entry, setEntry] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("loading");
    // Reset during render (not the effect below) when the word changes — the
    // React-endorsed way to derive state from props without an extra
    // render+effect round trip. The fetch effect still owns the async part.
    const currentKey = `${verseKey}:${wordPosition}`;
    const [trackedKey, setTrackedKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(currentKey);
    if (currentKey !== trackedKey) {
        setTrackedKey(currentKey);
        setStatus("loading");
        setEntry(null);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WordDetailView.useEffect": ()=>{
            const surahId = Number(verseKey.split(":")[0]);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$morphologyApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["prefetchSurahMorphology"])(surahId);
            let cancelled = false;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$morphologyApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getWordMorphology"])(verseKey, wordPosition).then({
                "WordDetailView.useEffect": (result)=>{
                    if (cancelled) return;
                    setEntry(result);
                    setStatus(result ? "done" : "unavailable");
                }
            }["WordDetailView.useEffect"]).catch({
                "WordDetailView.useEffect": ()=>{
                    if (!cancelled) setStatus("error");
                }
            }["WordDetailView.useEffect"]);
            return ({
                "WordDetailView.useEffect": ()=>{
                    cancelled = true;
                }
            })["WordDetailView.useEffect"];
        }
    }["WordDetailView.useEffect"], [
        verseKey,
        wordPosition
    ]);
    if (status === "loading") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-4",
            children: [
                80,
                60,
                100,
                50,
                70
            ].map((w, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-4 animate-pulse rounded bg-muted/60",
                    style: {
                        width: `${w}%`
                    }
                }, i, false, {
                    fileName: "[project]/src/components/study/WordDetailView.tsx",
                    lineNumber: 54,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/src/components/study/WordDetailView.tsx",
            lineNumber: 52,
            columnNumber: 7
        }, this);
    }
    if (status === "error") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center gap-3 py-8 text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-muted-foreground",
                    children: "Failed to load grammar data."
                }, void 0, false, {
                    fileName: "[project]/src/components/study/WordDetailView.tsx",
                    lineNumber: 67,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: ()=>setStatus("loading"),
                    className: "flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent/70",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$24$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                            className: "size-3",
                            strokeWidth: 2
                        }, void 0, false, {
                            fileName: "[project]/src/components/study/WordDetailView.tsx",
                            lineNumber: 73,
                            columnNumber: 11
                        }, this),
                        " Retry"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/study/WordDetailView.tsx",
                    lineNumber: 68,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/study/WordDetailView.tsx",
            lineNumber: 66,
            columnNumber: 7
        }, this);
    }
    if (status === "unavailable" || !entry) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "py-8 text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-muted-foreground",
                    children: "Detailed grammar is not available for this word."
                }, void 0, false, {
                    fileName: "[project]/src/components/study/WordDetailView.tsx",
                    lineNumber: 82,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-1 text-xs text-muted-foreground",
                    children: "Particles and conjunctions often lack root/lemma data."
                }, void 0, false, {
                    fileName: "[project]/src/components/study/WordDetailView.tsx",
                    lineNumber: 85,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/study/WordDetailView.tsx",
            lineNumber: 81,
            columnNumber: 7
        }, this);
    }
    const humanFeatures = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$morphologyLabels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["humanizeFeatures"])(entry.features);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between gap-4",
                children: [
                    entry.lemma && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mb-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
                                children: "Lemma"
                            }, void 0, false, {
                                fileName: "[project]/src/components/study/WordDetailView.tsx",
                                lineNumber: 100,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-arabic text-2xl leading-none text-foreground",
                                dir: "rtl",
                                lang: "ar",
                                children: entry.lemma
                            }, void 0, false, {
                                fileName: "[project]/src/components/study/WordDetailView.tsx",
                                lineNumber: 103,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/study/WordDetailView.tsx",
                        lineNumber: 99,
                        columnNumber: 11
                    }, this),
                    entry.root && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-right",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mb-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
                                children: "Root"
                            }, void 0, false, {
                                fileName: "[project]/src/components/study/WordDetailView.tsx",
                                lineNumber: 114,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-arabic text-2xl leading-none text-foreground",
                                dir: "rtl",
                                lang: "ar",
                                children: entry.root
                            }, void 0, false, {
                                fileName: "[project]/src/components/study/WordDetailView.tsx",
                                lineNumber: 117,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/study/WordDetailView.tsx",
                        lineNumber: 113,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/study/WordDetailView.tsx",
                lineNumber: 97,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
                        children: "Part of Speech"
                    }, void 0, false, {
                        fileName: "[project]/src/components/study/WordDetailView.tsx",
                        lineNumber: 130,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-foreground",
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$morphologyLabels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["humanizePOS"])(entry.pos)
                    }, void 0, false, {
                        fileName: "[project]/src/components/study/WordDetailView.tsx",
                        lineNumber: 133,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/study/WordDetailView.tsx",
                lineNumber: 129,
                columnNumber: 7
            }, this),
            humanFeatures.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
                        children: "Features"
                    }, void 0, false, {
                        fileName: "[project]/src/components/study/WordDetailView.tsx",
                        lineNumber: 141,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-1.5",
                        children: humanFeatures.map((f, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground",
                                children: f
                            }, i, false, {
                                fileName: "[project]/src/components/study/WordDetailView.tsx",
                                lineNumber: 146,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/study/WordDetailView.tsx",
                        lineNumber: 144,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/study/WordDetailView.tsx",
                lineNumber: 140,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "border-t border-border/40 pt-4 text-[10px] text-muted-foreground/60",
                children: "Source: Quranic Arabic Corpus — University of Leeds (GPL)"
            }, void 0, false, {
                fileName: "[project]/src/components/study/WordDetailView.tsx",
                lineNumber: 158,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/study/WordDetailView.tsx",
        lineNumber: 95,
        columnNumber: 5
    }, this);
}
_s(WordDetailView, "6lmHFD86U81xkGq15nF+9Qsm/70=");
_c = WordDetailView;
var _c;
__turbopack_context__.k.register(_c, "WordDetailView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/study/WordDetailView.tsx [app-client] (ecmascript, next/dynamic entry)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/study/WordDetailView.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_components_study_WordDetailView_tsx_0b56fqf._.js.map