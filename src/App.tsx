import type React from "react"
import {useState} from "react"
import FileListViewer from "./FileListViewer.tsx"
import "@fontsource-variable/jetbrains-mono"
import {Input} from "./components/ui/input.tsx"
import {Label} from "./components/ui/label.tsx"
import {LoadingSpinner} from "./components/ui/loading-spinner.tsx";

const showErrorDialog = (message: string) => {
    // @ts-ignore
    window?.backend?.openDialog('showErrorBox', ["Error", message]);
};

const App: React.FC = () => {
    const [hash, setHash] = useState<string>("")
    const [showFileList, setShowFileList] = useState<boolean>(false)
    const [showSpinner, setShowSpinner] = useState<boolean>(false)
    const [files, setFiles] = useState<any[]>([])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setShowSpinner(true)
        await process()
        setShowSpinner(false)
    }

    const process = async () => {
        try {
            //@ts-ignore
            let data = (await window?.backend?.loadLog(hash)) as { key: string, value: string }[]
            data.map((item) => {
                item.value = JSON.parse(item.value)
                return item
            })
            setFiles(data)
            setShowFileList(true)
        } catch (e) {
            console.error("Error loading data:", e);
            showErrorDialog("Failed to load data. Please try again.");
        }
    }

    return (
        <div className="w-full h-full min-h-screen p-4 mx-auto space-y-4 text-gray-200 bg-gray-950">
            {showSpinner && <LoadingSpinner/>}
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
                {showFileList && <FileListViewer files={files}/>}
            </div>
        </div>
    )
}

export default App
