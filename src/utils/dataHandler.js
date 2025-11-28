export const exportData = async (data) => {
    try {
        const jsonString = JSON.stringify(data);
        const stream = new Blob([jsonString], { type: 'application/json' }).stream();
        const compressedReadableStream = stream.pipeThrough(new CompressionStream('gzip'));
        const compressedResponse = await new Response(compressedReadableStream);
        const blob = await compressedResponse.blob();
        return blob;
    } catch (error) {
        console.error('Export failed:', error);
        throw error;
    }
};

export const importData = async (file) => {
    try {
        const stream = file.stream();
        const decompressedReadableStream = stream.pipeThrough(new DecompressionStream('gzip'));
        const decompressedResponse = await new Response(decompressedReadableStream);
        const json = await decompressedResponse.json();
        return json;
    } catch (error) {
        console.error('Import failed:', error);
        throw new Error('Invalid .chandu file or corrupted data');
    }
};
