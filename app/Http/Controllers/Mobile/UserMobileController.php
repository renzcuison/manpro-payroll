<?php

namespace App\Http\Controllers\Mobile;

use App\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class UserMobileController extends Controller
{   
    
    public function uploadProfilePicture(Request $request, $id)
    {
        Log::info('Storing Profile Picture');
        try
        {
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg',
                // Add other validations for other fields if necessary
            ]);

            // Get the uploaded file
            $uploadedFile = $request->file('image');
            
            // Get the file extension of the uploaded file
            $extension = $uploadedFile->getClientOriginalExtension();

            $filename = 'profile_picture_' . $id . '.' . $extension;

            Log::info('filename: '. $filename);
    
            // Store the image file in storage/app/public/profilePictures directory
            Storage::disk('public')->putFileAs('', $uploadedFile, $filename);

            $user = User::where('user_id', $id)->firstOrFail();
            $user->profile_pic = $filename;
            $user->save();

            return response()->json([
                'message' => 'Profile picture uploaded and linked to user successfully.',
                'filename' => $filename,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in uploadProfilePicture', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'An error occurred while storing the profile picture.',
            ], 500);
        }
    }    

    public function updateUserDetails(Request $request, $id)
    {
        Log::info('Updating user details');
        Log::info('Request data:', $request->all());
        try {
            // Validate incoming request data
            $request->validate([
                'email' => 'required|email',
                'username' => 'required|string',
                'fname' => 'required|string',
                'mname' => 'nullable|string',
                'lname' => 'required|string',
                'bdate' => 'required|date',
                'address' => 'nullable|string',
                'contact_number' => 'nullable|string',
            ]);

            // Retrieve the user by ID
            $user = User::where('user_id', $id)->firstOrFail();

            // Update user attributes
            $user->email = $request->input('email');
            $user->username = $request->input('username');
            $user->fname = $request->input('fname');
            $user->mname = $request->input('mname');
            $user->lname = $request->input('lname');
            $user->bdate = $request->input('bdate');
            $user->address = $request->input('address');
            $user->contact_number = $request->input('contact_number');

            // Save the updated user details
            $user->save();

            return response()->json([
                'message' => 'User details updated successfully.',
                'user' => $user,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error updating user details: '.$e->getMessage());

            return response()->json([
                'error' => 'Failed to update user details.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}