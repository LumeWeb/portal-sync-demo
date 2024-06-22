import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import { Label } from "@radix-ui/react-label"
import React, { useState } from "react"
import { Input } from "./components/ui/input"
import type { File } from "./data.ts"
import { cn } from "./lib/utils"

const FileList = ({ files }: { files: File[] }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const showErrorDialog = (message: string) => {
    // @ts-ignore
    window?.backend?.openDialog("showErrorBox", ["Error", message])
  }

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm)
  }

  return (
    <>
      <SearchComponent searchTerm={searchTerm} onSearchChange={handleSearch} />
      <Accordion type="multiple" className="space-y-2">
        {filteredFiles.map((file, index) => (
          <AccordionItem
            key={file.key}
            value={file.key}
            className={cn(
              index % 2 === 0 ? "bg-gray-700/20" : "bg-gray-900",
              "border border-gray-800"
            )}
          >
            <AccordionTrigger className="px-4 rounded-lg hover:bg-gray-900 hover:no-underline">
              <div className="flex items-center w-full text-gray-200">
                <div className="flex items-center w-full">
                  <div
                    className={`ml-2 mr-6 w-2 h-2 rounded-full ${getHealthColor(
                      file.health
                    )}`}
                  />
                  <span className="opacity-80">{formatDate(file.modTime)}</span>
                  <span className="ml-10 text-gray-200">{file.name}</span>
                </div>
                <span className="w-24 mr-10 text-gray-400">
                  {formatSize(file.size)}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-2 text-gray-400">
              <p>
                <span className="font-semibold text-gray-300">eTag:</span>{" "}
                {file.eTag}
              </p>
              <p>
                <span className="font-semibold text-gray-300">Key:</span>{" "}
                {file.key}
              </p>
              <p>
                <span className="font-semibold text-gray-300">MIME Type:</span>{" "}
                {file.mimeType}
              </p>
              <div className="p-4 mt-2 bg-gray-800/50">
                <h4 className="mb-2 text-gray-300">
                  Slabs: {file.slabs.length}
                </h4>
                <div className="grid grid-cols-10 gap-2">
                  {file.slabs.map((slab, index) => {
                    const opacity =
                      slab.slab.health >= 0.75
                        ? "1"
                        : slab.slab.health >= 0.5
                        ? "0.75"
                        : slab.slab.health >= 0.25
                        ? "0.5"
                        : "0.25"
                    return (
                      <div
                        key={slab.slab.key}
                        className="flex items-center justify-center w-full bg-green-500 rounded aspect-square"
                        style={{ opacity }}
                        title={`Slab Key: ${slab.slab.key}`}
                      >
                        <span className="text-xs font-bold text-white">
                          {slab.slab.shards.length} shards
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  )
}

export default FileList

const SearchComponent = ({
  searchTerm,
  onSearchChange
}: {
  searchTerm: string
  onSearchChange: (searchTerm: string) => void
}) => {
  return (
    <form
      className="flex flex-col space-y-2 text-gray-300"
      onSubmit={(e) => {
        e.preventDefault()
        const data = new FormData(e.target as HTMLFormElement)
        onSearchChange(data.get("search") as string)
      }}
    >
      <Label htmlFor="search">Search</Label>
      <Input
        className="rounded bg-gray-950"
        id="search"
        name="search"
        type="text"
        placeholder="Enter search term"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </form>
  )
}

const getHealthColor = (health) => {
  if (health >= 0.8)
    return "bg-green-200 shadow-green-300 [box-shadow:0_0_10px_0_rgba(0,255,0,0.8)]"
  if (health >= 0.5)
    return "bg-yellow-200 shadow-yellow-300 [box-shadow:0_0_10px_0_rgba(255,255,0,0.5)]"
  return "bg-red-300 shadow-red-300 [box-shadow:0_0_10px_0_rgba(255,0,0,0.5)]"
}

const formatSize = (size) => {
  const units = ["B", "KB", "MB", "GB", "TB"]
  let index = 0
  let formattedSize = size

  while (formattedSize >= 1024 && index < units.length - 1) {
    formattedSize /= 1024
    index++
  }

  return `${formattedSize.toFixed(2)} ${units[index]}`
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(date)
}
