import type React from "react"
import { useState } from "react"
import FileListViewer from "./FileListViewer.tsx"
import { files } from "./data.ts"
import "@fontsource-variable/jetbrains-mono"
import { Input } from "./components/ui/input.tsx"
import { Label } from "./components/ui/label.tsx"

const App: React.FC = () => {
  const [hash, setHash] = useState<string>("")
  const [showFileList, setShowFileList] = useState<boolean>(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Here you would typically fetch data based on the hash
    // For now, we'll just set showFileList to true
    setShowFileList(true)
  }

  return (
    <div className="w-full h-full min-h-screen p-4 mx-auto space-y-4 text-gray-200 bg-gray-950">
      <form
        onSubmit={handleSubmit}
        className="flex flex-row items-end max-w-sm gap-5 p-5 bg-gray-900"
      >
        <div>
          <Label>Enter Hash</Label>
          <Input
            type="text"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            placeholder="Enter hash"
          />
        </div>
        <button type="submit" className="h-10 px-4 py-2 rounded bg-emerald-500">
          Submit
        </button>
      </form>
      <div className="px-2">
        {showFileList && <FileListViewer files={files} />}
      </div>
    </div>
  )
}

export default App
