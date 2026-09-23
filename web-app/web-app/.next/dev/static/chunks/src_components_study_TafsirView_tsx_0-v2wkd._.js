(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/study/TafsirView.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TafsirView",
    ()=>TafsirView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.3.0_@babel+core@7.29.7_supports-color@10.2.2__@opentelemetry+api@1.9.1_@types+n_4980c8738f84335d85802b1b8bb311de/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.3.0_@babel+core@7.29.7_supports-color@10.2.2__@opentelemetry+api@1.9.1_@types+n_4980c8738f84335d85802b1b8bb311de/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$24$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@1.24.0_react@19.2.4/node_modules/lucide-react/dist/esm/icons/rotate-ccw.mjs [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$studyApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/studyApi.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ReaderSettingsContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/ReaderSettingsContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$study$2f$StudyPanelSkeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/study/StudyPanelSkeleton.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$study$2f$TafsirBookSelector$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/study/TafsirBookSelector.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
function TafsirView({ verseKey }) {
    _s();
    const { tafsirSlug } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ReaderSettingsContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useReaderSettings"])();
    // Bumping this refetches after an error (the cache evicts failed loads)
    const [attempt, setAttempt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const requestKey = `${tafsirSlug}:${verseKey}:${attempt}`;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TafsirView.useEffect": ()=>{
            let cancelled = false;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$studyApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTafsir"])(tafsirSlug, verseKey).then({
                "TafsirView.useEffect": (content)=>{
                    if (!cancelled) setResult({
                        requestKey,
                        content
                    });
                }
            }["TafsirView.useEffect"]).catch({
                "TafsirView.useEffect": ()=>{
                    if (!cancelled) setResult({
                        requestKey,
                        content: null
                    });
                }
            }["TafsirView.useEffect"]);
            return ({
                "TafsirView.useEffect": ()=>{
                    cancelled = true;
                }
            })["TafsirView.useEffect"];
        }
    }["TafsirView.useEffect"], [
        tafsirSlug,
        verseKey,
        requestKey
    ]);
    const retry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TafsirView.useCallback[retry]": ()=>setAttempt({
                "TafsirView.useCallback[retry]": (n)=>n + 1
            }["TafsirView.useCallback[retry]"])
    }["TafsirView.useCallback[retry]"], []);
    const activeBook = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$studyApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTafsirResource"])(tafsirSlug);
    const isRtl = (activeBook?.language ?? "").toLowerCase() === "arabic";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$study$2f$TafsirBookSelector$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TafsirBookSelector"], {}, void 0, false, {
                fileName: "[project]/src/components/study/TafsirView.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            result?.requestKey !== requestKey ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$study$2f$StudyPanelSkeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StudyPanelSkeleton"], {}, void 0, false, {
                fileName: "[project]/src/components/study/TafsirView.tsx",
                lineNumber: 54,
                columnNumber: 9
            }, this) : result.content === null ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-start gap-3 rounded-lg border border-border bg-muted/40 p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-muted-foreground",
                        children: "Couldn't load the tafsir. Check your connection and try again."
                    }, void 0, false, {
                        fileName: "[project]/src/components/study/TafsirView.tsx",
                        lineNumber: 57,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: retry,
                        className: "flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors duration-[120ms] hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$24$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                className: "size-3",
                                strokeWidth: 2
                            }, void 0, false, {
                                fileName: "[project]/src/components/study/TafsirView.tsx",
                                lineNumber: 65,
                                columnNumber: 13
                            }, this),
                            "Retry"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/study/TafsirView.tsx",
                        lineNumber: 60,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/study/TafsirView.tsx",
                lineNumber: 56,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TafsirBody, {
                content: result.content,
                isRtl: isRtl
            }, void 0, false, {
                fileName: "[project]/src/components/study/TafsirView.tsx",
                lineNumber: 70,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/study/TafsirView.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
_s(TafsirView, "TzL4UEFFfVdgHJVPsGfBBEaOB7I=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ReaderSettingsContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useReaderSettings"]
    ];
});
_c = TafsirView;
function TafsirBody({ content, isRtl }) {
    const resource = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$studyApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTafsirResource"])(content.slug);
    const bookName = content.resourceName || resource?.name || content.slug;
    const hasText = content.text.trim().length > 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-3 flex flex-wrap items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-medium text-muted-foreground",
                        children: bookName
                    }, void 0, false, {
                        fileName: "[project]/src/components/study/TafsirView.tsx",
                        lineNumber: 90,
                        columnNumber: 9
                    }, this),
                    content.coveredKeys.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "rounded-full bg-accent px-2 py-0.5 text-[0.6875rem] text-muted-foreground",
                        children: [
                            "Covers ",
                            content.coveredKeys[0],
                            "–",
                            content.coveredKeys[content.coveredKeys.length - 1].split(":")[1]
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/study/TafsirView.tsx",
                        lineNumber: 92,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/study/TafsirView.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this),
            hasText ? // Safe: sanitized server-side in /api/tafsir (single choke point)
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("study-prose", isRtl && "text-right"),
                dir: isRtl ? "rtl" : "ltr",
                lang: isRtl ? "ar" : "en",
                dangerouslySetInnerHTML: {
                    __html: content.text
                }
            }, void 0, false, {
                fileName: "[project]/src/components/study/TafsirView.tsx",
                lineNumber: 101,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$0_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$10$2e$2$2e$2_$5f40$opentelemetry$2b$api$40$1$2e$9$2e$1_$40$types$2b$n_4980c8738f84335d85802b1b8bb311de$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-muted-foreground",
                children: [
                    "No commentary is available for this ayah in ",
                    bookName,
                    "."
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/study/TafsirView.tsx",
                lineNumber: 108,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/study/TafsirView.tsx",
        lineNumber: 88,
        columnNumber: 5
    }, this);
}
_c1 = TafsirBody;
var _c, _c1;
__turbopack_context__.k.register(_c, "TafsirView");
__turbopack_context__.k.register(_c1, "TafsirBody");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/study/TafsirView.tsx [app-client] (ecmascript, next/dynamic entry)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/study/TafsirView.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_components_study_TafsirView_tsx_0-v2wkd._.js.map