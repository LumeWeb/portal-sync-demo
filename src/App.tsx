import FileListViewer from "./FileListViewer.tsx"
import { files } from "./data.ts"
import "@fontsource-variable/jetbrains-mono"

function App() {
  // add the code to load the stuff here derrick, just past it inside to FileListViewer and it will handle
  // all the search from the inside. Focus on doing the fetch thats all. It is expecting an Array of files,
  // the files variable is just a placeholder for now and see im using Object.values to transform it into an
  // array

  // Kudos! - @ditorodev
  return (
    <div className="w-full h-full min-h-screen p-4 mx-auto space-y-4 text-gray-200 bg-gray-950">
      <FileListViewer files={files} />
    </div>
  )
}

export default App
