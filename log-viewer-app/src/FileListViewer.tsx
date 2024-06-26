import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion"
import {Label} from "@radix-ui/react-label"
import {useState} from "react"
import {Input} from "./components/ui/input"
import {cn} from "./lib/utils"

const FileList = ({ files }: { files: any[] }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const filteredFiles = files.filter((file) =>
    file.key.toLowerCase().includes(searchTerm.toLowerCase()) || JSON.stringify(file.value).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm)
  }

  return (
    <>
      <SearchComponent searchTerm={searchTerm} onSearchChange={handleSearch} />
      <Accordion type="multiple" className="my-4 space-y-3">
        {filteredFiles.map((file, index) => {
            file.value.health = file.value.slabs.reduce((acc: any, slab: { slab: { health: any } }) => {
                return acc + slab.slab.health
            }, 0) / file.value.slabs.length

            return (
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
                                        file.value.health
                                    )}`}
                                />
                                <span className="ml-10 text-gray-200">{file.key}</span>
                            </div>
                            <span className="w-24 mr-10 text-gray-400">
                      {formatSize(file.value.size)}
                    </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-2 text-gray-400">
                        <p>
                            <span className="font-semibold text-gray-300">eTag:</span>{" "}
                            {file.value.eTag}
                        </p>
                        <p>
                            <span className="font-semibold text-gray-300">Key:</span>{" "}
                            {file.value.key}
                        </p>
                        <p>
                            <span className="font-semibold text-gray-300">MIME Type:</span>{" "}
                            {file.value.mimeType}
                        </p>
                        <div className="p-4 mt-2 bg-gray-800/50">
                            <h4 className="mb-2 text-gray-300">
                                Slabs: {file.value.slabs.length}
                            </h4>
                            <div className="grid grid-cols-10 gap-2">
                                {file.value.slabs?.map((slab) => {
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
                                            style={{opacity}}
                                            title={`Slab Key: ${slab.slab.key}`}
                                        >
                            <span className="text-xs font-bold text-white">
                              {slab.slab.shards?.length} shards
                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            );
        })}
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
