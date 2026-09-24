import { getChapters } from "@/lib/quranApi"
import { HeroSection } from "./HeroSection"
import { AyahOfTheDayCard } from "./AyahOfTheDayCard"
import { IslamicHistoryCard } from "./IslamicHistoryCard"
import { QuickAccess } from "./QuickAccess"
import { SurahExplorer } from "./SurahExplorer"

export async function SurahListPage() {
  let chapters
  let error: Error | null = null

  try {
    chapters = await getChapters()
  } catch (err) {
    error = err instanceof Error ? err : new Error(String(err))
    console.error("Failed to fetch chapters:", error)
    chapters = null
  }

  return (
    <div className="flex flex-col">
      {/* Full width hero section */}
      <HeroSection />

      <div className="site-shell space-y-10 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Bento Grid layout matching the new design */}
        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-5">
          {/* Ayah of the day taking 3/5 width on desktop */}
          <div className="lg:col-span-3">
            <AyahOfTheDayCard />
          </div>

          {/* Right column taking 2/5 width, stacking vertically */}
          <div className="flex flex-col gap-2.5 lg:col-span-2">
            <div className="flex-1">
              <IslamicHistoryCard />
            </div>
            <div className="flex-1">
              <QuickAccess className="grid-cols-2 lg:grid-cols-2 lg:grid-rows-2" />
            </div>
          </div>
        </div>

        {chapters ? (
          <SurahExplorer chapters={chapters} />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg text-muted-foreground mb-2">Unable to load Surah list</p>
            {error && (
              <p className="text-sm text-destructive max-w-md">
                {error.message || "Failed to fetch data from API"}
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
