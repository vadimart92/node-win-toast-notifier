import path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';

export function downloadFile(
    imageUrl: string,
    cacheFolder: string,
    cacheTimeSeconds: number
): Promise<string> {
    const cachedFileName = Buffer.from(imageUrl).toString('base64');
    if (!fs.existsSync(cacheFolder)){
        fs.mkdirSync(cacheFolder);
    }
    const cachedFilePath = path.join(cacheFolder, cachedFileName);
    const download = function (resolve: (name: string) => void) {
        const file = fs.createWriteStream(cachedFilePath);
        function innerDownload(url: string, resolve: (name: string) => void) {
            const client = url.startsWith('https') ? https : http;
            client.get(url, (response) => {
                if ([301, 302].includes(<number>response.statusCode) && response.headers.location) {
                    innerDownload(response.headers.location, resolve);
                    return
                }
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(cachedFilePath);
                });
            });
        }
        innerDownload(imageUrl, resolve);
    };
    return new Promise<string>((resolve, reject) => {
        try {
            if (!fs.existsSync(cachedFilePath)) {
                download(resolve);
            } else {
                const fileStat = fs.statSync(cachedFilePath);
                const currentTime = new Date().getTime();
                const imageModifiedTime = new Date(fileStat.mtime).getTime();
                if (currentTime - imageModifiedTime > cacheTimeSeconds * 1000) {
                    download(resolve);
                } else {
                    resolve(cachedFilePath);
                }
            }
        } catch (error) {
            reject(error);
        }
    });
}
