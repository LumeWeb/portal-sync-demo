import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export const LogViewer = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [loadedData, setLoadedData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dataKey, setDataKey] = useState("");

    const handleLoadData = async (key: string) => {
        setIsLoading(true);
        try {
            const data = await loadDataFromNetwork(key);
            setLoadedData(data);
        } catch (error) {
            console.error("Error loading data:", error);
            showErrorDialog("Failed to load data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const showErrorDialog = (message: string) => {
        // @ts-ignore
        window?.backend?.openDialog('showErrorBox', ["Error", message]);
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleDataKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDataKey(event.target.value);
    };

    const handleDataKeyKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleLoadData(dataKey);
        }
    };

    const filteredData = loadedData.filter((item) =>
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
        <div>
            <div>
                <input
                    type="text"
                    placeholder="Enter data key (hash)"
                    value={dataKey}
                    onChange={handleDataKeyChange}
                    onKeyDown={handleDataKeyKeyDown}
                />
                {isLoading && <div>Loading data...</div>}
            </div>
            {loadedData.length > 0 && (
                <>
                    <input
                        type="text"
                        placeholder="Search within data"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Key</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Parsed Metadata</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.key}</TableCell>
                                    <TableCell>{item.value}</TableCell>
                                    <TableCell>
                                        <ParsedMetadataTable metadata={JSON.parse(item.value)} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </>
            )}
        </div>
    );
};

const ParsedMetadataTable = ({ metadata }) => {
    const formatJSON = (jsonString) => {
        try {
            const jsonData = JSON.parse(jsonString);
            return (
                <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                    {JSON.stringify(jsonData, null, 2)}
                </pre>
            );
        } catch (error) {
            return <pre>{jsonString}</pre>; // Render the original string if parsing fails
        }
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Hash</TableHead>
                    <TableHead>Proof</TableHead>
                    <TableHead>Protocol</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Slabs</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell>{metadata.hash}</TableCell>
                    <TableCell>{formatJSON(metadata.proof)}</TableCell>
                    <TableCell>{metadata.protocol}</TableCell>
                    <TableCell>{metadata.key}</TableCell>
                    <TableCell>{metadata.size}</TableCell>
                    <TableCell>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Key</TableHead>
                                    <TableHead>Health</TableHead>
                                    <TableHead>Min Shards</TableHead>
                                    <TableHead>Shards</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {metadata.slabs?.map((slab, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{slab.slab.key}</TableCell>
                                        <TableCell>{slab.slab.health}</TableCell>
                                        <TableCell>{slab.slab.minShards}</TableCell>
                                        <TableCell>
                                            {slab.slab.shards?.map((shard, shardIndex) => (
                                                <div key={shardIndex}>
                                                    <strong>Shard {shardIndex + 1}</strong>
                                                    <p>Latest Host: {shard.latestHost}</p>
                                                    <p>Root: {shard.root}</p>
                                                    <p>Contracts: {Object.keys(shard.contracts).join(", ")}</p>
                                                </div>
                                            )) || <p>No shards found.</p>}
                                        </TableCell>
                                    </TableRow>
                                )) || <TableRow><TableCell colSpan={4}>No slabs found.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
};

// This is a placeholder function that you need to replace with the actual logic
// to load the data from the P2P network using the provided key
const loadDataFromNetwork = async (key) => {
    // @ts-ignore
    return window?.backend?.loadLog(key);
};
