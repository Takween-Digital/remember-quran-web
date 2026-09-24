"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, BookOpen, Zap } from "lucide-react"
import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { useUI } from "@/context/UIContext"
import { useChapters } from "@/context/ChaptersContext"
import { useSurahContentOptional } from "@/context/SurahContentContext"

const AYAH_KEY_RE = /^(\d+):(\d+)$/

export function SurahCommandDialog() {
  const { commandOpen, setCommandOpen } = useUI()
  const chapters = useChapters()
  const surahContent = useSurahContentOptional()
  const router = useRouter()
  const [input, setInput] = useState("")

  function handleSelect(href: string) {
    setCommandOpen(false)
    setInput("")

    const surahMatch = /^\/(\d+)$/.exec(href)
    if (surahContent && surahMatch) {
      surahContent.loadSurah(Number(surahMatch[1]))
      return
    }

    router.push(href, { scroll: false })
  }

  function handleOpenChange(open: boolean) {
    setCommandOpen(open)
    if (!open) setInput("")
  }

  const ayahMatch = AYAH_KEY_RE.exec(input.trim())
  const trimmedInput = input.trim()
  const showSearch = !ayahMatch && trimmedInput.length >= 2

  return (
    <CommandDialog
      open={commandOpen}
      onOpenChange={handleOpenChange}
      title="Search the Quran"
      description="Search a word, or jump to a surah name, number, or 2:255"
    >
      <Command shouldFilter={!ayahMatch}>
        <CommandInput
          placeholder="Search the Quran…"
          value={input}
          onValueChange={setInput}
        />
        <CommandList>
          <CommandEmpty>
            {trimmedInput.length === 0
              ? "Search a word, or type a surah name, number, or 2:255."
              : "No surah found."}
          </CommandEmpty>

          {showSearch ? (
            <CommandGroup heading="Search">
              <CommandItem
                value={`search:${trimmedInput}`}
                onSelect={() =>
                  handleSelect(`/search?q=${encodeURIComponent(trimmedInput)}`)
                }
              >
                <Search className="size-4 text-primary/60" strokeWidth={1.5} />
                <span>Search for</span>
                <span className="font-medium text-foreground">
                  &ldquo;{trimmedInput}&rdquo;
                </span>
              </CommandItem>
            </CommandGroup>
          ) : null}

          {ayahMatch ? (
            <CommandGroup heading="Navigate">
              <CommandItem
                value={input}
                onSelect={() => handleSelect(`/${ayahMatch[1]}/${ayahMatch[2]}`)}
              >
                <Zap className="size-4 text-primary/60" strokeWidth={1.5} />
                <span className="text-primary font-medium">{input.trim()}</span>
                <span className="ms- text-xs text-muted-foreground">jump to ayah</span>
              </CommandItem>
            </CommandGroup>
          ) : null}

          {!ayahMatch && trimmedInput.length > 0 ? (
            <CommandGroup heading="Surahs">
              {chapters.map((chapter) => (
                <CommandItem
                  key={chapter.id}
                  value={`${chapter.id} ${chapter.name_simple} ${chapter.name_arabic}`}
                  onSelect={() => handleSelect(`/${chapter.id}`)}
                >
                  <BookOpen className="size-4 text-primary/60" strokeWidth={1.5} />
                  <div className="flex flex-1 items-center gap-3 min-w-0">
                    <span className="tabular-nums text-xs text-muted-foreground/70 w-5 text-end shrink-0 font-mono">
                      {chapter.id}
                    </span>
                    <span className="truncate flex-1">{chapter.name_simple}</span>
                  </div>
                  <span
                    className="font-arabic text-sm leading-none text-muted-foreground/70 shrink-0"
                    dir="rtl"
                    lang="ar"
                  >
                    {chapter.name_arabic}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
