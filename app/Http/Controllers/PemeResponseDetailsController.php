<?php

namespace App\Http\Controllers;

use App\Models\PemeResponseDetails;
use App\Models\PemeQType;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;

class PemeResponseDetailsController extends Controller
{
    public function checkUser()
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->user_type == "Admin") {
                return true;
            }
        }
        return false;
    }

    public function download($id)
    {
        try {
            $mediaId = Crypt::decrypt($id);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid file ID.'], 400);
        }

        $media = Media::findOrFail($mediaId);
        $path = $media->getPath();

        if (!file_exists($path)) {
            return response()->json(['message' => 'File not found on disk.'], 404);
        }

        return response()->download($path, $media->file_name, [
            'Content-Type' => mime_content_type($path),
            'Content-Disposition' => 'attachment; filename="' . $media->file_name . '"',
        ]);
    }
}