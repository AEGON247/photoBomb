
const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    thumbnailLink?: string;
    parents?: string[];
}

export const listFiles = async (accessToken: string, query: string, pageSize: number = 100, pageToken?: string) => {
    const params = new URLSearchParams({
        q: query,
        fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, parents)',
        pageSize: pageSize.toString(),
        orderBy: 'folder,name',
        includeItemsFromAllDrives: 'true',
        supportsAllDrives: 'true',
    });

    if (pageToken) {
        params.append('pageToken', pageToken);
    }

    const response = await fetch(`${DRIVE_API_BASE}/files?${params.toString()}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Drive API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
};

export const getFileMetadata = async (accessToken: string, fileId: string): Promise<DriveFile> => {
    const params = new URLSearchParams({
        fields: "id,name,mimeType,thumbnailLink,parents",
        includeItemsFromAllDrives: "true",
        supportsAllDrives: "true",
    });

    const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}?${params.toString()}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
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

export const getFileContent = async (accessToken: string, fileId: string) => {
    const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Drive Download Error: ${response.status}`);
    }

    return response.blob();
}


export const listChildren = async (accessToken: string, folderId: string = 'root') => {
    
    const query = `'${folderId}' in parents and (mimeType = 'application/vnd.google-apps.folder' or mimeType contains 'image/') and trashed = false`;
    return listFiles(accessToken, query, 100);
}
