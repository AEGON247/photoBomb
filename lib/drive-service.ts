const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

// Use the Firebase API key for Google APIs. Alternatively, developers can specify a dedicated Google Drive API key.
const getApiKey = () => process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    thumbnailLink?: string;
    parents?: string[];
}

export const listFiles = async (query: string, pageSize: number = 100, pageToken?: string) => {
    const params = new URLSearchParams({
        q: query,
        fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, parents)',
        pageSize: pageSize.toString(),
        orderBy: 'folder,name',
        includeItemsFromAllDrives: 'true',
        supportsAllDrives: 'true',
        key: getApiKey() || '',
    });

    if (pageToken) {
        params.append('pageToken', pageToken);
    }

    const response = await fetch(`${DRIVE_API_BASE}/files?${params.toString()}`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Drive API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
};

export const getFileMetadata = async (fileId: string): Promise<DriveFile> => {
    const params = new URLSearchParams({
        fields: "id,name,mimeType,thumbnailLink,parents",
        includeItemsFromAllDrives: "true",
        supportsAllDrives: "true",
        key: getApiKey() || '',
    });

    const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}?${params.toString()}`, {
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        let errorData = "Unknown error";
        try {
            const errJson = await response.json();
            errorData = JSON.stringify(errJson);
        } catch (e) {
            errorData = await response.text();
        }
        throw new Error(`Drive API Error: ${response.status} ${response.statusText} - Details: ${errorData}`);
    }

    return response.json();
};

export const getFileContent = async (fileId: string) => {
    
    
    const response = await fetch(`/api/drive?fileId=${fileId}`);

    if (!response.ok) {
        throw new Error(`Drive Download Error: ${response.status}`);
    }

    return response.blob();
}

export const listChildren = async (folderId: string = 'root') => {
    // Only fetch folders and images
    const query = `'${folderId}' in parents and (mimeType = 'application/vnd.google-apps.folder' or mimeType contains 'image/') and trashed = false`;
    return listFiles(query, 100);
}
