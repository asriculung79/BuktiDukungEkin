import { DriveFolderInfo, DriveFileInfo, RHKItem } from '../types';

/**
 * Google Drive API Client for CloudEkin Pro
 * Handles folder management, direct file upload, public permission assignment,
 * and shareable link generation for e-Kinerja BKN / PMM.
 */

// Helper to check response and handle 401 token expiration
async function handleApiResponse(response: Response, actionDesc: string) {
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('TOKEN_EXPIRED: Sesi Google Drive telah berakhir. Silakan hubungkan ulang akun Google Anda.');
    }
    const errBody = await response.text();
    console.error(`Gagal ${actionDesc}:`, response.status, errBody);
    throw new Error(`Gagal ${actionDesc} (${response.status}): ${response.statusText}`);
  }
  return response.json();
}

/**
 * Make a Google Drive file or folder publicly accessible via link
 * This ensures assessors (atasan) in BKN won't hit "Akses Ditolak" (Access Denied).
 */
export async function makeFilePublic(accessToken: string, fileId: string): Promise<boolean> {
  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
        allowFileDiscovery: false,
      }),
    });
    if (!res.ok) {
      console.warn('Warning when setting public permission:', await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to set public permission:', err);
    return false;
  }
}

/**
 * Create a new folder in Google Drive
 */
export async function createDriveFolder(
  accessToken: string,
  folderName: string,
  parentFolderId?: string
): Promise<DriveFolderInfo> {
  const metadata: Record<string, any> = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  const data = await handleApiResponse(res, 'membuat folder Google Drive');

  // Ensure public link access for evaluators
  await makeFilePublic(accessToken, data.id);

  return {
    id: data.id,
    name: data.name,
    webViewLink: data.webViewLink || `https://drive.google.com/drive/folders/${data.id}?usp=sharing`,
    parentFolderId,
  };
}

/**
 * List files inside a specific Google Drive folder
 */
export async function listFilesInFolder(
  accessToken: string,
  folderId: string
): Promise<DriveFileInfo[]> {
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,size,webViewLink,createdTime)&orderBy=createdTime desc`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await handleApiResponse(res, 'mengambil daftar file folder');
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    size: f.size ? formatFileSize(parseInt(f.size, 10)) : undefined,
    webViewLink: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view?usp=sharing`,
    createdTime: f.createdTime,
  }));
}

/**
 * Upload a file directly to Google Drive via Multipart Upload
 */
export async function uploadFileToDrive(
  accessToken: string,
  file: File,
  folderId?: string,
  customFileName?: string,
  onProgress?: (percent: number) => void
): Promise<{ id: string; name: string; webViewLink: string; size: string }> {
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const fileName = customFileName || file.name;
  const metadata: Record<string, any> = {
    name: fileName,
    mimeType: file.type || 'application/octet-stream',
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  // Read file as ArrayBuffer
  const fileData = await file.arrayBuffer();

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
    metadata
  )}`;
  const fileHeaderPart = `${delimiter}Content-Type: ${metadata.mimeType}\r\n\r\n`;

  const metadataBlob = new Blob([metadataPart]);
  const fileHeaderBlob = new Blob([fileHeaderPart]);
  const closeBlob = new Blob([closeDelimiter]);

  const multipartBlob = new Blob([metadataBlob, fileHeaderBlob, fileData, closeBlob]);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      'POST',
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,size'
    );
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.setRequestHeader('Content-Type', `multipart/related; boundary=${boundary}`);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const resp = JSON.parse(xhr.responseText);
          // Set reader permissions for anyone with link
          await makeFilePublic(accessToken, resp.id);
          resolve({
            id: resp.id,
            name: resp.name,
            webViewLink: resp.webViewLink || `https://drive.google.com/file/d/${resp.id}/view?usp=sharing`,
            size: formatFileSize(file.size),
          });
        } catch (e) {
          reject(new Error('Gagal mengolah respons upload Google Drive.'));
        }
      } else if (xhr.status === 401) {
        reject(new Error('TOKEN_EXPIRED: Sesi login Google Drive kedaluwarsa.'));
      } else {
        reject(new Error(`Gagal mengunggah file (${xhr.status}): ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Terjadi kesalahan jaringan saat mengunggah file ke Google Drive.'));
    };

    xhr.send(multipartBlob);
  });
}

/**
 * Automate creation of entire e-Kinerja folder structure:
 * Root folder: 📁 E-KINERJA ASN [Tahun] - [Nama Pegawai]
 *   └── Sub-folders per RHK: 📁 RHK [No] - [Deskripsi RHK]
 */
export async function createFullEkinFolderStructure(
  accessToken: string,
  year: string,
  pegawaiName: string,
  rhkList: RHKItem[],
  onStatusUpdate?: (msg: string) => void
): Promise<{
  rootFolder: DriveFolderInfo;
  rhkFolderMap: Record<string, DriveFolderInfo>;
}> {
  onStatusUpdate?.('Membuat Folder Induk E-Kinerja...');
  const rootFolderName = `E-KINERJA ASN ${year || '2025'} - ${pegawaiName || 'Dokumen'}`;
  const rootFolder = await createDriveFolder(accessToken, rootFolderName);

  const rhkFolderMap: Record<string, DriveFolderInfo> = {};

  for (let i = 0; i < rhkList.length; i++) {
    const rhk = rhkList[i];
    const nama = rhk.namaRhk || (rhk as any).deskripsi || 'RHK';
    const cleanDeskripsi = nama.length > 35 ? nama.substring(0, 35) + '...' : nama;
    const folderName = `RHK ${rhk.nomor || i + 1} - ${cleanDeskripsi}`;
    onStatusUpdate?.(`Membuat folder ${folderName}...`);
    
    const subFolder = await createDriveFolder(accessToken, folderName, rootFolder.id);
    rhkFolderMap[rhk._id || (rhk as any).id || `rhk-${i}`] = subFolder;
  }

  onStatusUpdate?.('Semua folder Google Drive berhasil disinkronkan!');
  return { rootFolder, rhkFolderMap };
}

/**
 * Format bytes into human readable KB / MB
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Check if a Google Drive link is valid and format it cleanly
 */
export function sanitizeDriveLink(url: string): { isValid: boolean; normalizedUrl: string } {
  if (!url) return { isValid: false, normalizedUrl: '' };
  const trimmed = url.trim();
  const isDrive = trimmed.includes('drive.google.com');
  return {
    isValid: isDrive,
    normalizedUrl: trimmed,
  };
}
