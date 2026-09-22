import { getSessionUserId } from "@/lib/auth/session"
import { privateJson } from "@/lib/auth/api-response"
import { getSurahReadRanges } from "@/lib/db/progress"
import { getAyahCount } from "@/lib/quran/verse-key"

export async function GET(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const url = new URL(request.url)
  const surahIdStr = url.searchParams.get("surahId")
  if (!surahIdStr) {
    return privateJson({ error: "Missing surahId parameter." }, 400)
  }

  const surahId = parseInt(surahIdStr, 10)
  if (!Number.isInteger(surahId) || surahId < 1 || surahId > 114) {
    return privateJson({ error: "Invalid surahId." }, 400)
  }

  const count = getAyahCount(surahId)
  if (count === null) {
    return privateJson({ error: "Invalid surah." }, 400)
  }

  const ranges = await getSurahReadRanges(userId, surahId)
  return privateJson({ ranges })
}
