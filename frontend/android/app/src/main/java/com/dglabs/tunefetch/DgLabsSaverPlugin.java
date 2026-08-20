package com.dglabs.tunefetch;

import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.ContentValues;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

@CapacitorPlugin(name = "DgLabsSaver")
public class DgLabsSaverPlugin extends Plugin {

    private static final String FOLDER_NAME = "DgLabs";

    @PluginMethod
    public void saveAudioFile(PluginCall call) {
        String fileName = call.getString("fileName");
        String data = call.getString("data");

        if (fileName == null || fileName.isEmpty() || data == null || data.isEmpty()) {
            call.reject("fileName and data are required");
            return;
        }

        try {
            byte[] bytes = Base64.decode(data, Base64.DEFAULT);
            SaveResult saved = saveToDgLabsFolder(fileName, bytes);
            JSObject result = new JSObject();
            result.put("path", saved.path);
            result.put("uri", saved.uri == null ? "" : saved.uri);
            call.resolve(result);
        } catch (Exception ex) {
            call.reject("Failed to save audio file: " + ex.getMessage(), ex);
        }
    }

    @PluginMethod
    public void readAudioFile(PluginCall call) {
        String uriString = call.getString("uri");
        String path = call.getString("path");
        String fileName = call.getString("fileName");

        try {
            byte[] bytes = null;
            if (uriString != null && !uriString.isEmpty() && uriString.startsWith("content:")) {
                bytes = readAll(getContext().getContentResolver().openInputStream(Uri.parse(uriString)));
            } else if (path != null && path.startsWith("/")) {
                bytes = readAll(new FileInputStream(new File(path)));
            } else if (fileName != null && !fileName.isEmpty()) {
                bytes = readFromDownloads(fileName);
            }

            if (bytes == null) {
                call.reject("Audio file not found");
                return;
            }

            JSObject result = new JSObject();
            result.put("data", Base64.encodeToString(bytes, Base64.NO_WRAP));
            call.resolve(result);
        } catch (Exception ex) {
            call.reject("Failed to read audio file: " + ex.getMessage(), ex);
        }
    }

    private SaveResult saveToDgLabsFolder(String fileName, byte[] bytes) throws Exception {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            return saveWithMediaStore(fileName, bytes);
        }
        return saveWithLegacyFilesystem(fileName, bytes);
    }

    private SaveResult saveWithMediaStore(String fileName, byte[] bytes) throws Exception {
        ContentResolver resolver = getContext().getContentResolver();
        ContentValues values = new ContentValues();
        values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
        values.put(MediaStore.Downloads.MIME_TYPE, "audio/mpeg");
        values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/" + FOLDER_NAME);
        values.put(MediaStore.Downloads.IS_PENDING, 1);

        Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
        if (uri == null) {
            throw new Exception("MediaStore insert returned null");
        }

        try (OutputStream output = resolver.openOutputStream(uri)) {
            if (output == null) {
                throw new Exception("Unable to open output stream");
            }
            output.write(bytes);
        } catch (Exception ex) {
            resolver.delete(uri, null, null);
            throw ex;
        }

        values.clear();
        values.put(MediaStore.Downloads.IS_PENDING, 0);
        resolver.update(uri, values, null, null);

        return new SaveResult(
            Environment.DIRECTORY_DOWNLOADS + "/" + FOLDER_NAME + "/" + fileName,
            uri.toString()
        );
    }

    private SaveResult saveWithLegacyFilesystem(String fileName, byte[] bytes) throws Exception {
        File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
        File targetDir = new File(downloadsDir, FOLDER_NAME);
        if (!targetDir.exists() && !targetDir.mkdirs()) {
            throw new Exception("Unable to create DgLabs folder");
        }

        File targetFile = new File(targetDir, fileName);
        try (FileOutputStream output = new FileOutputStream(targetFile)) {
            output.write(bytes);
        }

        return new SaveResult(targetFile.getAbsolutePath(), null);
    }

    private byte[] readFromDownloads(String fileName) throws Exception {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentResolver resolver = getContext().getContentResolver();
            Uri collection = MediaStore.Downloads.EXTERNAL_CONTENT_URI;
            String[] projection = { MediaStore.Downloads._ID };
            String selection = MediaStore.Downloads.DISPLAY_NAME + "=?";
            try (Cursor cursor = resolver.query(collection, projection, selection, new String[]{ fileName }, null)) {
                if (cursor != null && cursor.moveToFirst()) {
                    long id = cursor.getLong(0);
                    Uri uri = ContentUris.withAppendedId(collection, id);
                    return readAll(resolver.openInputStream(uri));
                }
            }
        }

        File file = new File(
            Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
            FOLDER_NAME + "/" + fileName
        );
        if (file.exists()) {
            return readAll(new FileInputStream(file));
        }
        throw new Exception("File not found");
    }

    private byte[] readAll(InputStream input) throws Exception {
        if (input == null) {
            throw new Exception("Unable to open input stream");
        }
        try (InputStream stream = input; ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192];
            int read;
            while ((read = stream.read(buffer)) != -1) {
                output.write(buffer, 0, read);
            }
            return output.toByteArray();
        }
    }

    private static class SaveResult {
        final String path;
        final String uri;

        SaveResult(String path, String uri) {
            this.path = path;
            this.uri = uri;
        }
    }
}
