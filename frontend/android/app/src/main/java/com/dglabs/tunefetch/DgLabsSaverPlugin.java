package com.dglabs.tunefetch;

import android.content.ContentResolver;
import android.content.ContentValues;
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

import java.io.File;
import java.io.FileOutputStream;
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
            String savedPath = saveToDgLabsFolder(fileName, bytes);
            JSObject result = new JSObject();
            result.put("path", savedPath);
            call.resolve(result);
        } catch (Exception ex) {
            call.reject("Failed to save audio file: " + ex.getMessage(), ex);
        }
    }

    private String saveToDgLabsFolder(String fileName, byte[] bytes) throws Exception {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            return saveWithMediaStore(fileName, bytes);
        }
        return saveWithLegacyFilesystem(fileName, bytes);
    }

    private String saveWithMediaStore(String fileName, byte[] bytes) throws Exception {
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

        return Environment.DIRECTORY_DOWNLOADS + "/" + FOLDER_NAME + "/" + fileName;
    }

    private String saveWithLegacyFilesystem(String fileName, byte[] bytes) throws Exception {
        File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
        File targetDir = new File(downloadsDir, FOLDER_NAME);
        if (!targetDir.exists() && !targetDir.mkdirs()) {
            throw new Exception("Unable to create DgLabs folder");
        }

        File targetFile = new File(targetDir, fileName);
        try (FileOutputStream output = new FileOutputStream(targetFile)) {
            output.write(bytes);
        }

        return targetFile.getAbsolutePath();
    }
}
